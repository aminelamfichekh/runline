<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * DeviceController
 * 
 * Handles device token registration for push notifications.
 * HTTP layer only - validation and response formatting.
 */
class DeviceController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {
        $this->middleware('auth:api');
    }

    /**
     * Register a device token for push notifications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'platform' => 'nullable|in:ios,android',
                'device_id' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = Auth::user();
            $deviceToken = $this->notificationService->registerDeviceToken(
                $user,
                $request->token,
                $request->platform,
                $request->device_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Device token registered successfully',
                'data' => [
                    'device_token' => $deviceToken,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register device token: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Unregister a device token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unregister(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = Auth::user();
            $success = $this->notificationService->unregisterDeviceToken($user, $request->token);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device token not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Device token unregistered successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unregister device token: ' . $e->getMessage(),
            ], 500);
        }
    }
}

