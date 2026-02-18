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
     * All days of the week in French
     */
    private const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    private const DAY_NAMES_FR = [
        'monday' => 'Lundi',
        'tuesday' => 'Mardi',
        'wednesday' => 'Mercredi',
        'thursday' => 'Jeudi',
        'friday' => 'Vendredi',
        'saturday' => 'Samedi',
        'sunday' => 'Dimanche',
    ];

    /**
     * Generate initial plan for a user.
     *
     * This is triggered right after subscription payment.
     * Plan starts on the first Monday after payment.
     * Plan always covers 4 full weeks (28 days) from the start date.
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

        // Calculate start date: First Monday after today
        $startDate = $this->getNextMonday(Carbon::now());

        // Calculate end date: Always 4 full weeks (28 days) from start date
        // This guarantees every subscriber gets a full plan regardless of when in the month they sign up
        $endDate = $startDate->copy()->addWeeks(4)->subDay();

        $plan = Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'initial',
            'status' => 'pending',
            'content' => [],
        ]);

        Log::info('Initial plan created', [
            'plan_id' => $plan->id,
            'user_id' => $user->id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
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

        // Get the first Monday of current month (today, since cron runs on first Monday)
        $startDate = Carbon::now()->startOfDay();

        // If today is not Monday, get the first Monday of the month
        if ($startDate->dayOfWeek !== Carbon::MONDAY) {
            $startDate = $this->getFirstMondayOfMonth(Carbon::now());
        }

        // Calculate end date: Sunday before the first Monday of the next month
        $endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

        // Check if plan already exists for this period
        $existingPlan = Plan::where('user_id', $user->id)
            ->where('start_date', $startDate)
            ->first();

        if ($existingPlan) {
            throw new \Exception('Plan already exists for this period');
        }

        $plan = Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'monthly',
            'status' => 'pending',
            'content' => [],
        ]);

        Log::info('Monthly plan created', [
            'plan_id' => $plan->id,
            'user_id' => $user->id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
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
        $date = $date->copy()->startOfDay();

        // Always get next Monday (even if today is Monday)
        return $date->next(Carbon::MONDAY);
    }

    /**
     * Get the first Monday of the given month.
     *
     * @param Carbon $date
     * @return Carbon
     */
    private function getFirstMondayOfMonth(Carbon $date): Carbon
    {
        $firstOfMonth = $date->copy()->firstOfMonth();

        // If first day is Monday, return it
        if ($firstOfMonth->dayOfWeek === Carbon::MONDAY) {
            return $firstOfMonth;
        }

        // Otherwise find the first Monday
        return $firstOfMonth->next(Carbon::MONDAY);
    }

    /**
     * Get the Sunday before the first Monday of the next month.
     *
     * @param Carbon $startDate
     * @return Carbon
     */
    private function getSundayBeforeNextMonthFirstMonday(Carbon $startDate): Carbon
    {
        // Go to next month
        $nextMonth = $startDate->copy()->addMonth()->firstOfMonth();

        // Find first Monday of next month
        $firstMondayNextMonth = $nextMonth->dayOfWeek === Carbon::MONDAY
            ? $nextMonth
            : $nextMonth->next(Carbon::MONDAY);

        // Get the Sunday before that Monday
        return $firstMondayNextMonth->copy()->subDay();
    }

    /**
     * Calculate weeks for the plan period.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function calculateWeeks(Carbon $startDate, Carbon $endDate): array
    {
        $weeks = [];
        $currentMonday = $startDate->copy();
        $weekNumber = 1;

        while ($currentMonday->lte($endDate)) {
            $weekEnd = $currentMonday->copy()->endOfWeek(Carbon::SUNDAY);

            // Don't go past the end date
            if ($weekEnd->gt($endDate)) {
                $weekEnd = $endDate->copy();
            }

            $days = [];
            $currentDay = $currentMonday->copy();

            while ($currentDay->lte($weekEnd)) {
                $days[] = [
                    'day_name' => self::DAY_NAMES_FR[strtolower($currentDay->englishDayOfWeek)],
                    'date' => $currentDay->format('d/m'),
                    'date_iso' => $currentDay->format('Y-m-d'),
                ];
                $currentDay->addDay();
            }

            $weeks[] = [
                'week_number' => $weekNumber,
                'start_date' => $currentMonday->format('d/m'),
                'end_date' => $weekEnd->format('d/m'),
                'start_date_iso' => $currentMonday->format('Y-m-d'),
                'end_date_iso' => $weekEnd->format('Y-m-d'),
                'days' => $days,
            ];

            $currentMonday->addWeek();
            $weekNumber++;
        }

        return $weeks;
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
     * Get unavailable days from available days.
     *
     * @param array|null $availableDays
     * @return array
     */
    private function getUnavailableDays(?array $availableDays): array
    {
        if (empty($availableDays)) {
            return [];
        }

        $unavailable = [];
        foreach (self::ALL_DAYS as $day) {
            if (!in_array($day, $availableDays)) {
                $unavailable[] = self::DAY_NAMES_FR[$day];
            }
        }

        return $unavailable;
    }

    /**
     * Format available days to French.
     *
     * @param array|null $availableDays
     * @return string
     */
    private function formatAvailableDaysFr(?array $availableDays): string
    {
        if (empty($availableDays)) {
            return 'Non renseigné';
        }

        $frDays = array_map(fn($day) => self::DAY_NAMES_FR[$day] ?? $day, $availableDays);
        return implode(', ', $frDays);
    }

    /**
     * Calculate age from birth date.
     *
     * @param mixed $birthDate
     * @return int|null
     */
    private function calculateAge($birthDate): ?int
    {
        if (!$birthDate) {
            return null;
        }

        if (!$birthDate instanceof Carbon) {
            $birthDate = Carbon::parse($birthDate);
        }

        return $birthDate->age;
    }

    /**
     * Format gender to French.
     *
     * @param string|null $gender
     * @return string
     */
    private function formatGenderFr(?string $gender): string
    {
        return match ($gender) {
            'male' => 'Homme',
            'female' => 'Femme',
            'other' => 'Autre',
            default => 'Non renseigné',
        };
    }

    /**
     * Format primary goal to French.
     *
     * @param string|null $goal
     * @param string|null $goalOther
     * @return string
     */
    private function formatPrimaryGoalFr(?string $goal, ?string $goalOther): string
    {
        $goals = [
            'me_lancer' => 'Commencer la course à pied',
            'reprendre' => 'Reprendre la course à pied',
            'entretenir' => 'Entretenir ma forme',
            'ameliorer_condition' => 'Améliorer ma condition physique générale',
            'courir_race' => 'Préparer une course',
            'ameliorer_chrono' => 'Améliorer mon chrono',
            'autre' => $goalOther ?? 'Autre',
        ];

        return $goals[$goal] ?? 'Non renseigné';
    }

    /**
     * Format race distance to French.
     *
     * @param string|null $distance
     * @param string|null $distanceOther
     * @return string
     */
    private function formatRaceDistanceFr(?string $distance, ?string $distanceOther): string
    {
        if (!$distance) {
            return 'Non renseigné';
        }

        $distances = [
            '5km' => '5 km',
            '10km' => '10 km',
            'semi_marathon' => 'Semi-marathon',
            'marathon' => 'Marathon',
            'autre' => $distanceOther ?? 'Autre distance',
        ];

        return $distances[$distance] ?? $distance;
    }

    /**
     * Format experience level to French.
     *
     * @param UserProfile $profile
     * @return string
     */
    private function formatExperienceFr(UserProfile $profile): string
    {
        $period = $profile->running_experience_period;

        $levels = [
            'je_commence' => 'Débutant (je commence)',
            '1_4_semaines' => $profile->running_experience_weeks ? "{$profile->running_experience_weeks} semaines" : '1 à 4 semaines',
            '1_11_mois' => $profile->running_experience_months ? "{$profile->running_experience_months} mois" : '1 à 11 mois',
            '1_10_ans' => $profile->running_experience_years ? "{$profile->running_experience_years} ans" : '1 à 10 ans',
            'plus_10_ans' => 'Plus de 10 ans',
        ];

        return $levels[$period] ?? 'Non renseigné';
    }

    /**
     * Format runs per week to French.
     *
     * @param string|null $runsPerWeek
     * @return string
     */
    private function formatRunsPerWeekFr(?string $runsPerWeek): string
    {
        $formats = [
            '0' => '0 (je ne cours pas actuellement)',
            '1_2' => '1 à 2 sorties',
            '3_4' => '3 à 4 sorties',
            '5_6' => '5 à 6 sorties',
            '7_plus' => '7 ou plus',
        ];

        return $formats[$runsPerWeek] ?? 'Non renseigné';
    }

    /**
     * Format training locations to French.
     *
     * @param array|null $locations
     * @param string|null $otherLocation
     * @return string
     */
    private function formatTrainingLocationsFr(?array $locations, ?string $otherLocation): string
    {
        if (empty($locations)) {
            return 'Non renseigné';
        }

        $locationNames = [
            'route' => 'Route',
            'chemins' => 'Chemins / Trails',
            'piste' => 'Piste',
            'tapis' => 'Tapis de course',
            'autre' => $otherLocation ?? 'Autre',
        ];

        $formatted = array_map(fn($loc) => $locationNames[$loc] ?? $loc, $locations);
        return implode(', ', $formatted);
    }

    /**
     * Format current race times to string.
     *
     * @param array|null $raceTimes
     * @return string
     */
    private function formatRaceTimesFr(?array $raceTimes): string
    {
        if (empty($raceTimes)) {
            return 'Aucun chrono renseigné';
        }

        $formatted = [];
        foreach ($raceTimes as $time) {
            if (isset($time['distance']) && isset($time['time'])) {
                $formatted[] = "{$time['distance']}: {$time['time']}";
            }
        }

        return !empty($formatted) ? implode(', ', $formatted) : 'Aucun chrono renseigné';
    }

    /**
     * Format injuries to string.
     *
     * @param array|null $injuries
     * @return string
     */
    private function formatInjuriesFr(?array $injuries): string
    {
        if (empty($injuries)) {
            return 'Aucune blessure signalée';
        }

        return implode(', ', $injuries);
    }

    /**
     * Format problem to solve to French.
     *
     * @param string|null $problem
     * @param string|null $problemOther
     * @return string
     */
    private function formatProblemToSolveFr(?string $problem, ?string $problemOther): string
    {
        $problems = [
            'structure' => 'Besoin de structure',
            'blessure' => 'Retour de blessure',
            'motivation' => 'Motivation',
            'autre' => $problemOther ?? 'Autre',
        ];

        return $problems[$problem] ?? 'Non renseigné';
    }

    /**
     * Build the week structure section for prompt injection.
     *
     * @param Plan $plan
     * @return string
     */
    private function buildWeekStructureSection(Plan $plan): string
    {
        $weeks = $this->calculateWeeks($plan->start_date, $plan->end_date);

        $section = "=== STRUCTURE DU PLAN (GÉNÉRÉE PAR LE SYSTÈME) ===\n";
        $section .= "Nombre de semaines: " . count($weeks) . "\n\n";

        foreach ($weeks as $week) {
            $section .= "Semaine {$week['week_number']}: du lundi {$week['start_date']} au dimanche {$week['end_date']}\n";
            foreach ($week['days'] as $day) {
                $section .= "- {$day['day_name']} {$day['date']}\n";
            }
            $section .= "\n";
        }

        $section .= "Tu dois générer un workout pour CHAQUE jour listé ci-dessus.\n";

        return $section;
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
        $now = Carbon::now()->format('d/m/Y');
        $age = $this->calculateAge($profile->birth_date);
        $fullName = trim(($profile->first_name ?? '') . ' ' . ($profile->last_name ?? ''));
        $availableDays = $this->formatAvailableDaysFr($profile->available_days);
        $unavailableDays = implode(', ', $this->getUnavailableDays($profile->available_days)) ?: 'Aucun';

        $prompt = <<<PROMPT
0. RÔLE & MISSION DU MODÈLE
Tu es un expert en coaching running pour athlètes amateurs.
Ta mission : générer un plan d'entraînement complet, progressif, 100 % personnalisé, basé sur les meilleures pratiques scientifiques.
L'objectif est de construire une planification cohérente, logique, utile, motivante et sécurisée, adaptée au type d'objectif déclaré par l'athlète (préparer une/des courses, commencer la course à pied, reprendre la course à pied ou autre).

1. RÉFÉRENCES SCIENTIFIQUES (OBLIGATOIRES)
Tu dois toujours t'appuyer sur les références suivantes :
- Jack Daniels' Running Formula (zones, progressivité, équilibre charge/récupération)
- Does Polarized Training Improve Performance in Recreational Runners?
- Polarized and Pyramidal Training Intensity Distributions in Distance Running
Tu utilises intelligemment l'entraînement polarisé ou pyramidal selon le profil de l'athlète.

2. LOGIQUE GLOBALE D'ENTRAÎNEMENT (NON NÉGOCIABLE)
Chaque mois, chaque semaine et chaque séance doit être :
- logique
- utile
- intégrée dans un cycle structuré
- cohérente avec la phase de préparation

Le type de séance choisi chaque semaine (VMA courte, tempo, seuil, spécifique, etc.) doit toujours avoir du sens par rapport à :
- l'objectif principal déclaré
- la distance et la date de l'objectif uniquement si une course est renseignée
- la phase de préparation dans laquelle se trouve l'athlète
- le profil de l'athlète

Ne propose jamais une séance qui ne correspond pas à cette logique d'enchaînement.
Le fond peut rester identique, mais le format des séances doit varier pour éviter la monotonie et rendre le plan ludique.

Pour toute course (objectif principal ou objectif intermédiaire), la planification doit obligatoirement inclure :
- une phase d'affûtage débutant environ 10 jours avant la course,
- une phase de récupération la semaine suivant immédiatement la course.

3. DONNÉES D'ENTRÉE
{$this->buildWeekStructureSection($plan)}

4. AJUSTEMENT DE L'OBJECTIF (RÔLE D'EXPERT)
- Si l'objectif annoncé est cohérent avec le niveau actuel → construit le plan directement pour l'atteindre.
- Si l'objectif annoncé est trop ambitieux → construit un plan basé sur la réalité de l'athlète, avec montée progressive.
- Si l'objectif annoncé n'est pas assez ambitieux → ajuste le plan à la hausse pour refléter le vrai potentiel.
- Si l'objectif principal n'est pas une course, l'ajustement doit se faire en fonction du profil réel.

