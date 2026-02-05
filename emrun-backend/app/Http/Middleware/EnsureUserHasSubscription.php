<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserHasSubscription Middleware
 *
 * Ensures authenticated user has an active subscription.
 * Used to protect AI plan routes and other subscription-gated features.
 */
class EnsureUserHasSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
            ], 401);
        }

        // Check if user has active subscription
        $hasActiveSubscription = $user->subscriptions()
            ->whereIn('status', ['active', 'trialing'])
            ->exists();

        if (!$hasActiveSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Active subscription required',
                'error' => 'subscription_required',
            ], 403);
        }

        return $next($request);
    }
}
