<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PlanGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * PlanController
 * 
 * Handles training plan endpoints.
 * HTTP layer only - validation and response formatting.
 */
class PlanController extends Controller
{
    public function __construct(
        protected PlanGeneratorService $planGeneratorService
    ) {
        // Middleware is now applied in routes/api.php for Laravel 12
    }

    /**
     * Get all user's plans.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $plans = $this->planGeneratorService->getUserPlans($user);

            return response()->json([
                'success' => true,
                'data' => [
                    'plans' => $plans,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get plans: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific plan.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $plan = \App\Models\Plan::where('user_id', $user->id)->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'plan' => $plan,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Plan not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get plan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the user's active plan.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function active(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $plan = $this->planGeneratorService->getActivePlan($user);

            if (!$plan) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'plan' => null,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'plan' => $plan,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get active plan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Manually trigger plan generation.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Check if user has active subscription
            $subscription = $user->subscription;
            if (!$subscription || !$subscription->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active subscription required to generate plans',
                ], 403);
            }

            // Check if questionnaire is completed
            if (!$user->profile || !$user->profile->questionnaire_completed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Questionnaire must be completed before generating plans',
                ], 400);
            }

            // Generate initial plan or monthly plan based on request
            $type = $request->input('type', 'initial');
            
            if ($type === 'monthly') {
                $plan = $this->planGeneratorService->generateMonthlyPlan($user);
            } else {
                // Check if initial plan already exists
                $existingPlan = \App\Models\Plan::where('user_id', $user->id)
                    ->where('type', 'initial')
                    ->first();
                
                if ($existingPlan) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Initial plan already exists',
                    ], 400);
                }

                $plan = $this->planGeneratorService->generateInitialPlan($user);
            }

            return response()->json([
                'success' => true,
                'message' => 'Plan generation started',
                'data' => [
                    'plan' => $plan,
                ],
            ], 202);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate plan: ' . $e->getMessage(),
            ], 500);
        }
    }
}