5. RÈGLES DE STRUCTURE HEBDOMADAIRE
Les semaines doivent conserver une structure régulière pour créer des habitudes stables.
Essaie de garder les mêmes jours de repos et les mêmes jours de séance d'une semaine à l'autre.
Cette régularité peut être adaptée si les contraintes de l'athlète l'exigent.

6. CONSTRUCTION DES SÉANCES
Séances qualitatives (fractionné, allure spécifique, marathon, seuil, VMA, tempo) → toujours inclure :
1. Échauffement → durée et contenu adaptés au niveau
2. Corps de séance → distances, répétitions, récupérations, allures cibles
3. Récupération → durée adaptée

Footings simples → juste indiquer la durée et "en aisance"

✅ Fréquence hebdomadaire →
Tu es l'expert : n'utilise jamais directement le nombre de jours disponibles déclarés comme fréquence d'entraînement. Ce n'est pas une consigne, c'est une contrainte à prendre en compte intelligemment.
Évalue toi-même le bon nombre de séances selon le niveau, l'objectif, l'expérience, le volume actuel, les blessures passées et le temps disponible. Tu dois prendre la décision finale.
Ta mission est de proposer une fréquence réaliste, qui respecte les contraintes du coureur mais permet une progression optimale.

Limite-toi strictement aux séances de course à pied ; n'inclut aucune musculation, mobilité ou cross-training.

