<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Subscription;
use App\Models\Plan;
use App\Services\PlanGeneratorService;
use App\Jobs\GeneratePlanJob;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * TestPlanGeneration Command
 *
 * Testing command to simulate the full plan generation flow
 * without requiring Stripe payments.
 */
class TestPlanGeneration extends Command
{
    protected $signature = 'test:plan-generation
                            {--user= : Use existing user ID}
                            {--email=test@runline.app : Email for new test user}
                            {--skip-openai : Skip OpenAI call and use mock data}
                            {--sync : Run synchronously instead of queued}
                            {--cleanup : Remove test data after showing results}';

    protected $description = 'Test the full plan generation flow without Stripe';

    public function handle(PlanGeneratorService $planGeneratorService): int
    {
        $this->info('');
        $this->info('========================================');
        $this->info('   RUNLINE - Test Plan Generation');
        $this->info('========================================');
        $this->info('');

        // Step 1: Get or create test user
        $user = $this->getOrCreateTestUser();
        if (!$user) {
            return Command::FAILURE;
        }

        $this->info("User: {$user->email} (ID: {$user->id})");

        // Step 2: Ensure user has a complete profile
        $this->ensureProfile($user);
        $this->info("Profile: Questionnaire completed");

        // Step 3: Ensure user has an active subscription
        $this->ensureSubscription($user);
        $this->info("Subscription: Active (test mode)");

        // Step 4: Generate the plan
        $this->info('');
        $this->info('--- Generating Plan ---');

        if ($this->option('skip-openai')) {
            $plan = $this->createMockPlan($user, $planGeneratorService);
            $this->info("Plan created with MOCK data (ID: {$plan->id})");
        } else {
            try {
                // Check if plan already exists
                $existingPlan = Plan::where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'generating', 'completed'])
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($existingPlan) {
                    $this->warn("Existing plan found (ID: {$existingPlan->id}, status: {$existingPlan->status})");

                    if (!$this->confirm('Delete existing plan and create new one?', true)) {
                        $this->showPlanSummary($existingPlan);
                        return Command::SUCCESS;
                    }

                    $existingPlan->delete();
                }

                $plan = $planGeneratorService->generateInitialPlan($user);

                if ($this->option('sync')) {
                    $this->info("Running job synchronously...");
                    GeneratePlanJob::dispatchSync($plan, 'initial');
                    $plan->refresh();
                } else {
                    $this->info("Job dispatched to queue (ID: {$plan->id})");
                    $this->info("Run 'php artisan queue:work' in another terminal to process");

                    // Wait and poll for completion
                    $this->info('');
                    if ($this->confirm('Wait for job completion?', true)) {
                        $this->waitForPlanCompletion($plan);
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to generate plan: {$e->getMessage()}");
                return Command::FAILURE;
            }
        }

        // Step 5: Show results
        $plan->refresh();
        $this->showPlanSummary($plan);

        // Cleanup if requested
        if ($this->option('cleanup')) {
            $this->info('');
            if ($this->confirm('Delete all test data?', false)) {
                $this->cleanupTestData($user);
            }
        }

        return Command::SUCCESS;
    }

