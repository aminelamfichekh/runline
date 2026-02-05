<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\DeviceToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

/**
 * NotificationService
 * 
 * Handles all notification-related business logic.
 * Manages Firebase Cloud Messaging push notifications.
 */
class NotificationService
{
    /**
     * Send a push notification to user.
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param string $type
     * @param array|null $data
     * @return void
     */
    public function sendNotification(User $user, string $title, string $body, string $type = 'general', ?array $data = null): void
    {
        // Create notification record
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'status' => 'pending',
        ]);

        // Get active device tokens for the user
        $deviceTokens = DeviceToken::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        if ($deviceTokens->isEmpty()) {
            $notification->update([
                'status' => 'failed',
                'error_message' => 'No active device tokens found',
            ]);
            return;
        }

        // Send notification to each device
        $successCount = 0;
        $failCount = 0;

        foreach ($deviceTokens as $deviceToken) {
            try {
                $this->sendToDevice($deviceToken->token, $title, $body, $data);
                $successCount++;
                
                // Update last used timestamp
                $deviceToken->update(['last_used_at' => now()]);
            } catch (\Exception $e) {
                $failCount++;
                Log::error('Failed to send notification to device', [
                    'device_token_id' => $deviceToken->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);

                // If token is invalid, mark as inactive
                if (str_contains($e->getMessage(), 'invalid') || str_contains($e->getMessage(), 'not found')) {
                    $deviceToken->update(['is_active' => false]);
                }
            }
        }

        // Update notification status
        if ($successCount > 0) {
            $notification->update([
                'status' => $failCount > 0 ? 'sent' : 'sent', // Partial success still counts as sent
                'sent_at' => now(),
            ]);
        } else {
            $notification->update([
                'status' => 'failed',
                'error_message' => "Failed to send to all devices. Success: {$successCount}, Failed: {$failCount}",
            ]);
        }
    }

    /**
     * Send notification to a specific device via Firebase Cloud Messaging.
     *
     * @param string $token
     * @param string $title
     * @param string $body
     * @param array|null $data
     * @return void
     * @throws \Exception
     */
    private function sendToDevice(string $token, string $title, string $body, ?array $data = null): void
    {
        $fcmServerKey = config('services.firebase.server_key');
        $fcmUrl = 'https://fcm.googleapis.com/fcm/send';

        if (!$fcmServerKey) {
            throw new \Exception('Firebase server key not configured');
        }

        $payload = [
            'to' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
            ],
        ];

        if ($data) {
            $payload['data'] = $data;
        }

        $response = Http::withHeaders([
            'Authorization' => 'key=' . $fcmServerKey,
            'Content-Type' => 'application/json',
        ])->post($fcmUrl, $payload);

        if (!$response->successful()) {
            $error = $response->json();
            throw new \Exception('FCM error: ' . ($error['error']['message'] ?? $response->body()));
        }

        $responseData = $response->json();
        
        if (isset($responseData['failure']) && $responseData['failure'] > 0) {
            throw new \Exception('FCM delivery failed: ' . ($responseData['results'][0]['error'] ?? 'Unknown error'));
        }
    }

    /**
     * Register a device token for a user.
     *
     * @param User $user
     * @param string $token
     * @param string|null $platform
     * @param string|null $deviceId
     * @return DeviceToken
     */
    public function registerDeviceToken(User $user, string $token, ?string $platform = null, ?string $deviceId = null): DeviceToken
    {
        return DeviceToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $token,
            ],
            [
                'platform' => $platform,
                'device_id' => $deviceId,
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );
    }

    /**
     * Unregister a device token.
     *
     * @param User $user
     * @param string $token
     * @return bool
     */
    public function unregisterDeviceToken(User $user, string $token): bool
    {
        return DeviceToken::where('user_id', $user->id)
            ->where('token', $token)
            ->update(['is_active' => false]) > 0;
    }

    /**
     * Send notification when plan is generated.
     *
     * @param User $user
     * @param string $planType
     * @return void
     */
    public function notifyPlanGenerated(User $user, string $planType): void
    {
        $title = $planType === 'initial' ? 'Plan initial généré' : 'Plan mensuel généré';
        $body = $planType === 'initial' 
            ? 'Votre plan d\'entraînement initial est prêt !' 
            : 'Votre nouveau plan mensuel est disponible.';

        $this->sendNotification($user, $title, $body, 'plan_generated', [
            'plan_type' => $planType,
        ]);
    }

    /**
     * Send notification when subscription is renewed.
     *
     * @param User $user
     * @return void
     */
    public function notifySubscriptionRenewed(User $user): void
    {
        $this->sendNotification(
            $user,
            'Abonnement renouvelé',
            'Votre abonnement a été renouvelé avec succès.',
            'subscription_renewed'
        );
    }

    /**
     * Send notification when subscription is about to expire.
     *
     * @param User $user
     * @param int $daysRemaining
     * @return void
     */
    public function notifySubscriptionExpiring(User $user, int $daysRemaining): void
    {
        $this->sendNotification(
            $user,
            'Abonnement expire bientôt',
            "Votre abonnement expire dans {$daysRemaining} jour(s).",
            'subscription_expiring',
            ['days_remaining' => $daysRemaining]
        );
    }
}

