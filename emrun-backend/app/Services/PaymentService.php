<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Payment;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Subscription as StripeSubscription;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * PaymentService
 * 
 * Handles all payment and subscription-related business logic.
 * Integrates with Stripe for subscription management.
 */
class PaymentService
{
    /**
     * Initialize Stripe.
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe checkout session for subscription.
     *
     * @param User $user
     * @param string $priceId
     * @return Session
     * @throws ApiErrorException
     */
    public function createCheckoutSession(User $user, string $priceId): Session
    {
        try {
            // Get or create Stripe customer
            $customerId = $this->getOrCreateCustomer($user);

            $session = Session::create([
                'customer' => $customerId,
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => config('app.frontend_url') . '/subscription/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/subscription/cancel',
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            return $session;
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get or create a Stripe customer for the user.
     *
     * @param User $user
     * @return string
     * @throws ApiErrorException
     */
    public function getOrCreateCustomer(User $user): string
    {
        // Check if user already has a subscription with customer ID
        $existingSubscription = Subscription::where('user_id', $user->id)
            ->whereNotNull('stripe_customer_id')
            ->first();

        if ($existingSubscription && $existingSubscription->stripe_customer_id) {
            return $existingSubscription->stripe_customer_id;
        }

        // Create new customer in Stripe
        $customer = \Stripe\Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        return $customer->id;
    }

    /**
     * Handle successful subscription creation from webhook.
     *
     * @param array $stripeSubscription
     * @return Subscription
     */
    public function handleSubscriptionCreated(array $stripeSubscription): Subscription
    {
        $customerId = $stripeSubscription['customer'];
        $subscriptionId = $stripeSubscription['id'];
        $priceId = $stripeSubscription['items']['data'][0]['price']['id'] ?? null;

        // Find user by customer ID
        $subscription = Subscription::where('stripe_customer_id', $customerId)->first();
        
        if (!$subscription) {
            // Try to get user from metadata if available
            $userId = $stripeSubscription['metadata']['user_id'] ?? null;
            
            if ($userId) {
                $user = User::find($userId);
            } else {
                // Fallback: get customer email from Stripe
                $customer = \Stripe\Customer::retrieve($customerId);
                $user = User::where('email', $customer->email)->first();
            }

            if (!$user) {
                throw new \Exception("User not found for customer ID: {$customerId}");
            }
        } else {
            $user = $subscription->user;
        }

        // Create or update subscription
        $subscription = Subscription::updateOrCreate(
            ['stripe_subscription_id' => $subscriptionId],
            [
                'user_id' => $user->id,
                'stripe_customer_id' => $customerId,
                'stripe_price_id' => $priceId,
                'status' => $this->mapStripeStatus($stripeSubscription['status']),
                'current_period_start' => Carbon::createFromTimestamp($stripeSubscription['current_period_start']),
                'current_period_end' => Carbon::createFromTimestamp($stripeSubscription['current_period_end']),
                'cancel_at_period_end' => $stripeSubscription['cancel_at_period_end'] ?? false,
            ]
        );

        return $subscription;
    }

    /**
     * Handle subscription update from webhook.
     *
     * @param array $stripeSubscription
     * @return Subscription
     */
    public function handleSubscriptionUpdated(array $stripeSubscription): Subscription
    {
        $subscriptionId = $stripeSubscription['id'];

        $subscription = Subscription::where('stripe_subscription_id', $subscriptionId)->firstOrFail();

        $subscription->update([
            'status' => $this->mapStripeStatus($stripeSubscription['status']),
            'current_period_start' => Carbon::createFromTimestamp($stripeSubscription['current_period_start']),
            'current_period_end' => Carbon::createFromTimestamp($stripeSubscription['current_period_end']),
            'cancel_at_period_end' => $stripeSubscription['cancel_at_period_end'] ?? false,
        ]);

        return $subscription;
    }

    /**
     * Handle subscription cancellation from webhook.
     *
     * @param array $stripeSubscription
     * @return Subscription
     */
    public function handleSubscriptionCanceled(array $stripeSubscription): Subscription
    {
        $subscriptionId = $stripeSubscription['id'];

        $subscription = Subscription::where('stripe_subscription_id', $subscriptionId)->firstOrFail();

        $subscription->update([
            'status' => 'canceled',
            'canceled_at' => Carbon::now(),
            'ended_at' => Carbon::createFromTimestamp($stripeSubscription['ended_at'] ?? time()),
        ]);

        return $subscription;
    }

    /**
     * Cancel user's subscription.
     *
     * @param User $user
     * @return Subscription
     * @throws ApiErrorException
     */
    public function cancelSubscription(User $user): Subscription
    {
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        try {
            $stripeSubscription = StripeSubscription::retrieve($subscription->stripe_subscription_id);
            $stripeSubscription->cancel();

            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => Carbon::now(),
            ]);

            return $subscription;
        } catch (ApiErrorException $e) {
            Log::error('Stripe subscription cancellation failed', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->stripe_subscription_id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's current subscription.
     *
     * @param User $user
     * @return Subscription|null
     */
    public function getCurrentSubscription(User $user): ?Subscription
    {
        return Subscription::where('user_id', $user->id)
            ->whereIn('status', ['active', 'trialing'])
            ->orderBy('created_at', 'desc')
            ->first();
    }

    /**
     * Map Stripe subscription status to our status enum.
     *
     * @param string $stripeStatus
     * @return string
     */
    private function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'active' => 'active',
            'canceled' => 'canceled',
            'past_due' => 'past_due',
            'incomplete', 'incomplete_expired' => 'incomplete',
            'trialing' => 'trialing',
            default => 'incomplete',
        };
    }

    /**
     * Get the default payment method for a user's subscription.
     *
     * @param User $user
     * @return array|null
     */
    public function getDefaultPaymentMethod(User $user): ?array
    {
        $subscription = Subscription::where('user_id', $user->id)
            ->whereNotNull('stripe_customer_id')
            ->first();

        if (!$subscription || !$subscription->stripe_customer_id) {
            return null;
        }

        try {
            $customer = \Stripe\Customer::retrieve($subscription->stripe_customer_id, [
                'expand' => ['invoice_settings.default_payment_method'],
            ]);

            $pm = $customer->invoice_settings->default_payment_method;

            if (!$pm) {
                // Fallback: check the subscription's default payment method
                $stripeSub = Subscription::where('user_id', $user->id)
                    ->whereIn('status', ['active', 'trialing'])
                    ->first();

                if ($stripeSub && $stripeSub->stripe_subscription_id) {
                    $stripeSubscription = StripeSubscription::retrieve($stripeSub->stripe_subscription_id, [
                        'expand' => ['default_payment_method'],
                    ]);
                    $pm = $stripeSubscription->default_payment_method;
                }
            }

            if (!$pm) {
                return null;
            }

            // If $pm is a string (ID), retrieve the full object
            if (is_string($pm)) {
                $pm = \Stripe\PaymentMethod::retrieve($pm);
            }

            if ($pm->type === 'card') {
                return [
                    'id' => $pm->id,
                    'brand' => $pm->card->brand,
                    'last4' => $pm->card->last4,
                    'exp_month' => $pm->card->exp_month,
                    'exp_year' => $pm->card->exp_year,
                ];
            }

            return null;
        } catch (ApiErrorException $e) {
            Log::error('Failed to get default payment method', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Create a SetupIntent for updating payment method.
     *
     * @param User $user
     * @return array
     * @throws ApiErrorException
     */
    public function createSetupIntent(User $user): array
    {
        $customerId = $this->getOrCreateCustomer($user);

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        $ephemeralKey = $stripe->ephemeralKeys->create(
            ['customer' => $customerId],
            ['stripe_version' => '2023-10-16']
        );

        $setupIntent = $stripe->setupIntents->create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'usage' => 'off_session',
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        return [
            'setupIntentClientSecret' => $setupIntent->client_secret,
            'ephemeralKey' => $ephemeralKey->secret,
            'customerId' => $customerId,
        ];
    }

    /**
     * Record a payment.
     *
     * @param User $user
     * @param array $paymentData
     * @return Payment
     */
    public function recordPayment(User $user, array $paymentData): Payment
    {
        return Payment::create([
            'user_id' => $user->id,
            'subscription_id' => $paymentData['subscription_id'] ?? null,
            'stripe_payment_intent_id' => $paymentData['payment_intent_id'] ?? null,
            'stripe_charge_id' => $paymentData['charge_id'] ?? null,
            'stripe_invoice_id' => $paymentData['invoice_id'] ?? null,
            'amount' => $paymentData['amount'] ?? 0,
            'currency' => $paymentData['currency'] ?? 'usd',
            'status' => $paymentData['status'] ?? 'pending',
            'description' => $paymentData['description'] ?? null,
            'metadata' => $paymentData['metadata'] ?? null,
        ]);
    }
}

