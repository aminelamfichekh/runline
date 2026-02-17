<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
use App\Models\UserProfile;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * MockPlanSeeder
 *
 * Creates a test user with a completed questionnaire and a mock AI-generated plan.
 * Use this to test the UI flow without spending OpenAI tokens.
 *
 * Run with: php artisan db:seed --class=MockPlanSeeder
 */
class MockPlanSeeder extends Seeder
{
    public function run(): void
    {
        // Create or update test user
        $user = User::updateOrCreate(
            ['email' => 'test@runline.app'],
            [
                'name' => 'Test Runner',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("Test user created: test@runline.app / password123");

        // Create user profile with completed questionnaire
        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'gender' => 'male',
                'birth_date' => Carbon::now()->subYears(32),
                'weight_kg' => 75,
                'height_cm' => 178,
                'primary_goal' => 'courir_race',
                'race_distance' => '10km',
                'target_race_date' => Carbon::now()->addMonths(3),
                'running_experience_period' => '1_11_mois',
                'running_experience_months' => 8,
                'current_runs_per_week' => '3_4',
                'current_weekly_volume_km' => 25,
                'available_days' => ['monday', 'wednesday', 'friday', 'sunday'],
                'training_locations' => ['route', 'chemins'],
                'injuries' => [],
                'questionnaire_completed' => true,
            ]
        );

        $this->command->info("User profile created with completed questionnaire");

        // Calculate plan dates (current month)
        $startDate = $this->getFirstMondayOfMonth(Carbon::now());
        $endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

        // Generate mock plan content
        $planContent = $this->generateMockPlanContent($startDate, $endDate);

        // Create the plan
        $plan = Plan::updateOrCreate(
            [
                'user_id' => $user->id,
                'start_date' => $startDate,
            ],
            [
                'end_date' => $endDate,
                'type' => 'initial',
                'status' => 'completed',
                'content' => $planContent,
                'openai_prompt' => 'Mock plan - no API call',
                'openai_response' => json_encode($planContent),
                'openai_tokens_used' => 0,
            ]
        );

        $this->command->info("Mock plan created:");
        $this->command->info("  - Period: {$startDate->format('d/m/Y')} to {$endDate->format('d/m/Y')}");
        $this->command->info("  - Weeks: " . count($planContent['weeks']));
        $this->command->info("  - Status: completed");
        $this->command->newLine();
        $this->command->info("You can now test the app with:");
        $this->command->info("  Email: test@runline.app");
        $this->command->info("  Password: password123");
    }

    private function getFirstMondayOfMonth(Carbon $date): Carbon
    {
        $firstOfMonth = $date->copy()->firstOfMonth();

        if ($firstOfMonth->dayOfWeek === Carbon::MONDAY) {
            return $firstOfMonth;
        }

        return $firstOfMonth->next(Carbon::MONDAY);
    }

    private function getSundayBeforeNextMonthFirstMonday(Carbon $startDate): Carbon
    {
        $nextMonth = $startDate->copy()->addMonth()->firstOfMonth();

        $firstMondayNextMonth = $nextMonth->dayOfWeek === Carbon::MONDAY
            ? $nextMonth
            : $nextMonth->next(Carbon::MONDAY);

        return $firstMondayNextMonth->copy()->subDay();
    }

    private function generateMockPlanContent(Carbon $startDate, Carbon $endDate): array
    {
        $weeks = [];
        $currentMonday = $startDate->copy();
        $weekNumber = 1;

        $dayNamesFr = [
            'Monday' => 'Lundi',
            'Tuesday' => 'Mardi',
            'Wednesday' => 'Mercredi',
            'Thursday' => 'Jeudi',
            'Friday' => 'Vendredi',
            'Saturday' => 'Samedi',
            'Sunday' => 'Dimanche',
        ];

        // Session templates for variety
        $footingSessions = [
            ['duration' => '40 min', 'description' => 'Footing en aisance respiratoire'],
            ['duration' => '45 min', 'description' => 'Footing récupération, rythme très facile'],
            ['duration' => '50 min', 'description' => 'Sortie longue facile en endurance fondamentale'],
            ['duration' => '35 min', 'description' => 'Footing court, jambes fraîches'],
        ];

        $qualitativeSessions = [
            [
                'description' => 'Séance VMA courte',
                'duration' => '55 min',
                'session_type' => 'VMA',
                'echauffement' => '15 min footing + gammes',
                'corps_de_seance' => '10 x 200m en 42s, récup 200m trot',
                'recuperation' => '10 min footing lent',
            ],
            [
                'description' => 'Travail au seuil',
                'duration' => '50 min',
                'session_type' => 'Seuil',
                'echauffement' => '15 min footing progressif',
                'corps_de_seance' => '3 x 8 min à 4\'45/km, récup 2 min trot',
                'recuperation' => '10 min retour au calme',
            ],
            [
                'description' => 'Fartlek nature',
                'duration' => '45 min',
                'session_type' => 'Fartlek',
                'echauffement' => '10 min footing',
                'corps_de_seance' => '6 x (2 min vite / 2 min lent) au feeling',
                'recuperation' => '10 min footing facile',
            ],
            [
                'description' => 'Côtes',
                'duration' => '50 min',
                'session_type' => 'Côtes',
                'echauffement' => '15 min footing avec éducatifs',
                'corps_de_seance' => '8 x 45s en côte, récup descente trot',
                'recuperation' => '10 min footing plat',
            ],
        ];

        while ($currentMonday->lte($endDate)) {
            $weekEnd = $currentMonday->copy()->endOfWeek(Carbon::SUNDAY);
            if ($weekEnd->gt($endDate)) {
                $weekEnd = $endDate->copy();
            }

            $days = [];
            $currentDay = $currentMonday->copy();
            $sessionIndex = 0;

            while ($currentDay->lte($weekEnd)) {
                $dayName = $dayNamesFr[$currentDay->format('l')];
                $dayOfWeek = strtolower($currentDay->format('l'));

                // Training days: Monday, Wednesday, Friday, Sunday
                $isTrainingDay = in_array($dayOfWeek, ['monday', 'wednesday', 'friday', 'sunday']);

                if ($isTrainingDay) {
                    // Alternate between footing and qualitative
                    if ($sessionIndex % 3 === 1) {
                        // Qualitative session
                        $session = $qualitativeSessions[array_rand($qualitativeSessions)];
                        $days[] = [
                            'day_name' => $dayName,
                            'date' => $currentDay->format('d/m'),
                            'type' => 'qualitative',
                            'content' => $session,
                        ];
                    } else {
                        // Footing
                        $footing = $footingSessions[array_rand($footingSessions)];
                        $days[] = [
                            'day_name' => $dayName,
                            'date' => $currentDay->format('d/m'),
                            'type' => 'footing',
                            'content' => [
                                'description' => $footing['description'],
                                'duration' => $footing['duration'],
                            ],
                        ];
                    }
                    $sessionIndex++;
                } else {
                    // Rest day
                    $days[] = [
                        'day_name' => $dayName,
                        'date' => $currentDay->format('d/m'),
                        'type' => 'repos',
                        'content' => [
                            'description' => 'Repos complet',
                        ],
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

        return ['weeks' => $weeks];
    }
}
