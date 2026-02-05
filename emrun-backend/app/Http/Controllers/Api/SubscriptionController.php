<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Stripe\StripeClient;
use App\Models\QuestionnaireSession;

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
        $this->middleware('auth:api');
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to get subscription: ' . $e->getMessage(),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session: ' . $e->getMessage(),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription: ' . $e->getMessage(),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent: ' . $e->getMessage(),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to get subscription status: ' . $e->getMessage(),
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription: ' . $e->getMessage(),
            ], 500);
        }
    }
}