7. STYLE & VOCABULAIRE
Ton clair, motivant, inspirant, facile à exécuter.
Langage compréhensible par tous, même les débutants.
Toutes les allures doivent être en temps/km (ex : 4'30/km).
Pour les séances sur piste, exprimer en temps par répétition (ex : 36s/200m).

8. FORMAT DE SORTIE JSON (STRICTEMENT OBLIGATOIRE)
Ta réponse doit être UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.

9. DONNÉES ATHLÈTE
Nom et Prénom : {$fullName}
Âge : {$age} ans
Sexe : {$this->formatGenderFr($profile->gender)}
Poids : {$profile->weight_kg} kg
Taille : {$profile->height_cm} cm
Objectif principal : {$this->formatPrimaryGoalFr($profile->primary_goal, $profile->primary_goal_other)}
Distance de l'objectif : {$this->formatRaceDistanceFr($profile->race_distance, $profile->race_distance_other)}
Date de l'objectif : {$profile->target_race_date?->format('d/m/Y')}
Objectifs intermédiaires : {$profile->intermediate_objectives}
Problème à résoudre : {$this->formatProblemToSolveFr($profile->problem_to_solve, $profile->problem_to_solve_other)}
Chronos actuels : {$this->formatRaceTimesFr($profile->current_race_times)}
Volume actuel : {$profile->current_weekly_volume_km} km/semaine
Niveau : {$this->formatExperienceFr($profile)}
Nombre de sorties / semaine : {$this->formatRunsPerWeekFr($profile->current_runs_per_week)}
Jours disponibles : {$availableDays}
Jours indisponibles : {$unavailableDays}
Lieu(x) d'entraînement : {$this->formatTrainingLocationsFr($profile->training_locations, $profile->training_location_other)}
Equipements : {$profile->equipment}
Contraintes : {$profile->personal_constraints}
Blessures passées : {$this->formatInjuriesFr($profile->injuries)}

Date actuelle : {$now}
PROMPT;

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
        $now = Carbon::now()->format('d/m/Y');
        $age = $this->calculateAge($profile->birth_date);
        $fullName = trim(($profile->first_name ?? '') . ' ' . ($profile->last_name ?? ''));
        $availableDays = $this->formatAvailableDaysFr($profile->available_days);
        $unavailableDays = implode(', ', $this->getUnavailableDays($profile->available_days)) ?: 'Aucun';

        // Get previous plans for history
        $previousPlans = Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('start_date', 'desc')
            ->limit(3)
            ->get();

        $historySection = $this->buildPlanHistorySection($previousPlans);

        $prompt = <<<PROMPT
0. RÔLE & MISSION DU MODÈLE
Tu es un expert en coaching running pour athlètes amateurs.
Ta mission : générer un plan d'entraînement complet, progressif et 100 % personnalisé, basé sur les meilleures pratiques scientifiques.
L'objectif est de construire une planification cohérente, logique, utile, motivante et sécurisée.

1. RÉFÉRENCES SCIENTIFIQUES (OBLIGATOIRES)
Tu dois toujours t'appuyer sur les références suivantes :
- Jack Daniels' Running Formula (zones, progressivité, équilibre charge/récupération)
- Does Polarized Training Improve Performance in Recreational Runners?
- Polarized and Pyramidal Training Intensity Distributions in Distance Running

2. LOGIQUE GLOBALE D'ENTRAÎNEMENT (NON NÉGOCIABLE)
Chaque mois, chaque semaine et chaque séance doit être logique, utile, intégrée dans un cycle structuré et cohérente avec la phase de préparation.

3. DONNÉES D'ENTRÉE

3.1 Structure du plan
{$this->buildWeekStructureSection($plan)}

3.2 Historique des plans précédents
{$historySection}

4. UTILISATION DE L'HISTORIQUE (CONTINUITÉ, VARIATION ET ROUTINE)
L'historique des plans précédents est un outil de continuité et de contextualisation, pas un modèle à reproduire.

Tu dois t'en servir pour :
- assurer une progression logique et sécurisée
- éviter les ruptures brutales de charge
- identifier ce qui a déjà été travaillé
- maintenir une cohérence globale

IMPORTANT : L'historique ne doit jamais conduire à reproduire le même mois d'entraînement.
Le fond évolue, mais la routine hebdomadaire doit être préservée autant que possible.

Anti-duplication du contenu :
- Ne reproduit jamais une séance identique à celle du mois précédent
- Ne réutilise pas exactement le même format principal de séance sur deux mois consécutifs
- La filière peut rester la même, mais le format doit évoluer

5. AJUSTEMENT DE L'OBJECTIF (RÔLE D'EXPERT)
Tu es l'expert : ajuste le plan selon le niveau réel de l'athlète.

