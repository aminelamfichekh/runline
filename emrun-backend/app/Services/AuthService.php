<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

/**
 * AuthService
 * 
 * Handles all authentication-related business logic.
 * Responsible for user registration, login, and token management.
 */
class AuthService
{
    /**
     * Register a new user.
     *
     * @param array $data
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(array $data): array
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'session_uuid' => 'nullable|string|uuid|exists:questionnaire_sessions,session_uuid',
        ]);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Create user in database
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Verify user was created
        if (!$user || !$user->id) {
            throw new \Exception('Failed to create user in database');
        }

        // ATTACH SESSION AUTOMATIQUEMENT si session_uuid fourni
        if (!empty($data['session_uuid'])) {
            try {
                $session = \App\Models\QuestionnaireSession::where('session_uuid', $data['session_uuid'])->first();
                
                if ($session && !$session->user_id) {
                    // Vérifier que l'email de la session correspond (si présent dans le payload)
                    $sessionEmail = $session->payload['email'] ?? null;
                    if ($sessionEmail && $sessionEmail !== $data['email']) {
                        Log::warning('Session email mismatch during signup', [
                            'session_email' => $sessionEmail,
                            'signup_email' => $data['email'],
                            'session_uuid' => $data['session_uuid'],
                        ]);
                        // Ne pas attacher si email différent (sécurité)
                        // Mais ne pas faire échouer l'inscription
                    } else {
                        // Appeler la méthode attachFromSignup du controller
                        $questionnaireController = app(\App\Http\Controllers\Api\QuestionnaireSessionController::class);
                        $questionnaireController->attachFromSignup($data['session_uuid'], $user);
                        
                        Log::info('Session attached automatically during signup', [
                            'user_id' => $user->id,
                            'session_uuid' => $data['session_uuid'],
                        ]);
                    }
                } elseif ($session && $session->user_id) {
                    Log::warning('Attempted to attach already attached session during signup', [
                        'user_id' => $user->id,
                        'session_uuid' => $data['session_uuid'],
                        'existing_user_id' => $session->user_id,
                    ]);
                }
            } catch (\Illuminate\Validation\ValidationException $e) {
                // Questionnaire incomplet - logger mais ne pas faire échouer l'inscription
                Log::warning('Questionnaire incomplete during signup attach', [
                    'user_id' => $user->id,
                    'session_uuid' => $data['session_uuid'],
                    'errors' => $e->errors(),
                ]);
            } catch (\Exception $e) {
                // Logger l'erreur mais ne pas faire échouer l'inscription
                Log::error('Failed to attach session during signup', [
                    'user_id' => $user->id,
                    'session_uuid' => $data['session_uuid'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Generate JWT tokens
        $token = JWTAuth::fromUser($user);
        if (!$token) {
            throw new \Exception('Failed to generate JWT token');
        }
        
        $refreshToken = $this->generateRefreshToken($user);

        // Return user data without password
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
        ];

        return [
            'user' => $userData,
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl') * 60,
        ];
    }

    /**
     * Login a user.
     *
     * @param array $credentials
     * @return array
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function login(array $credentials): array
    {
        $validator = Validator::make($credentials, [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        $token = JWTAuth::attempt($credentials);

        if (!$token) {
            throw new \Exception('Invalid credentials', 401);
        }

        $user = JWTAuth::user();
        
        if (!$user) {
            throw new \Exception('User not found after authentication', 401);
        }
        
        $refreshToken = $this->generateRefreshToken($user);

        // Return user data without password
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
        ];

        return [
            'user' => $userData,
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl') * 60,
        ];
    }

    /**
     * Refresh the access token.
     *
     * @param string $refreshToken
     * @return array
     * @throws \Exception
     */
    public function refreshToken(string $refreshToken): array
    {
        try {
            // In a production app, you'd validate the refresh token against a database
            // For now, we'll decode it and get the user ID
            $decoded = JWTAuth::setToken($refreshToken)->getPayload();
            $userId = $decoded->get('sub');

            $user = User::findOrFail($userId);
            $newToken = JWTAuth::fromUser($user);
            $newRefreshToken = $this->generateRefreshToken($user);

            return [
                'access_token' => $newToken,
                'refresh_token' => $newRefreshToken,
                'token_type' => 'bearer',
                'expires_in' => (int) config('jwt.ttl') * 60,
            ];
        } catch (JWTException $e) {
            throw new \Exception('Invalid refresh token', 401);
        }
    }

    /**
     * Generate a refresh token for the user.
     *
     * @param User $user
     * @return string
     */
    private function generateRefreshToken(User $user): string
    {
        $payload = [
            'sub' => $user->id,
            'iat' => now()->timestamp,
            'exp' => now()->addMinutes((int) config('jwt.refresh_ttl'))->timestamp,
        ];

        return JWTAuth::getJWTProvider()->encode($payload);
    }

    /**
     * Logout the current user.
     *
     * @return void
     */
    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    /**
     * Get the authenticated user.
     *
     * @return User|null
     */
    public function getAuthenticatedUser(): ?User
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (JWTException $e) {
            return null;
        }
    }

    /**
     * Change user password.
     *
     * @param User $user
     * @param array $data
     * @return void
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function changePassword(User $user, array $data): void
    {
        $validator = Validator::make($data, [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Verify current password
        if (!Hash::check($data['current_password'], $user->password)) {
            throw new \Exception('Current password is incorrect', 422);
        }

        // Update password
        $user->password = Hash::make($data['password']);
        $user->save();
    }
}

