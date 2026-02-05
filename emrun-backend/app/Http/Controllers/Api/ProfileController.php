<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use App\Services\PlanGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * ProfileController
 * 
 * Handles user profile endpoints.
 * HTTP layer only - validation and response formatting.
 */
class ProfileController extends Controller
{
    public function __construct(
        protected ProfileService $profileService,
        protected PlanGeneratorService $planGeneratorService
    ) {
        // Middleware is now applied in routes/api.php for Laravel 12
    }

    /**
     * Get the user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $profile = $this->profileService->getProfile($user);

            if (!$profile) {
                \Log::info('Profile not found for user', ['user_id' => $user->id]);
                return response()->json([
                    'success' => true,
                    'data' => [
                        'profile' => null,
                        'questionnaire_completed' => false,
                    ],
                ]);
            }

            // Ensure questionnaire_completed is a boolean
            $questionnaireCompleted = (bool) $profile->questionnaire_completed;
            
            \Log::info('Profile retrieved', [
                'user_id' => $user->id,
                'profile_id' => $profile->id,
                'questionnaire_completed' => $questionnaireCompleted,
                'has_first_name' => !empty($profile->first_name),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => $profile,
                    'questionnaire_completed' => $questionnaireCompleted,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to get profile', [
                'user_id' => Auth::id(),
            'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Échec de la récupération du profil : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $profile = $this->profileService->updateProfile($user, $request->all());

            // If questionnaire is being completed for the first time, generate initial plan
            $wasCompleted = $user->profile && $user->profile->questionnaire_completed;
            $isNowCompleted = $profile->questionnaire_completed;

            if (!$wasCompleted && $isNowCompleted) {
                // Generate initial plan in the background
                try {
                    $this->planGeneratorService->generateInitialPlan($user);
                } catch (\Exception $e) {
                    // Log error but don't fail the profile update
                    \Log::error('Failed to generate initial plan after questionnaire completion', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Ensure questionnaire_completed is returned as boolean
            $questionnaireCompleted = (bool) $profile->questionnaire_completed;

            \Log::info('Profile update response', [
                'user_id' => $user->id,
                'questionnaire_completed' => $questionnaireCompleted,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => [
                    'profile' => $profile,
                    'questionnaire_completed' => $questionnaireCompleted,
                ],
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
                'message' => 'Échec de la mise à jour du profil : ' . $e->getMessage(),
            ], 500);
        }
    }
}
