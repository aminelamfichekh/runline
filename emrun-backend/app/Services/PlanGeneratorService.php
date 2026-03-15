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
 * Manages when plans should be generated and prepares data for Claude AI.
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

        // Calculate end date: Sunday before the first Monday of next month
        // This aligns the initial plan with the monthly subscription cycle —
        // the initial plan fills the gap until the first monthly plan kicks in.
        $endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

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
     * Build the AI prompt for plan generation.
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
     * Format goal time to French readable string.
     *
     * @param string|null $goalTime e.g. "1:30:00"
     * @param string|null $raceDistance
     * @return string
     */
    private function formatGoalTimeFr(?string $goalTime, ?string $raceDistance): string
    {
        if (!$goalTime || !$raceDistance) {
            return 'Non renseigné';
        }

        $parts = explode(':', $goalTime);
        if (count($parts) !== 3) {
            return $goalTime;
        }

        $hours = (int) $parts[0];
        $minutes = (int) $parts[1];
        $seconds = (int) $parts[2];

        $formatted = '';
        if ($hours > 0) {
            $formatted .= "{$hours}h";
        }
        if ($minutes > 0) {
            $formatted .= str_pad((string) $minutes, 2, '0', STR_PAD_LEFT) . 'min';
        }
        if ($seconds > 0) {
            $formatted .= str_pad((string) $seconds, 2, '0', STR_PAD_LEFT) . 's';
        }

        return $formatted ?: 'Non renseigné';
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

        // Cross-reference: if period says "je_commence" but years/months/weeks are set,
        // use the actual experience data instead (questionnaire data mismatch)
        if ($period === 'je_commence' || $period === 'je_reprends') {
            if (!empty($profile->running_experience_years)) {
                $years = (int) $profile->running_experience_years;
                if ($years > 0) {
                    return "{$years} ans d'expérience";
                }
            }
            if (!empty($profile->running_experience_months)) {
                $months = (int) $profile->running_experience_months;
                if ($months > 0) {
                    return "{$months} mois d'expérience";
                }
            }
            if (!empty($profile->running_experience_weeks)) {
                $weeks = (int) $profile->running_experience_weeks;
                if ($weeks > 0) {
                    return "{$weeks} semaines d'expérience";
                }
            }
        }

        $levels = [
            'je_commence' => 'Débutant (je commence)',
            'je_reprends' => 'Reprise (je reprends)',
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
        $weekStructure = $this->buildWeekStructureSection($plan);
        $weeks = $this->calculateWeeks($plan->start_date, $plan->end_date);
        $totalWeeks = count($weeks);

        $prompt = $this->buildSectionRole();
        $prompt .= "\n\n" . $this->buildSectionReferences();
        $prompt .= "\n\n" . $this->buildSectionLogique();
        $prompt .= "\n\n" . $this->buildSectionSeances();
        $prompt .= "\n\n" . $this->buildSectionInstructionsFinales();
        $prompt .= "\n\n" . $this->buildSectionFormatJson();
        $prompt .= "\n\n" . $this->buildSectionDonneesAthlete(
            $fullName, $age, $profile, $availableDays, $unavailableDays, $now, $totalWeeks, $weekStructure
        );

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
        $weekStructure = $this->buildWeekStructureSection($plan);
        $weeks = $this->calculateWeeks($plan->start_date, $plan->end_date);
        $totalWeeks = count($weeks);

        // Get previous plans for history
        $previousPlans = Plan::where('user_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('start_date', 'desc')
            ->limit(3)
            ->get();

        $historySection = $this->buildPlanHistorySection($previousPlans);

        $prompt = $this->buildSectionRole();
        $prompt .= "\n\n" . $this->buildSectionReferences();
        $prompt .= "\n\n" . $this->buildSectionLogique();
        $prompt .= "\n\n" . $this->buildSectionSeances();
        $prompt .= "\n\n" . $this->buildSectionHistorique($historySection);
        $prompt .= "\n\n" . $this->buildSectionInstructionsFinales();
        $prompt .= "\n\n" . $this->buildSectionFormatJson();
        $prompt .= "\n\n" . $this->buildSectionDonneesAthlete(
            $fullName, $age, $profile, $availableDays, $unavailableDays, $now, $totalWeeks, $weekStructure
        );

        return $prompt;
    }

    /**
     * Build the ROLE section of the prompt.
     */
    private function buildSectionRole(): string
    {
        return <<<'SECTION'
Tu es un coach running expert. Génère un plan d'entraînement personnalisé basé sur Jack Daniels' Running Formula et l'entraînement polarisé.

ORDRE DE TRAVAIL OBLIGATOIRE :
1. Lire les données athlète
2. Identifier TOUTES les dates de course (objectif principal + intermédiaires) — noter chacune
3. Estimer les allures en croisant : record perso, volume, fréquence, niveau déclaré
4. Placer CHAQUE course identifiée dans le bon jour (type="course") AVANT de planifier quoi que ce soit d'autre
5. Construire le plan autour de ces jalons fixes
SECTION;
    }

    /**
     * Build the REFERENCES section of the prompt.
     */
    private function buildSectionReferences(): string
    {
        return <<<'SECTION'
ESTIMATION DU NIVEAU :
Croiser : record perso (indicatif) + volume + fréquence + expérience + blessures. Hypothèse prudente si données insuffisantes.
Ajustement : si objectif irréaliste -> plan sur niveau réel. Si sous-estimé -> ajuster à la hausse.
SECTION;
    }

    /**
     * Build the LOGIQUE section of the prompt.
     */
    private function buildSectionLogique(): string
    {
        return <<<'SECTION'
RÈGLES D'ENTRAÎNEMENT :

COURSES ET OBJECTIFS (RÈGLE ABSOLUE - LA PLUS IMPORTANTE) :
Toute date de course renseignée (objectif principal ET chaque objectif intermédiaire) qui tombe dans la période du plan DOIT apparaître au bon jour exact avec type="course". AUCUNE EXCEPTION.
- Placer chaque course AVANT de planifier le reste de la semaine
- Semaine avant la course : affûtage (voir règles ci-dessous)
- Semaine après la course : 1 seule semaine de récupération complète (footings légers uniquement, pas de qualitative). Exactement 1 semaine, pas 2, pas 3. La semaine suivante, reprise normale de l'entraînement.
- Si date tombe sur jour indisponible : placer le samedi ou dimanche le plus proche
- VEILLE ET AVANT-VEILLE DE COURSE = RÈGLES ABSOLUES (objectif principal ET intermédiaires) :
  VEILLE de la course = FOOTING LÉGER ou REPOS uniquement. Jamais de séance qualitative la veille d'une course, quelle que soit la distance.
  AVANT-VEILLE de la course = REPOS OBLIGATOIRE, sans exception.
  Course lundi → repos samedi, footing léger ou repos dimanche
  Course mardi → repos dimanche, footing léger ou repos lundi
  Course mercredi → repos lundi, footing léger ou repos mardi
  Course jeudi → repos mardi, footing léger ou repos mercredi
  Course vendredi → repos mercredi, footing léger ou repos jeudi
  Course samedi → repos jeudi, footing léger ou repos vendredi
  Course dimanche → repos vendredi, footing léger ou repos samedi

AFFÛTAGE SELON DISTANCE — RÈGLE STRICTE, semaine d'affûtage = volume réduit + intensité réduite :
- 5km : 5-7j avant la course. Volume -20%. 1 seule séance qualité courte en tout début d'affûtage. Footings légers ensuite.
- 10km : 7-10j avant la course. Volume -25 à -30%. Dernière qualité J-6 au plus tard. Footings légers ensuite.
- Semi : 10-14j avant la course. Volume -30 à -40%. Aucune séance intensive les 5 derniers jours. Footings légers uniquement.
- Marathon : 14-21j avant la course. Volume -40 à -50%. Dernière sortie longue J-14 à J-21. Dernière qualité J-10 au plus tard. Footings légers ensuite.
- Dans TOUS les cas : 0 séance intensive les 4 derniers jours avant la course. Footings légers uniquement.
- AVANT-VEILLE DE COURSE = REPOS OBLIGATOIRE (règle universelle).
- Semaine de course (si course sam/dim) : 1 séance légère de rappel d'allure max lun/mar, puis footings très légers ou repos.

PROGRESSION :
- Volume et fréquence augmentent progressivement de semaine en semaine, de mois en mois
- Ne jamais chuter le volume sans justification (affûtage ou récupération)
- La fréquence évolue si le profil le permet
- Ne jamais utiliser directement le nombre de jours disponibles déclarés comme fréquence. C'est une contrainte maximale, pas une consigne.
- Si l'athlète stagne au même nombre de séances depuis 3 mois ou plus sans justification, faire évoluer la fréquence : +1 séance tous les 4 à 6 semaines selon la réponse de l'athlète.

PLAFONDS SORTIE LONGUE (OBLIGATOIRE - bases scientifiques Jack Daniels) :
La sortie longue ne doit JAMAIS dépasser ces limites, quelle que soit la durée de préparation :
- Préparation 5km : sortie longue max 1h (inutile d'aller au-delà pour un 5km)
- Préparation 10km : sortie longue max 1h30
- Préparation Semi-marathon : sortie longue max 2h15
- Préparation Marathon : sortie longue max 3h (ou 35km, selon ce qui vient en premier)
- Préparation générale / pas de course : sortie longue adaptée au volume habituel, max 1h30
Ces plafonds s'appliquent même en phase de volume maximal et même sur 8-12 mois de préparation.

RÉDUCTION SORTIE LONGUE EN AFFÛTAGE (OBLIGATOIRE) :
Dans les dernières semaines avant la course, raccourcir progressivement la sortie longue :
- 5km : la dernière sortie longue avant la course est raccourcie (~50% du max)
- 10km : la dernière sortie longue avant la course est raccourcie (~50-60% du max)
- Semi : les 2 dernières sorties longues sont raccourcies (J-3 sem : -20%, J-2 sem : -40%)
- Marathon : les 3 dernières sorties longues sont raccourcies (J-4 sem : -10%, J-3 sem : -25%, J-2 sem : -40%)
L'objectif : arriver frais à la course, pas fatigué par une longue sortie trop proche.

STRUCTURE HEBDOMADAIRE :
- Conserver les mêmes jours de repos et de séances d'une semaine à l'autre (routine = clé de la progression)
- Nombre de séances = basé sur les habitudes réelles, pas sur le max des jours disponibles
- Jours disponibles = contrainte maximale, pas la cible
- Éviter la rotation mécanique automatique des séances (ex: S1=VMA, S2=Tempo, S3=Seuil, S4=Fartlek qui se répète identiquement). Le choix des séances doit être dicté par la logique de préparation, pas par une rotation systématique.

SÉANCES QUALITATIVES ET OBJECTIFS SANS COURSE :
Les séances qualitatives ne sont pas exclusives aux préparations de course. Pour les objectifs "commencer la course à pied", "reprendre la course à pied" ou "autre", elles font partie de la progression naturelle de tout coureur.
Le profil de l'athlète (niveau actuel, historique, volume, blessures, contraintes) détermine entièrement si et quand les introduire. Un plan sans qualitatives peut être totalement justifié sur une période donnée. Un plan sans qualitatives sur plusieurs mois consécutifs, sans raison liée au profil, est en revanche une erreur de progression.
SECTION;
    }

    /**
     * Build the SEANCES section of the prompt.
     */
    private function buildSectionSeances(): string
    {
        return <<<'SECTION'
CONSTRUCTION DES SÉANCES :

TITRES DE SÉANCES (session_type) — RÈGLES POUR LE TITRE (session_type) :
- Footing simple : "Footing"
- Footing avec renforcement : OBLIGATOIREMENT "Footing + Renforcement" (et non "Footing" seul). Si le champ "renforcement" est rempli, le session_type DOIT être "Footing + Renforcement", sans exception.
- Sortie longue : "Sortie longue"
- Repos : "Repos"
- Course : "Course 5km", "Course 10km", "Course Semi-marathon", "Course Marathon"
- Qualitatives : nom court de la filière travaillée, 2-3 mots max. Exemples : "VMA courte", "VMA longue", "Tempo", "Seuil", "Fartlek", "Côtes", "Spécifique semi", "Fractionné". D'autres noms sont acceptés si pertinents et courts.
STRICTEMENT INTERDIT : titres inventés comme "Reprise douce", "Récupération active", "Footing léger", "Échauffement", "Jogging", "Endurance fondamentale". Ces précisions vont uniquement dans "description", jamais dans "session_type".

Séances qualitatives (fractionné, seuil, tempo, VMA, spécifique) :
- Toujours 3 parties : Échauffement | Corps de séance | Récupération

FORMAT UNIVERSEL ÉCHAUFFEMENT (obligatoire, identique pour tous) :
"X min en aisance + gammes + 3 accélérations progressives ~20 sec"
- Durée selon niveau et volume hebdomadaire : 10, 15, 20, 25 ou 30 min
- "gammes" uniquement, sans aucune précision ni liste (jamais "gammes athlétiques", jamais "montées de genoux, talons-fesses", etc.)
- Les 3 accélérations progressives sont toujours incluses, quel que soit le niveau

FORMAT UNIVERSEL RÉCUPÉRATION FINALE (obligatoire, identique pour tous) :
"X min en aisance"
- Durée selon niveau et volume hebdomadaire : 5, 10, 15 ou 20 min
- Aucune autre formulation autorisée

- Corps de séance : distances, répétitions, allures calculées selon le niveau
- Récupération entre les séries : "en trottinant" ou "en marchant" (jamais "récup trot" ou abréviations)

Footings : "Footing X min en aisance" UNIQUEMENT. Aucun commentaire supplémentaire, aucune précision sur le terrain, le rythme ou les sensations. Jamais "en aisance respiratoire", "rythme conversationnel", "en aisance complète" ou toute autre variante. Uniquement "Footing X min en aisance", rien d'autre.
Sortie longue : traiter comme footing (type="footing"), pas comme qualitative. Format : "Footing Xh en aisance (les X dernières minutes à allure marathon X'/km si besoin)". Ne jamais découper en 3 parties.
Repos : description = "Repos" uniquement.
Course : type="course". Même format que les qualitatives : échauffement ("X min en aisance + gammes + 3 accélérations progressives ~20 sec") + "Course [distance]" + récupération ("X min en aisance").

Séances piste : format obligatoire "N x Xm en Xs" (ex : "8 x 200m en 48s"). Jamais "à 48s" ou "@ 48s".
Allures : toujours en min/km (ex : 4'30/km). Jamais uniquement "seuil 90%".

RENFORCEMENT MUSCULAIRE :
Intégrer selon le niveau :
- Débutant / intermédiaire : 1 séance/semaine après un footing court.
- Confirmé (3+ mois d'entraînement régulier, 4+ séances/semaine) : 2 séances/semaine, jamais consécutives.
Jamais la veille d'une qualitative, jamais la veille ou le jour de course.
Le renforcement s'ajoute dans le champ "renforcement" du jour, séparément de la description.
Format exercice : "Nom (description simple et précise de comment faire l'exercice, comme si tu l'expliquais à quelqu'un qui ne l'a jamais fait) — N x reps/durée"
Règle d'écriture : clair, direct, ultra-accessible. Bonne orthographe, accents et ponctuation obligatoires.
Exemples corrects :
- "Planche frontale (allonge-toi face au sol, appuie-toi sur tes avant-bras et la pointe de tes pieds, soulève ton corps pour qu'il forme une ligne droite de la tête aux talons, serre le ventre et les fesses, tiens la position) — 3 x 30 sec"
- "Pont fessier (allonge-toi sur le dos, plie les genoux, pieds à plat au sol près des fesses, pousse les hanches vers le plafond en serrant fort les fesses, redescends lentement) — 3 x 15 reps"
- "Fente avant (tiens-toi droit, fais un grand pas en avant avec une jambe, descends le genou arrière vers le sol sans le toucher, remonte et recommence avec l'autre jambe) — 3 x 10 reps par jambe"
- Débutant : gainage, squats, fentes, pont fessier. 15-20 min.
- Intermédiaire : gainage dynamique, fentes, squats unilatéraux, mollets excentriques. 20-30 min.
- Confirmé : pliométrie légère, excentrique, gainage complexe. 25-35 min.
Adaptation blessures : genou -> quadriceps/fessiers, pas de squats profonds. Achille -> mollets excentriques, pas de sauts.

VARIÉTÉ OBLIGATOIRE DES EXERCICES :
Ne jamais proposer les mêmes exercices deux semaines de suite. Puiser librement dans cette banque de plus de 60 exercices :

Gainage statique : Planche frontale, Planche latérale, Planche inversée, Superman, Dead bug, Bird-dog, Hollow body hold, Side plank avec rotation, Planche sur les poings
Gainage dynamique : Mountain climbers, Bear crawl, Gainage avec toucher d'épaule, Planche avec rotation du buste, Bear crawl latéral, Inchworm, Plank jack
Fessiers : Pont fessier, Pont fessier unilatéral, Hip thrust, Clamshell, Fire hydrant, Donkey kick, Abduction debout élastique, Frog pump, Lateral band walk (sans élastique : pas glissés)
Cuisses/jambes : Squat, Squat sumo, Goblet squat (lesté ou non), Fente avant, Fente inversée, Fente latérale, Bulgarian split squat, Step-up, Wall sit, Pistol squat assisté, Box squat
Ischio-jambiers : Nordic curl simplifié, Romanian deadlift poids de corps, Good morning, Glute bridge isométrique, Leg curl sur ballon (si dispo), Single leg deadlift
Mollets/pieds : Mollets excentriques sur marche, Calf raise bilatéral, Calf raise unilatéral, Towel curl (serviette sous les orteils), Calf raise isométrique contre mur, Triple flexion cheville
Proprioception/équilibre : Équilibre unipodal, Équilibre yeux fermés, Squat unipodal assisté, Tandem stance, Single leg Romanian deadlift lent, Balance avec lancer de balle (imaginaire)
Dos/posture : Superman, Rowing inversé (sous une table), Hyperextension poids de corps, Rétraction scapulaire, Y-T-W en prone, Nageur alterné
Épaules/bras fonctionnels : Pompes, Pompes larges, Pompes diamant, Dips sur chaise, Pike push-up, Rotation externe épaule, Élévation latérale isométrique
Mobilité active : Hip 90-90, Fente avec rotation thoracique, World's greatest stretch, Cat-cow, Scorpion stretch, Pigeon debout, Squat profond avec respiration

Règles de sélection : chaque séance = 4 à 6 exercices de groupes différents. Sur un mois : couvrir au minimum gainage + fessiers + jambes + un 4e groupe. Jamais le même circuit deux fois.
SECTION;
    }

    /**
     * Build the HISTORIQUE section (monthly only).
     */
    private function buildSectionHistorique(string $historyText): string
    {
        return <<<SECTION
HISTORIQUE :
{$historyText}
Utiliser pour : progression logique, éviter rupture de charge, ne jamais reproduire le même contenu.
Structure hebdomadaire stable, contenu des séances évolue. Progression intentionnelle sur au moins un axe.
SECTION;
    }

    /**
     * Build the INSTRUCTIONS FINALES section of the prompt.
     */
    private function buildSectionInstructionsFinales(): string
    {
        return <<<'SECTION'
INSTRUCTIONS FINALES ET CHECKLIST

AJUSTEMENT DE L'OBJECTIF (RÔLE D'EXPERT) :
- Si l'objectif annoncé est cohérent avec le niveau actuel -> construire le plan pour l'atteindre directement.
- Si l'objectif annoncé est trop ambitieux -> construire sur la réalité de l'athlète avec montée progressive. Traiter l'objectif annoncé comme aspirationnel.
- Si l'objectif annoncé n'est pas assez ambitieux -> ajuster à la hausse pour refléter le vrai potentiel.
- Si l'objectif principal n'est pas une course (débuter, reprendre, autre) -> progression logique selon le profil, sans recherche de performance immédiate.

Si certaines infos sont absentes, faire une hypothèse prudente basée sur le profil.
Si des objectifs intermédiaires sont fournis, les interpréter (date + distance) et les intégrer sans casser la cohérence globale.
Si aucun objectif intermédiaire n'est fourni, ignorer totalement ce point.
Orthographe, accents et ponctuation : toutes les descriptions et tous les textes générés doivent être en français correct, avec les accents obligatoires (é, è, ê, à, ù, î, ô, ç…) et une ponctuation soignée. Aucune faute n'est acceptable.
Objectif ultime : créer un plan ultra-personnalisé, scientifique, motivant et sécurisé, avec chaque séance qualitative toujours complète (échauffement + corps + récup), adapté au niveau et à la distance préparée, sans jamais simplifier ni uniformiser.

CHECKLIST OBLIGATOIRE AVANT DE GÉNÉRER LE JSON :
[ ] Les allures sont cohérentes avec le niveau réel estimé (croisement record perso + volume + fréquence + expérience)
[ ] Si une course est dans la période, elle est insérée dans le bon jour exact
[ ] La semaine 1 ne repart pas à un volume inférieur à la dernière semaine précédente (sauf affûtage justifié)
[ ] La fréquence hebdomadaire a évolué si l'athlète stagnait depuis plusieurs mois
[ ] Chaque séance qualitative contient échauffement + corps + récupération complets
[ ] L'ordre et le type des séances qualitatives sont dictés par la logique de préparation, pas par une rotation automatique
[ ] La semaine post-course = exactement 1 semaine de récupération (footings légers), puis reprise normale
SECTION;
    }

    /**
     * Build the FORMAT JSON section of the prompt.
     */
    private function buildSectionFormatJson(): string
    {
        return <<<'SECTION'
FORMAT JSON (OBLIGATOIRE - RÉPONSE UNIQUEMENT EN JSON) :
{ "weeks": [ { "week_number": 1, "start_date": "JJ/MM", "end_date": "JJ/MM", "days": [ { "day_name": "Lundi", "date": "JJ/MM", "type": "repos|footing|qualitative|course", "content": { "session_type": "Titre court 2-3 mots", "description": "...", "duration": "...", "echauffement": "...", "corps_de_seance": "...", "recuperation": "...", "renforcement": "exercice1 | exercice2 | ...", "race_distance": "..." } } ] } ] }

Règles JSON :
- Clé semaine : "days" (pas "workouts")
- Clé jour : "day_name" (pas "day")
- "duration" : OBLIGATOIRE sur chaque jour non-repos (ex : "45min", "1h10"). Ne jamais omettre.
- session_type : titre court UNIQUEMENT parmi ces options exactes :
  Footings : "Footing", "Footing + Renforcement" ou "Sortie longue"
  Qualitatives : "VMA courte", "VMA longue", "Tempo", "Seuil", "Fartlek", "Côtes", "Spécifique 5km", "Spécifique 10km", "Spécifique semi", "Spécifique marathon", "Fractionné"
  Course : "Course 5km", "Course 10km", "Course semi", "Course marathon" (selon la distance)
  Repos : "Repos"
  Interdit : tout titre inventé comme "Reprise douce", "Récupération active", "Footing léger", "Échauffement". Ces concepts vont dans la description, pas dans session_type.
- renforcement : champ optionnel, exercices séparés par " | "
- Repos : description = "Repos", autres champs vides
- Générer un workout pour CHAQUE jour listé dans la structure
SECTION;
    }

    /**
     * Build the DONNÉES ATHLÈTE section of the prompt.
     */
    private function buildSectionDonneesAthlete(
        string $fullName,
        ?int $age,
        UserProfile $profile,
        string $availableDays,
        string $unavailableDays,
        string $now,
        int $totalWeeks,
        string $weekStructure
    ): string {
        $genderFr = $this->formatGenderFr($profile->gender);
        $goalFr = $this->formatPrimaryGoalFr($profile->primary_goal, $profile->primary_goal_other);
        $distanceFr = $this->formatRaceDistanceFr($profile->race_distance, $profile->race_distance_other);
        $goalTimeFr = $this->formatGoalTimeFr($profile->goal_time, $profile->race_distance);
        $raceDateFr = $profile->target_race_date?->format('d/m/Y') ?? 'Non renseigné';
        // Merge both objectives fields: intermediate_objectives (from step questionnaire)
        // and objectives (from step3b, may contain specific race dates like "5km le 29/03/2026 sub 17'30")
        $intermediateObjectives = $this->mergeObjectives($profile->intermediate_objectives, $profile->objectives);
        // Merge both record sources: free-text records AND structured current_race_times
        $records = $this->mergeRecords($profile->records, $profile->current_race_times);
        $weeklyVolume = $profile->current_weekly_volume_km ?? 'Non renseigné';
        $lastWeekVolume = $profile->last_week_volume ?? 'Non renseigné';
        $experienceFr = $this->formatExperienceFr($profile);
        $runsPerWeekFr = $this->formatRunsPerWeekFr($profile->current_runs_per_week);
        $locationsFr = $this->formatTrainingLocationsFr($profile->training_locations, $profile->training_location_other);
        $constraints = $profile->personal_constraints ?: 'Aucune contrainte particulière';
        $injuries = $this->formatInjuriesFr($profile->injuries);
        $problemToSolve = $this->formatProblemToSolveFr($profile->problem_to_solve, $profile->problem_to_solve_other);
        $equipment = $profile->equipment ?: 'Non renseigné';
        $pauseDuration = $profile->pause_duration ?: null;

        $section = <<<SECTION
DONNÉES ATHLÈTE :
Nom : {$fullName} | Âge : {$age} ans | Sexe : {$genderFr} | Poids : {$profile->weight_kg}kg | Taille : {$profile->height_cm}cm
Objectif : {$goalFr} | Distance : {$distanceFr} | Temps visé : {$goalTimeFr}
Date objectif principal : {$raceDateFr}
Objectifs intermédiaires : {$intermediateObjectives}
Records : {$records}
Volume habituel : {$weeklyVolume} km/sem | Volume semaine dernière : {$lastWeekVolume} km
Sorties/semaine : {$runsPerWeekFr} | Niveau : {$experienceFr}
Jours disponibles : {$availableDays} | Jours indisponibles : {$unavailableDays}
Lieux : {$locationsFr}
Équipement : {$equipment}
Problème principal : {$problemToSolve}
Contraintes : {$constraints}
Blessures : {$injuries}
SECTION;

        // Add pause_duration line only for "reprendre" users
        if ($pauseDuration) {
            $section .= "\nDurée de la pause (reprise) : {$pauseDuration}";
        }

        $section .= <<<SECTION

Date du jour : {$now}

STRUCTURE DU PLAN ({$totalWeeks} semaines) :
{$weekStructure}
SECTION;

        return $section;
    }

    /**
     * Merge intermediate_objectives and objectives fields into one string.
     * Both fields may contain important race dates and goals.
     */
    private function mergeObjectives(?string $intermediateObjectives, ?string $objectives): string
    {
        $parts = [];

        if (!empty($intermediateObjectives)) {
            $parts[] = $intermediateObjectives;
        }

        if (!empty($objectives) && $objectives !== $intermediateObjectives) {
            $parts[] = $objectives;
        }

        return !empty($parts) ? implode(' | ', $parts) : 'Aucun';
    }

    /**
     * Merge free-text records and structured current_race_times.
     * Both sources may contain different data that the AI needs.
     */
    private function mergeRecords(?string $records, ?array $currentRaceTimes): string
    {
        $parts = [];

        if (!empty($records)) {
            $parts[] = $records;
        }

        $formattedTimes = $this->formatRaceTimesFr($currentRaceTimes);
        if ($formattedTimes !== 'Aucun chrono renseigné' && !empty($currentRaceTimes)) {
            // Only add if it contains data not already in records
            if (empty($records) || $formattedTimes !== $records) {
                $parts[] = "(Chronos structurés : {$formattedTimes})";
            }
        }

        return !empty($parts) ? implode("\n", $parts) : 'Aucun chrono renseigné';
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
     * Get the JSON schema for structured AI output.
     *
     * @return array
     */
    public function getJsonSchema(): array
    {
        // Strict mode requires additionalProperties: false at every object level
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
                                                'renforcement' => ['type' => ['string', 'null']],
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
