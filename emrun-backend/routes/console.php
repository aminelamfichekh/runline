<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Schedule monthly plan generation.
 *
 * This runs every first Monday of the month at 2:00 AM (Paris time).
 * Generates monthly plans for all active subscribers.
 */
Schedule::command('plans:generate-monthly')
    ->monthlyOn(1, '02:00')
    ->when(function () {
        // Only run on the first Monday of the month
        $now = Carbon::now('Europe/Paris');
        $firstOfMonth = $now->copy()->firstOfMonth();

        // Find the first Monday of the month
        while ($firstOfMonth->dayOfWeek !== Carbon::MONDAY) {
            $firstOfMonth->addDay();
        }

        return $now->isSameDay($firstOfMonth);
    })
    ->timezone('Europe/Paris')
    ->withoutOverlapping()
    ->runInBackground();

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
