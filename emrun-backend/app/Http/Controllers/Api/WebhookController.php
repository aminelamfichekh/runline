<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use App\Services\NotificationService;
use App\Services\PlanGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

/**
 * WebhookController
 * 
 * Handles Stripe webhook events.
 * Verifies webhook signatures and processes subscription events.
 */
class WebhookController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected NotificationService $notificationService,
        protected PlanGeneratorService $planGeneratorService
    ) {
        // Disable CSRF protection for webhooks
        $this->middleware(\Illuminate\Routing\Middleware\ValidatePostSize::class);
    }

    /**
     * Handle Stripe webhook events.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Stripe-Signature');
            $webhookSecret = config('services.stripe.webhook_secret');

            if (!$webhookSecret) {
                Log::error('Stripe webhook secret not configured');
                return response()->json(['error' => 'Webhook secret not configured'], 500);
            }

            // Verify webhook signature
            try {
                $event = Webhook::constructEvent(
                    $payload,
                    $signature,
                    $webhookSecret
                );
            } catch (SignatureVerificationException $e) {
                Log::error('Stripe webhook signature verification failed', [
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            // Handle the event
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;

                case 'customer.subscription.created':
                    $subscription = $this->paymentService->handleSubscriptionCreated($event->data->object->toArray());
                    $this->notificationService->notifySubscriptionRenewed($subscription->user);

                    // Trigger initial plan generation after subscription payment
                    $this->triggerInitialPlanGeneration($subscription->user);
                    break;

                case 'customer.subscription.updated':
                    $this->paymentService->handleSubscriptionUpdated($event->data->object->toArray());
                    break;

                case 'customer.subscription.deleted':
                    $this->paymentService->handleSubscriptionCanceled($event->data->object->toArray());
                    break;

                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event->data->object->toArray());
                    break;

                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object->toArray());
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event', [
                        'type' => $event->type,
                    ]);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Stripe webhook handling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Webhook handling failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle checkout session completed event.
     *
     * @param object $session
     * @return void
     */
    private function handleCheckoutSessionCompleted(object $session): void
    {
        // The subscription will be handled by the subscription.created webhook
        Log::info('Checkout session completed', [
            'session_id' => $session->id,
            'customer_id' => $session->customer,
        ]);
    }

    /**
     * Handle invoice payment succeeded event.
     *
     * @param array $invoice
     * @return void
     */
    private function handleInvoicePaymentSucceeded(array $invoice): void
    {
        if (isset($invoice['subscription'])) {
            $subscription = \App\Models\Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
            
            if ($subscription) {
                // Record payment
                $this->paymentService->recordPayment($subscription->user, [
                    'subscription_id' => $subscription->id,
                    'invoice_id' => $invoice['id'],
                    'payment_intent_id' => $invoice['payment_intent'] ?? null,
                    'amount' => $invoice['amount_paid'],
                    'currency' => $invoice['currency'],
                    'status' => 'succeeded',
                    'description' => $invoice['description'] ?? 'Subscription payment',
                ]);

                // Notify user
                $this->notificationService->notifySubscriptionRenewed($subscription->user);
            }
        }
    }

    /**
     * Handle invoice payment failed event.
     *
     * @param array $invoice
     * @return void
     */
    private function handleInvoicePaymentFailed(array $invoice): void
    {
        if (isset($invoice['subscription'])) {
            $subscription = \App\Models\Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
            
            if ($subscription) {
                // Record failed payment
                $this->paymentService->recordPayment($subscription->user, [
                    'subscription_id' => $subscription->id,
                    'invoice_id' => $invoice['id'],
                    'payment_intent_id' => $invoice['payment_intent'] ?? null,
                    'amount' => $invoice['amount_due'],
                    'currency' => $invoice['currency'],
                    'status' => 'failed',
                    'description' => $invoice['description'] ?? 'Subscription payment failed',
                ]);

                Log::warning('Invoice payment failed', [
                    'subscription_id' => $subscription->id,
                    'invoice_id' => $invoice['id'],
                ]);
            }
        }
    }

    /**
     * Trigger initial plan generation after subscription payment.
     *
     * Only generates a plan if the user has completed the questionnaire.
     *
     * @param \App\Models\User $user
     * @return void
     */
    private function triggerInitialPlanGeneration(\App\Models\User $user): void
    {
        try {
            // Check if user has completed questionnaire
            if (!$user->profile || !$user->profile->questionnaire_completed) {
                Log::info('Skipping plan generation - questionnaire not completed', [
                    'user_id' => $user->id,
                ]);
                return;
            }

            // Generate initial plan (dispatches async job)
            $plan = $this->planGeneratorService->generateInitialPlan($user);

            Log::info('Initial plan generation triggered after subscription', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to trigger initial plan generation', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            // Don't re-throw - we don't want to fail the webhook for plan generation issues
        }
    }
}

