<?php

namespace App\Services;

use App\Models\User;
use App\Models\Plan;
use App\Models\UserProfile;
use App\Jobs\GeneratePlanJob;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * PlanGeneratorService
 * 
 * Handles all plan generation-related business logic.
 * Manages when plans should be generated and prepares data for OpenAI.
 */
class PlanGeneratorService
{
    /**
     * Generate initial plan for a user.
     * 
     * This is triggered right after questionnaire completion.
     * Plan starts on the first Monday after signup.
     * Plan ends on the Sunday before the first Monday of the next month.
     *
     * @param User $user
     * @return Plan
     * @throws \Exception
     */
    public function generateInitialPlan(User $user): Plan
    {
        if (!$user->profile || !$user->profile->questionnaire_completed) {
            throw new \Exception('User questionnaire must be completed before generating initial plan');
        }

        // Calculate start date: First Monday after signup
        $startDate = $this->getNextMonday(Carbon::now());
        
        // Calculate end date: Sunday before the first Monday of the next month
        $endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

        $plan = Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'initial',
            'status' => 'pending',
            'content' => [],
        ]);

        // Dispatch job to generate plan asynchronously
        GeneratePlanJob::dispatch($plan, 'initial');

        return $plan;
    }

    /**
     * Generate monthly plan for a user.
     * 
     * This is triggered automatically every first Monday of the month.
     * Uses full user profile + plan history.
     *
     * @param User $user
     * @return Plan
     * @throws \Exception
     */
    public function generateMonthlyPlan(User $user): Plan
    {
        if (!$user->profile || !$user->profile->questionnaire_completed) {
            throw new \Exception('User questionnaire must be completed before generating monthly plan');
        }

        // Get the first Monday of current month
        $startDate = $this->getFirstMondayOfMonth(Carbon::now());
        
        // Calculate end date: Sunday before the first Monday of the next month
        $endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

        // Check if plan already exists for this period
        $existingPlan = Plan::where('user_id', $user->id)
            ->where('start_date', $startDate)
            ->where('type', 'monthly')
            ->first();

        if ($existingPlan) {
            throw new \Exception('Monthly plan already exists for this period');
        }

        $plan = Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'monthly',
            'status' => 'pending',
            'content' => [],
        ]);

        // Dispatch job to generate plan asynchronously
        GeneratePlanJob::dispatch($plan, 'monthly');

        return $plan;
    }

    /**
     * Get the next Monday from a given date.
     *
     * @param Carbon $date
     * @return Carbon
     */
    private function getNextMonday(Carbon $date): Carbon
    {
        $date = $date->copy();
        
        // If today is Monday, start next Monday
        if ($date->dayOfWeek === Carbon::MONDAY) {
            return $date->next(Carbon::MONDAY);
        }
        
        return $date->next(Carbon::MONDAY);
    }

    /**
     * Get the first Monday of the current month.
     *
     * @param Carbon $date
     * @return Carbon
     */
    private function getFirstMondayOfMonth(Carbon $date): Carbon
    {
        $firstOfMonth = $date->copy()->firstOfMonth();
        
        // Find the first Monday of the month
        while ($firstOfMonth->dayOfWeek !== Carbon::MONDAY) {
            $firstOfMonth->addDay();
        }
        
        return $firstOfMonth;
    }

    /**
     * Get the Sunday before the first Monday of the next month.
     *
     * @param Carbon $startDate
     * @return Carbon
     */
    private function getSundayBeforeNextMonthFirstMonday(Carbon $startDate): Carbon
    {
        $nextMonth = $startDate->copy()->addMonth()->firstOfMonth();
        $firstMondayNextMonth = $this->getFirstMondayOfMonth($nextMonth);
        
        // Get the Sunday before that Monday
        return $firstMondayNextMonth->copy()->subDay();
    }

    /**
     * Build the OpenAI prompt for plan generation.
     *
     * @param Plan $plan
     * @param string $type 'initial' or 'monthly'
     * @return string
     */
    public function buildPrompt(Plan $plan, string $type): string
    {
        $user = $plan->user;
        $profile = $user->profile;

        if ($type === 'initial') {
            return $this->buildInitialPrompt($profile, $plan);
        } else {
            return $this->buildMonthlyPrompt($user, $profile, $plan);
        }
    }

    /**
     * Build initial plan prompt.
     *
     * @param UserProfile $profile
     * @param Plan $plan
     * @return string
     */
    private function buildInitialPrompt(UserProfile $profile, Plan $plan): string
    {
        $prompt = "Plan Initial\n\n";
        $prompt .= "Génère un plan d'entraînement personnalisé pour la course à pied.\n\n";
        $prompt .= "Informations du coureur:\n";
        $prompt .= "- Nom: {$profile->first_name} {$profile->last_name}\n";
        $prompt .= "- Date de naissance: {$profile->birth_date}\n";
        $prompt .= "- Genre: {$profile->gender}\n";
        $prompt .= "- Taille: {$profile->height_cm} cm\n";
        $prompt .= "- Poids: {$profile->weight_kg} kg\n";
        $prompt .= "- Expérience: {$profile->running_experience}\n";
        $prompt .= "- Fréquence hebdomadaire disponible: {$profile->weekly_frequency} jours/semaine\n";
        $prompt .= "- Rythme moyen: {$profile->average_pace_min_per_km} min/km\n";
        $prompt .= "- Plus longue course: {$profile->longest_run_km} km\n";
        $prompt .= "- Objectif principal: {$profile->primary_goal}\n";
        
        if ($profile->target_race_date) {
            $prompt .= "- Date de course cible: {$profile->target_race_date}\n";
        }
        
        if ($profile->injuries) {
            $prompt .= "- Blessures/Limitations: " . json_encode($profile->injuries, JSON_UNESCAPED_UNICODE) . "\n";
        }
        
        if ($profile->preferences) {
            $prompt .= "- Préférences: " . json_encode($profile->preferences, JSON_UNESCAPED_UNICODE) . "\n";
        }
        
        $prompt .= "\nPériode du plan:\n";
        $prompt .= "- Date de début: {$plan->start_date->format('Y-m-d')}\n";
        $prompt .= "- Date de fin: {$plan->end_date->format('Y-m-d')}\n";
        
        $prompt .= "\nGénère un plan d'entraînement détaillé au format JSON avec une structure hebdomadaire.";
        $prompt .= "Inclus les distances, les rythmes, les types d'entraînement (endurance, fractionné, récupération), et les conseils personnalisés.";

        return $prompt;
    }

    /**
     * Build monthly plan prompt.
     *
     * @param User $user
     * @param UserProfile $profile
     * @param Plan $plan
     * @return string
     */
    private function buildMonthlyPrompt(User $user, UserProfile $profile, Plan $plan): string
    {
        $prompt = "Mise à jour mensuelle\n\n";
        $prompt .= "Génère une mise à jour mensuelle du plan d'entraînement pour la course à pied.\n\n";
        
        $prompt .= "Informations du coureur:\n";
        $prompt .= "- Nom: {$profile->first_name} {$profile->last_name}\n";
        $prompt .= "- Date de naissance: {$profile->birth_date}\n";
        $prompt .= "- Genre: {$profile->gender}\n";
        $prompt .= "- Taille: {$profile->height_cm} cm\n";
        $prompt .= "- Poids: {$profile->weight_kg} kg\n";
        $prompt .= "- Expérience: {$profile->running_experience}\n";
        $prompt .= "- Fréquence hebdomadaire disponible: {$profile->weekly_frequency} jours/semaine\n";
        $prompt .= "- Rythme moyen: {$profile->average_pace_min_per_km} min/km\n";
        $prompt .= "- Plus longue course: {$profile->longest_run_km} km\n";
        $prompt .= "- Objectif principal: {$profile->primary_goal}\n";
        
        // Get previous plans for context
        $previousPlans = Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('start_date', 'desc')
            ->limit(3)
            ->get();
        
        if ($previousPlans->isNotEmpty()) {
            $prompt .= "\nHistorique des plans précédents:\n";
            foreach ($previousPlans as $prevPlan) {
                $prompt .= "- Plan {$prevPlan->type} du {$prevPlan->start_date->format('Y-m-d')} au {$prevPlan->end_date->format('Y-m-d')}\n";
            }
        }
        
        $prompt .= "\nPériode du nouveau plan:\n";
        $prompt .= "- Date de début: {$plan->start_date->format('Y-m-d')}\n";
        $prompt .= "- Date de fin: {$plan->end_date->format('Y-m-d')}\n";
        
        $prompt .= "\nGénère un plan d'entraînement mis à jour au format JSON, en tenant compte de la progression du coureur.";
        $prompt .= "Adapte l'intensité et la progression en fonction de l'historique. Inclus les distances, les rythmes, les types d'entraînement et les conseils personnalisés.";

        return $prompt;
    }

    /**
     * Get user's active plan.
     *
     * @param User $user
     * @return Plan|null
     */
    public function getActivePlan(User $user): ?Plan
    {
        $today = Carbon::today();

        return Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderBy('start_date', 'desc')
            ->first();
    }

    /**
     * Get all user's plans.
     *
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserPlans(User $user)
    {
        return Plan::where('user_id', $user->id)
            ->orderBy('start_date', 'desc')
            ->get();
    }
}

