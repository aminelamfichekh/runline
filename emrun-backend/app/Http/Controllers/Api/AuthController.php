<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * AuthController
 * 
 * Handles authentication endpoints.
 * HTTP layer only - validation and response formatting.
 */
class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
        // Middleware is now applied in routes/api.php for Laravel 12
    }

    /**
     * Register a new user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $data = $this->authService->register($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur enregistré avec succès',
                'data' => $data,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error during registration', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur de base de données. Veuillez vérifier la connexion à la base de données et les migrations.',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur',
            ], 500);
        } catch (\Throwable $e) {
            \Log::error('Registration error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Échec de l\'enregistrement : ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur',
            ], 500);
        }
    }

    /**
     * Login a user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $data = $this->authService->login($request->only('email', 'password'));

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'data' => $data,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 401);
        }
    }

    /**
     * Refresh the access token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'refresh_token' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Échec de la validation',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $this->authService->refreshToken($request->refresh_token);

            return response()->json([
                'success' => true,
                'message' => 'Token rafraîchi avec succès',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 401);
        }
    }

    /**
     * Logout the current user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout();

            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la déconnexion : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $this->authService->getAuthenticatedUser();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user->load('profile'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la récupération de l\'utilisateur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change user password.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = \Illuminate\Support\Facades\Auth::user();
            $this->authService->changePassword($user, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe changé avec succès',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Update user account information (name, email).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateAccount(Request $request): JsonResponse
    {
        try {
            $user = \Illuminate\Support\Facades\Auth::user();
            
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Échec de la validation',
                    'errors' => $validator->errors(),
                ], 422);
            }

            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Compte mis à jour avec succès',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la mise à jour du compte : ' . $e->getMessage(),
            ], 500);
        }
    }
}