    private function getOrCreateTestUser(): ?User
    {
        if ($userId = $this->option('user')) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User ID {$userId} not found");
                return null;
            }
            return $user;
        }

        $email = $this->option('email');
        $user = User::where('email', $email)->first();

        if ($user) {
            $this->info("Using existing user: {$email}");
            return $user;
        }

        $this->info("Creating new test user: {$email}");

        return User::create([
            'email' => $email,
            'password' => Hash::make('testpassword123'),
            'name' => 'Test Runner',
        ]);
    }

    private function ensureProfile(User $user): void
    {
        $profile = $user->profile;

        if (!$profile) {
            $profile = UserProfile::create([
                'user_id' => $user->id,
            ]);
        }

        // Fill with realistic test data
        $profile->update([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'birth_date' => Carbon::now()->subYears(32),
            'gender' => 'male',
            'height_cm' => 178,
            'weight_kg' => 75,
            'primary_goal' => 'ameliorer_chrono',
            'race_distance' => 'semi_marathon',
            'target_race_date' => Carbon::now()->addMonths(3),
            'intermediate_objectives' => 'Courir un 10km en moins de 45 minutes',
            'current_weekly_volume_km' => 30,
            'current_runs_per_week' => '3_4',
            'available_days' => ['monday', 'wednesday', 'friday', 'sunday'],
            'running_experience_period' => '1_10_ans',
            'running_experience_years' => '3',
            'problem_to_solve' => 'structure',
            'training_locations' => ['route', 'chemins'],
            'equipment' => 'Montre GPS Garmin, chaussures trail',
            'personal_constraints' => 'Travail de bureau, disponible le matin avant 8h',
            'injuries' => ['Ancienne tendinite achille (guérie)'],
            'current_race_times' => [
                ['distance' => '10km', 'time' => '48:30'],
                ['distance' => '5km', 'time' => '22:15'],
            ],
            'questionnaire_completed' => true,
        ]);
    }

    private function ensureSubscription(User $user): void
    {
        $subscription = $user->subscription;

        if (!$subscription) {
            $subscription = new Subscription();
            $subscription->user_id = $user->id;
        }

        $subscription->stripe_subscription_id = 'test_sub_' . uniqid();
        $subscription->stripe_customer_id = 'test_cus_' . uniqid();
        $subscription->status = 'active';
        $subscription->current_period_start = Carbon::now();
        $subscription->current_period_end = Carbon::now()->addMonth();
        $subscription->save();
    }

    private function createMockPlan(User $user, PlanGeneratorService $planGeneratorService): Plan
    {
        $startDate = Carbon::now()->next(Carbon::MONDAY);
        $endDate = $planGeneratorService->calculateWeeks($startDate, $startDate->copy()->addWeeks(4))[3]['end_date_iso'] ?? $startDate->copy()->addWeeks(4)->endOfWeek(Carbon::SUNDAY);

        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        // Generate weeks structure
        $weeks = $planGeneratorService->calculateWeeks($startDate, $endDate);

        // Create mock content
        $mockContent = [
            'weeks' => array_map(function ($week) {
                return [
                    'week_number' => $week['week_number'],
                    'start_date' => $week['start_date'],
                    'end_date' => $week['end_date'],
                    'days' => array_map(function ($day) {
                        $types = ['repos', 'footing', 'qualitative', 'footing', 'repos', 'qualitative', 'footing'];
                        $type = $types[array_search($day['day_name'], ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'])] ?? 'repos';

                        return [
                            'day_name' => $day['day_name'],
                            'date' => $day['date'],
                            'type' => $type,
                            'content' => $this->getMockSessionContent($type),
                        ];
                    }, $week['days']),
                ];
            }, $weeks),
        ];

        return Plan::create([
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'type' => 'initial',
            'status' => 'completed',
            'content' => $mockContent,
        ]);
    }

    private function getMockSessionContent(string $type): array
    {
        return match ($type) {
            'repos' => [
                'description' => 'Repos complet',
            ],
            'footing' => [
                'description' => 'Footing en endurance fondamentale',
                'duration' => '45 min',
                'session_type' => 'Endurance',
            ],
            'qualitative' => [
                'description' => 'Séance de fractionné',
                'duration' => '1h',
                'session_type' => 'VMA',
                'echauffement' => '15 min footing + gammes',
                'corps_de_seance' => '8 x 400m à 95% VMA, récup 1\'30 trot',
                'recuperation' => '10 min footing lent',
            ],
            'course' => [
                'description' => 'Course objectif',
                'race_distance' => '10km',
            ],
            default => ['description' => 'Session'],
        };
    }

    private function waitForPlanCompletion(Plan $plan): void
    {
        $maxWait = 120; // 2 minutes
        $elapsed = 0;

        $this->output->write('Waiting');

        while ($elapsed < $maxWait) {
            sleep(3);
            $elapsed += 3;
            $this->output->write('.');

            $plan->refresh();

            if ($plan->status === 'completed') {
                $this->info(' Done!');
                return;
            }

            if ($plan->status === 'failed') {
                $this->error(' Failed!');
                $this->error("Error: {$plan->error_message}");
                return;
            }
        }

        $this->warn(' Timeout (plan still processing)');
    }

    private function showPlanSummary(Plan $plan): void
    {
        $this->info('');
        $this->info('========================================');
        $this->info('   Plan Summary');
        $this->info('========================================');
        $this->info('');

        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $plan->id],
                ['Type', $plan->type],
                ['Status', $plan->status],
                ['Start Date', $plan->start_date?->format('d/m/Y') ?? 'N/A'],
                ['End Date', $plan->end_date?->format('d/m/Y') ?? 'N/A'],
                ['Weeks', isset($plan->content['weeks']) ? count($plan->content['weeks']) : 0],
                ['Tokens Used', $plan->openai_tokens_used ?? 'N/A'],
                ['Created', $plan->created_at->format('d/m/Y H:i')],
            ]
        );

        if ($plan->status === 'completed' && isset($plan->content['weeks'])) {
            $this->info('');
            $this->info('--- Week Breakdown ---');

            foreach ($plan->content['weeks'] as $week) {
                $sessions = array_filter($week['days'], fn($d) => $d['type'] !== 'repos');
                $this->info("Semaine {$week['week_number']} ({$week['start_date']} - {$week['end_date']}): " . count($sessions) . " séances");
            }
        }

        if ($plan->status === 'failed') {
            $this->error('');
            $this->error("Error: {$plan->error_message}");
        }

        $this->info('');
        $this->info('Test the API endpoint:');
        $this->info("  curl -H 'Authorization: Bearer <token>' http://localhost:8000/api/plans/active");
    }

    private function cleanupTestData(User $user): void
    {
        $this->info('Cleaning up test data...');

        Plan::where('user_id', $user->id)->delete();
        $this->info('  - Plans deleted');

        if ($user->subscription) {
            $user->subscription->delete();
            $this->info('  - Subscription deleted');
        }

        if ($user->profile) {
            $user->profile->delete();
            $this->info('  - Profile deleted');
        }

        if ($user->email === $this->option('email')) {
            $user->delete();
            $this->info('  - User deleted');
        }

        $this->info('Cleanup complete!');
    }
}
