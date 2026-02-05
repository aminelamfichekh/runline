<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\PlanGeneratorService;
use App\Models\User;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Schedule monthly plan generation.
 * 
 * This runs every first Monday of the month at 2:00 AM.
 * Generates monthly plans for all active subscribers.
 */
Schedule::call(function () {
    $planGeneratorService = app(PlanGeneratorService::class);
    
    // Get all users with active subscriptions and completed questionnaires
    $users = User::whereHas('subscription', function ($query) {
        $query->where('status', 'active');
    })->whereHas('profile', function ($query) {
        $query->where('questionnaire_completed', true);
    })->get();

    foreach ($users as $user) {
        try {
            $planGeneratorService->generateMonthlyPlan($user);
            \Log::info('Monthly plan generation scheduled for user', [
                'user_id' => $user->id,
            ]);
        } catch (\Exception $e) {
            // If plan already exists, that's okay - just log info instead of error
            if (str_contains($e->getMessage(), 'already exists')) {
                \Log::info('Monthly plan already exists for user', [
                    'user_id' => $user->id,
                ]);
            } else {
                \Log::error('Failed to generate monthly plan for user', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
})->monthlyOn(1, '2:00')->when(function () {
    // Only run on the first Monday of the month
    $now = Carbon::now();
    $firstOfMonth = $now->copy()->firstOfMonth();
    
    // Find the first Monday of the month
    while ($firstOfMonth->dayOfWeek !== Carbon::MONDAY) {
        $firstOfMonth->addDay();
    }
    
    return $now->isSameDay($firstOfMonth);
})->timezone('UTC');

/**
 * Schedule daily subscription check.
 * 
 * Check for subscriptions expiring soon and send notifications.
 */
Schedule::call(function () {
    $notificationService = app(\App\Services\NotificationService::class);
    
    // Get subscriptions expiring in 3 days
    $expiringSubscriptions = \App\Models\Subscription::where('status', 'active')
        ->where('current_period_end', '>=', Carbon::now())
        ->where('current_period_end', '<=', Carbon::now()->addDays(3))
        ->get();

    foreach ($expiringSubscriptions as $subscription) {
        $daysRemaining = Carbon::now()->diffInDays($subscription->current_period_end);
        if ($daysRemaining > 0 && $daysRemaining <= 3) {
            $notificationService->notifySubscriptionExpiring($subscription->user, $daysRemaining);
        }
    }
})->dailyAt('10:00')->timezone('UTC');
