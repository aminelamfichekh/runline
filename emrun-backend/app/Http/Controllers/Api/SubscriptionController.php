<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Services\PlanGeneratorService;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Stripe\StripeClient;
use App\Models\QuestionnaireSession;
use Carbon\Carbon;

/**
 * SubscriptionController
 * 
 * Handles subscription endpoints.
 * HTTP layer only - validation and response formatting.
 */
class SubscriptionController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
        // Middleware is applied in routes/api.php for Laravel 12
    }

    /**
     * Verify user has completed questionnaire before allowing payment.
     *
     * @param \App\Models\User $user
     * @return bool
     */
    private function hasCompletedQuestionnaire($user): bool
    {
        // Check if user has a profile (created when questionnaire is completed)
        if ($user->profile) {
            return true;
        }

        // Also check if there's a completed questionnaire session attached to the user
        $session = QuestionnaireSession::where('user_id', $user->id)
            ->where('is_complete', true)
            ->first();

        return $session !== null;
    }

    /**
     * Get the user's current subscription.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $subscription = $this->paymentService->getCurrentSubscription($user);

            if (!$subscription) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'subscription' => null,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'subscription' => $subscription,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get subscription', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération de l\'abonnement.',
            ], 500);
        }
    }

    /**
     * Create a Stripe checkout session.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkout(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'price_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = Auth::user();

            if (!$this->hasCompletedQuestionnaire($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veuillez compléter le questionnaire avant de procéder au paiement.',
                    'code' => 'QUESTIONNAIRE_INCOMPLETE',
                ], 403);
            }

            $session = $this->paymentService->createCheckoutSession($user, $request->price_id);

            return response()->json([
                'success' => true,
                'message' => 'Checkout session created',
                'data' => [
                    'checkout_url' => $session->url,
                    'session_id' => $session->id,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create checkout session', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création de la session de paiement.',
            ], 500);
        }
    }

    /**
     * Create a subscription with PaymentSheet.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createSubscription(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'priceId' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = Auth::user();

            if (!$this->hasCompletedQuestionnaire($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veuillez compléter le questionnaire avant de procéder au paiement.',
                    'code' => 'QUESTIONNAIRE_INCOMPLETE',
                ], 403);
            }

            $priceId = $request->input('priceId');

            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

            // Get or create Stripe customer
            $customerId = $this->paymentService->getOrCreateCustomer($user);

            // Create ephemeral key for PaymentSheet
            $ephemeralKey = $stripe->ephemeralKeys->create(
                ['customer' => $customerId],
                ['stripe_version' => '2023-10-16']
            );

            // Create subscription with payment
            $subscription = $stripe->subscriptions->create([
                'customer' => $customerId,
                'items' => [['price' => $priceId]],
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
                'expand' => ['latest_invoice.payment_intent'],
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'subscriptionId' => $subscription->id,
                    'clientSecret' => $subscription->latest_invoice->payment_intent->client_secret,
                    'ephemeralKey' => $ephemeralKey->secret,
                    'customerId' => $customerId,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create subscription', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création de l\'abonnement.',
            ], 500);
        }
    }

    /**
     * Create a PaymentIntent for embedded Stripe Payment Element (web flow).
     *
     * This does NOT use Stripe Checkout or PaymentSheet. It returns a client secret
     * and the publishable key so the frontend can mount Stripe Elements.
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount'   => 'required|integer|min:1', // amount in smallest currency unit (e.g. cents)
                'currency' => 'sometimes|string|size:3',
                'plan'     => 'sometimes|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $user     = Auth::user();

            if (!$this->hasCompletedQuestionnaire($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Veuillez compléter le questionnaire avant de procéder au paiement.',
                    'code' => 'QUESTIONNAIRE_INCOMPLETE',
                ], 403);
            }

            $amount   = $request->input('amount');
            $currency = $request->input('currency', 'eur');
            $plan     = $request->input('plan', 'default');

            $stripe = new StripeClient(config('services.stripe.secret'));

            // Reuse existing helper to get or create a Stripe customer for this user
            $customerId = $this->paymentService->getOrCreateCustomer($user);

            $intent = $stripe->paymentIntents->create([
                'amount'   => $amount,
                'currency' => $currency,
                'customer' => $customerId,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'user_id' => $user->id,
                    'plan'    => $plan,
                ],
            ]);

            return response()->json([
                'success' => true,
                'data'    => [
                    'clientSecret'   => $intent->client_secret,
                    'publishableKey' => config('services.stripe.key'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create payment intent', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création du paiement.',
            ], 500);
        }
    }

    /**
     * Get subscription status.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $subscription = $this->paymentService->getCurrentSubscription($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $subscription ? $subscription->status : 'inactive',
                    'subscription' => $subscription,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get subscription status', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération du statut.',
            ], 500);
        }
    }

    /**
     * Get the user's default payment method details.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function paymentMethod(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $paymentMethod = $this->paymentService->getDefaultPaymentMethod($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_method' => $paymentMethod,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get payment method', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération du moyen de paiement.',
            ], 500);
        }
    }

    /**
     * Create a SetupIntent for updating payment method.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createSetupIntent(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $data = $this->paymentService->createSetupIntent($user);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create setup intent', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    /**
     * Cancel the user's subscription.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function cancel(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $subscription = $this->paymentService->cancelSubscription($user);

            return response()->json([
                'success' => true,
                'message' => 'Subscription cancelled successfully',
                'data' => [
                    'subscription' => $subscription,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cancel subscription', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'annulation de l\'abonnement.',
            ], 500);
        }
    }

    /**
     * DEV ONLY: Skip payment, create test subscription, and trigger plan generation.
     *
     * @param Request $request
     * @param PlanGeneratorService $planGeneratorService
     * @return JsonResponse
     */
    public function skipPayment(Request $request, PlanGeneratorService $planGeneratorService): JsonResponse
    {
        // Block in production
        if (config('app.env') === 'production') {
            return response()->json([
                'success' => false,
                'message' => 'Not available in production',
            ], 403);
        }

        try {
            $user = Auth::user();

            // 1. Create or update test subscription to active
            $subscription = Subscription::where('user_id', $user->id)->first();

            if (!$subscription) {
                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'stripe_subscription_id' => 'test_sub_' . uniqid(),
                    'stripe_customer_id' => 'test_cus_' . uniqid(),
                    'stripe_price_id' => 'test_price',
                    'status' => 'active',
                    'current_period_start' => Carbon::now(),
                    'current_period_end' => Carbon::now()->addMonth(),
                ]);
            } else {
                $subscription->update([
                    'status' => 'active',
                    'current_period_start' => Carbon::now(),
                    'current_period_end' => Carbon::now()->addMonth(),
                ]);
            }

            Log::info('Test subscription created/activated', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
            ]);

            // 2. Trigger plan generation if questionnaire is completed
            $plan = null;
            if ($user->profile && $user->profile->questionnaire_completed) {
                // Delete any existing failed plans so we can regenerate
                \App\Models\Plan::where('user_id', $user->id)
                    ->where('status', 'failed')
                    ->delete();

                // Check if a plan is already generating or completed
                $existingPlan = \App\Models\Plan::where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'generating', 'completed'])
                    ->first();

                if (!$existingPlan) {
                    // Create the plan record
                    $startDate = \Carbon\Carbon::now()->next(\Carbon\Carbon::MONDAY);
                    $endDate = $startDate->copy()->addWeeks(4)->subDay();

                    $plan = \App\Models\Plan::create([
                        'user_id' => $user->id,
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'type' => 'initial',
                        'status' => 'pending',
                        'content' => [],
                    ]);

                    // Run synchronously instead of queuing (no queue:work needed)
                    \App\Jobs\GeneratePlanJob::dispatchSync($plan, 'initial');
                    $plan->refresh();

                    Log::info('Plan generated synchronously via skip-payment', [
                        'user_id' => $user->id,
                        'plan_id' => $plan->id,
                        'status' => $plan->status,
                    ]);
                } else {
                    $plan = $existingPlan;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Test subscription activated and plan generation triggered',
                'data' => [
                    'subscription' => $subscription,
                    'plan' => $plan,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Skip payment failed', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}