6. RÈGLES DE STRUCTURE HEBDOMADAIRE
Conserve les mêmes jours de repos et de séance d'une semaine à l'autre quand possible.

7. CONSTRUCTION DES SÉANCES
Séances qualitatives → toujours inclure : Échauffement + Corps de séance + Récupération
Footings simples → juste durée et "en aisance"

✅ Fréquence hebdomadaire →
Tu es l'expert : n'utilise jamais directement le nombre de jours disponibles déclarés comme fréquence d'entraînement. Ce n'est pas une consigne, c'est une contrainte à prendre en compte intelligemment.
Évalue toi-même le bon nombre de séances selon le niveau, l'objectif, l'expérience, le volume actuel, les blessures passées et le temps disponible. Tu dois prendre la décision finale.
Ta mission est de proposer une fréquence réaliste, qui respecte les contraintes du coureur mais permet une progression optimale.

Limite-toi aux séances de course à pied uniquement.

8. STYLE & VOCABULAIRE
Ton clair, motivant, inspirant.
Allures en temps/km (ex : 4'30/km).
Séances piste en temps par répétition (ex : 36s/200m).

9. FORMAT DE SORTIE JSON (STRICTEMENT OBLIGATOIRE)
Ta réponse doit être UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.

10. DONNÉES ATHLÈTE
Nom : {$fullName}
Âge : {$age} ans
Sexe : {$this->formatGenderFr($profile->gender)}
Poids : {$profile->weight_kg} kg
Taille : {$profile->height_cm} cm
Objectif principal : {$this->formatPrimaryGoalFr($profile->primary_goal, $profile->primary_goal_other)}
Distance de l'objectif : {$this->formatRaceDistanceFr($profile->race_distance, $profile->race_distance_other)}
Date de l'objectif : {$profile->target_race_date?->format('d/m/Y')}
Objectifs intermédiaires : {$profile->intermediate_objectives}
Problème à résoudre : {$this->formatProblemToSolveFr($profile->problem_to_solve, $profile->problem_to_solve_other)}
Chronos actuels : {$this->formatRaceTimesFr($profile->current_race_times)}
Volume actuel : {$profile->current_weekly_volume_km} km/semaine
Niveau : {$this->formatExperienceFr($profile)}
Nombre de sorties / semaine : {$this->formatRunsPerWeekFr($profile->current_runs_per_week)}
Jours disponibles : {$availableDays}
Jours indisponibles : {$unavailableDays}
Lieu(x) d'entraînement : {$this->formatTrainingLocationsFr($profile->training_locations, $profile->training_location_other)}
Equipements : {$profile->equipment}
Contraintes : {$profile->personal_constraints}
Blessures passées : {$this->formatInjuriesFr($profile->injuries)}

Date actuelle : {$now}
PROMPT;

        return $prompt;
    }

    /**
     * Build the plan history section for monthly prompt.
     *
     * @param \Illuminate\Database\Eloquent\Collection $previousPlans
     * @return string
     */
    private function buildPlanHistorySection($previousPlans): string
    {
        if ($previousPlans->isEmpty()) {
            return "Aucun historique de plan disponible.\n";
        }

        $section = "";
        foreach ($previousPlans as $index => $prevPlan) {
            $section .= "--- Plan " . ($index + 1) . " ({$prevPlan->type}) ---\n";
            $section .= "Période : {$prevPlan->start_date->format('d/m/Y')} au {$prevPlan->end_date->format('d/m/Y')}\n";

            if ($prevPlan->content && isset($prevPlan->content['weeks'])) {
                foreach ($prevPlan->content['weeks'] as $week) {
                    $section .= "\nSemaine {$week['week_number']} ({$week['start_date']} - {$week['end_date']}):\n";
                    foreach ($week['days'] as $day) {
                        $content = $day['content']['description'] ?? 'Repos';
                        $section .= "• {$day['day_name']}: {$content}\n";
                    }
                }
            }
            $section .= "\n";
        }

        return $section;
    }

    /**
     * Get the JSON schema for OpenAI structured output.
     *
     * @return array
     */
    public function getJsonSchema(): array
    {
        // OpenAI strict mode requires additionalProperties: false at every object level
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => [
                'weeks' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'properties' => [
                            'week_number' => ['type' => 'integer'],
                            'start_date' => ['type' => 'string', 'description' => 'Format: DD/MM'],
                            'end_date' => ['type' => 'string', 'description' => 'Format: DD/MM'],
                            'days' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'additionalProperties' => false,
                                    'properties' => [
                                        'day_name' => [
                                            'type' => 'string',
                                            'enum' => ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
                                        ],
                                        'date' => ['type' => 'string', 'description' => 'Format: DD/MM'],
                                        'type' => [
                                            'type' => 'string',
                                            'enum' => ['repos', 'footing', 'qualitative', 'course']
                                        ],
                                        'content' => [
                                            'type' => 'object',
                                            'additionalProperties' => false,
                                            'properties' => [
                                                'description' => ['type' => 'string'],
                                                'duration' => ['type' => ['string', 'null']],
                                                'session_type' => ['type' => ['string', 'null']],
                                                'echauffement' => ['type' => ['string', 'null']],
                                                'corps_de_seance' => ['type' => ['string', 'null']],
                                                'recuperation' => ['type' => ['string', 'null']],
                                                'race_distance' => ['type' => ['string', 'null']]
                                            ],
                                            'required' => ['description', 'duration', 'session_type', 'echauffement', 'corps_de_seance', 'recuperation', 'race_distance']
                                        ]
                                    ],
                                    'required' => ['day_name', 'date', 'type', 'content']
                                ]
                            ]
                        ],
                        'required' => ['week_number', 'start_date', 'end_date', 'days']
                    ]
                ]
            ],
            'required' => ['weeks']
        ];
    }

    /**
     * Get user's active or upcoming plan.
     * Returns the most recent completed plan that is either active now or starting soon.
     *
     * @param User $user
     * @return Plan|null
     */
    public function getActivePlan(User $user): ?Plan
    {
        $today = Carbon::today();

        // First try to find a currently active plan
        $activePlan = Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderBy('start_date', 'desc')
            ->first();

        if ($activePlan) {
            return $activePlan;
        }

        // If no active plan, return the most recent upcoming plan
        return Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('start_date', '>', $today)
            ->orderBy('start_date', 'asc')
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
