<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Subscription;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DemoSeeder
 *
 * Creates demo data for testing and client presentations.
 * Includes: user, profile, subscription, and a complete plan.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating demo data...');

        // Create demo user
        $user = $this->createDemoUser();
        $this->command->info("Demo user: demo@runline.app / demo123");

        // Create profile
        $this->createDemoProfile($user);
        $this->command->info("Profile created with questionnaire data");

        // Create subscription
        $this->createDemoSubscription($user);
        $this->command->info("Active subscription created");

        // Create plan with realistic content
        $this->createDemoPlan($user);
        $this->command->info("Training plan created");

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  Demo Account Ready!');
        $this->command->info('========================================');
        $this->command->info('  Email: demo@runline.app');
        $this->command->info('  Password: demo123');
        $this->command->info('========================================');
    }

    private function createDemoUser(): User
    {
        return User::updateOrCreate(
            ['email' => 'demo@runline.app'],
            [
                'name' => 'Marie Demo',
                'password' => Hash::make('demo123'),
                'email_verified_at' => now(),
            ]
        );
    }

    private function createDemoProfile(User $user): void
    {
        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => 'Marie',
                'last_name' => 'Demo',
                'birth_date' => Carbon::now()->subYears(28),
                'gender' => 'female',
                'height_cm' => 165,
                'weight_kg' => 58,
                'primary_goal' => 'courir_race',
                'race_distance' => 'semi_marathon',
                'target_race_date' => Carbon::now()->addMonths(2)->next(Carbon::SUNDAY),
                'intermediate_objectives' => 'Participer au 10km de Paris en mars',
                'objectives' => 'Finir mon premier semi-marathon en moins de 2h',
                'current_weekly_volume_km' => 25,
                'current_runs_per_week' => '3_4',
                'available_days' => ['tuesday', 'thursday', 'saturday', 'sunday'],
                'running_experience_period' => '1_11_mois',
                'running_experience_months' => '8',
                'problem_to_solve' => 'structure',
                'training_locations' => ['route', 'chemins'],
                'equipment' => 'Montre GPS, chaussures route Asics',
                'personal_constraints' => 'Travail de 9h à 18h, cours de yoga le mercredi soir',
                'injuries' => [],
                'current_race_times' => [
                    ['distance' => '10km', 'time' => '55:00'],
                    ['distance' => '5km', 'time' => '26:30'],
                ],
                'questionnaire_completed' => true,
            ]
        );
    }

    private function createDemoSubscription(User $user): void
    {
        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'stripe_subscription_id' => 'demo_sub_' . uniqid(),
                'stripe_customer_id' => 'demo_cus_' . uniqid(),
                'status' => 'active',
                'current_period_start' => Carbon::now()->startOfMonth(),
                'current_period_end' => Carbon::now()->endOfMonth()->addMonth(),
            ]
        );
    }

    private function createDemoPlan(User $user): void
    {
        // Delete existing plans for clean state
        Plan::where('user_id', $user->id)->delete();

        // Calculate proper week structure
        $now = Carbon::now();
        $startDate = $now->copy()->startOfWeek(Carbon::MONDAY);
        $endDate = $now->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);

        // If we're past Wednesday, start next week
        if ($now->dayOfWeek > Carbon::WEDNESDAY) {
            $startDate = $now->copy()->next(Carbon::MONDAY);
        }

        $weeks = $this->generateWeeks($startDate, $endDate);

        Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'initial',
            'status' => 'completed',
            'content' => ['weeks' => $weeks],
        ]);
    }

    private function generateWeeks(Carbon $startDate, Carbon $endDate): array
    {
        $weeks = [];
        $currentMonday = $startDate->copy();
        $weekNumber = 1;
        $today = Carbon::today();

        // Session templates for variety
        $qualitativeSessions = [
            [
                'description' => 'Fractionné court - VMA',
                'duration' => '55 min',
                'session_type' => 'VMA courte',
                'echauffement' => '15 min footing progressif + 5 min gammes',
                'corps_de_seance' => '10 x 200m à 100% VMA - Récup: 40s trot',
                'recuperation' => '10 min footing lent + étirements',
            ],
            [
                'description' => 'Seuil - Travail tempo',
                'duration' => '1h',
                'session_type' => 'Seuil',
                'echauffement' => '15 min footing + éducatifs',
                'corps_de_seance' => '3 x 8 min à allure seuil (5\'00/km) - Récup: 2 min trot',
                'recuperation' => '10 min retour au calme',
            ],
            [
                'description' => 'Fartlek nature',
                'duration' => '50 min',
                'session_type' => 'Fartlek',
                'echauffement' => '12 min footing facile',
                'corps_de_seance' => '25 min fartlek: 2 min rapide / 2 min lent (6 répétitions)',
                'recuperation' => '10 min footing très lent',
            ],
            [
                'description' => 'Allure spécifique semi',
                'duration' => '1h05',
                'session_type' => 'Allure spécifique',
                'echauffement' => '15 min footing + gammes',
                'corps_de_seance' => '2 x 15 min à allure semi (5\'30/km) - Récup: 3 min trot',
                'recuperation' => '12 min récupération active',
            ],
        ];

        $footingSessions = [
            ['description' => 'Footing récupération', 'duration' => '35 min', 'session_type' => 'Endurance'],
            ['description' => 'Footing endurance', 'duration' => '45 min', 'session_type' => 'Endurance'],
            ['description' => 'Footing vallonné', 'duration' => '50 min', 'session_type' => 'Endurance'],
        ];

        $longRuns = [
            ['description' => 'Sortie longue progressive', 'duration' => '1h15', 'session_type' => 'Endurance longue'],
            ['description' => 'Sortie longue avec finish rapide', 'duration' => '1h20', 'session_type' => 'Endurance longue'],
            ['description' => 'Sortie longue en terrain varié', 'duration' => '1h10', 'session_type' => 'Endurance longue'],
        ];

        while ($currentMonday->lte($endDate)) {
            $weekEnd = $currentMonday->copy()->endOfWeek(Carbon::SUNDAY);
            if ($weekEnd->gt($endDate)) {
                $weekEnd = $endDate->copy();
            }

            $days = [];
            $currentDay = $currentMonday->copy();

            while ($currentDay->lte($weekEnd)) {
                $dayName = $this->getDayNameFr($currentDay->dayOfWeek);
                $dateStr = $currentDay->format('d/m');

                // Available days: tuesday, thursday, saturday, sunday
                $dayOfWeek = strtolower($currentDay->englishDayOfWeek);
                $isTrainingDay = in_array($dayOfWeek, ['tuesday', 'thursday', 'saturday', 'sunday']);

                if ($isTrainingDay) {
                    if ($dayOfWeek === 'tuesday') {
                        // Qualitative session
                        $session = $qualitativeSessions[($weekNumber - 1) % count($qualitativeSessions)];
                        $type = 'qualitative';
                    } elseif ($dayOfWeek === 'thursday') {
                        // Footing
                        $session = $footingSessions[($weekNumber - 1) % count($footingSessions)];
                        $type = 'footing';
                    } elseif ($dayOfWeek === 'saturday') {
                        // Short footing or rest
                        $session = ['description' => 'Footing souple', 'duration' => '30 min', 'session_type' => 'Récupération'];
                        $type = 'footing';
                    } else {
                        // Sunday - Long run
                        $session = $longRuns[($weekNumber - 1) % count($longRuns)];
                        $type = 'footing';
                    }

                    $days[] = [
                        'day_name' => $dayName,
                        'date' => $dateStr,
                        'type' => $type,
                        'content' => $session,
                    ];
                } else {
                    $days[] = [
                        'day_name' => $dayName,
                        'date' => $dateStr,
                        'type' => 'repos',
                        'content' => ['description' => 'Repos'],
                    ];
                }

                $currentDay->addDay();
            }

            $weeks[] = [
                'week_number' => $weekNumber,
                'start_date' => $currentMonday->format('d/m'),
                'end_date' => $weekEnd->format('d/m'),
                'days' => $days,
            ];

            $currentMonday->addWeek();
            $weekNumber++;
        }

        return $weeks;
    }

    private function getDayNameFr(int $dayOfWeek): string
    {
        $days = [
            0 => 'Dimanche',
            1 => 'Lundi',
            2 => 'Mardi',
            3 => 'Mercredi',
            4 => 'Jeudi',
            5 => 'Vendredi',
            6 => 'Samedi',
        ];

        return $days[$dayOfWeek] ?? 'Lundi';
    }
}
