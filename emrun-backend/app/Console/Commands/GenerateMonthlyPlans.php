<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\User;
use App\Services\PlanGeneratorService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * GenerateMonthlyPlans Command
 *
 * Generates monthly training plans for all active subscribers.
 * Should be scheduled to run every first Monday of the month.
 */
class GenerateMonthlyPlans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plans:generate-monthly
                            {--dry-run : Run without actually generating plans}
                            {--user= : Generate plan for a specific user ID only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly training plans for all active subscribers';

    /**
     * Execute the console command.
     */
    public function handle(PlanGeneratorService $planGeneratorService): int
    {
        $today = Carbon::now();
        $dryRun = $this->option('dry-run');
        $specificUserId = $this->option('user');

        // Log start
        Log::info('Starting monthly plan generation', [
            'date' => $today->toDateString(),
            'dry_run' => $dryRun,
            'specific_user' => $specificUserId,
        ]);

        $this->info('Starting monthly plan generation...');
        $this->info('Date: ' . $today->toDateString());

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No plans will be generated');
        }

        // Get eligible users
        $query = User::query()
            ->whereHas('subscription', function ($q) {
                $q->where('status', 'active');
            })
            ->whereHas('profile', function ($q) {
                $q->where('questionnaire_completed', true);
            });

        if ($specificUserId) {
            $query->where('id', $specificUserId);
        }

        $users = $query->get();

        $this->info("Found {$users->count()} eligible users");

        $successCount = 0;
        $errorCount = 0;
        $skippedCount = 0;

        foreach ($users as $user) {
            $this->line("Processing user {$user->id} ({$user->email})...");

            try {
                if ($dryRun) {
                    $this->info("  [DRY RUN] Would generate plan for user {$user->id}");
                    $successCount++;
                    continue;
                }

                $plan = $planGeneratorService->generateMonthlyPlan($user);

                $this->info("  Generated plan {$plan->id} ({$plan->start_date->format('d/m')} - {$plan->end_date->format('d/m')})");

                Log::info('Monthly plan generated for user', [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                ]);

                $successCount++;
            } catch (\Exception $e) {
                // Check if it's a "plan already exists" error
                if (str_contains($e->getMessage(), 'already exists')) {
                    $this->warn("  Skipped - plan already exists for this period");
                    $skippedCount++;
                    continue;
                }

                $this->error("  Failed: {$e->getMessage()}");

                Log::error('Monthly plan generation failed for user', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);

                $errorCount++;
            }
        }

        // Summary
        $this->newLine();
        $this->info('=== Generation Complete ===');
        $this->info("Success: {$successCount}");
        $this->info("Skipped: {$skippedCount}");
        $this->info("Errors: {$errorCount}");

        Log::info('Monthly plan generation completed', [
            'success' => $successCount,
            'skipped' => $skippedCount,
            'errors' => $errorCount,
        ]);

        return $errorCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
