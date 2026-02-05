<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\QuestionnaireSessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
});

// Webhook routes (public, but secured by Stripe signature verification)
Route::post('webhooks/stripe', [WebhookController::class, 'handle']);

// Questionnaire session routes (public for create/update, protected for attach)
Route::prefix('questionnaire/sessions')->group(function () {
    Route::post('/', [QuestionnaireSessionController::class, 'store']);
    Route::put('{session_uuid}', [QuestionnaireSessionController::class, 'update']);
});

// Protected routes (require JWT authentication)
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::put('account', [AuthController::class, 'updateAccount']);
    });

    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::patch('/', [ProfileController::class, 'update']);
    });

    // Plan routes (require active subscription)
    Route::prefix('plans')->middleware('subscription')->group(function () {
        Route::get('/', [PlanController::class, 'index']);
        Route::get('active', [PlanController::class, 'active']);
        Route::post('generate', [PlanController::class, 'generate']);
        Route::get('{id}', [PlanController::class, 'show']);
    });

    // Subscription routes
    Route::prefix('subscription')->group(function () {
        Route::get('/', [SubscriptionController::class, 'show']);
        Route::get('status', [SubscriptionController::class, 'status']);
        Route::post('checkout', [SubscriptionController::class, 'checkout']);
        Route::post('cancel', [SubscriptionController::class, 'cancel']);
    });

    // Payment routes (for PaymentSheet and embedded payments)
    Route::prefix('payment')->group(function () {
        // Existing: mobile PaymentSheet subscription flow
        Route::post('create-subscription', [SubscriptionController::class, 'createSubscription']);
        // New: generic PaymentIntent for embedded Stripe Payment Element (web)
        Route::post('create-intent', [SubscriptionController::class, 'createPaymentIntent']);
    });

    // Device token routes
    Route::prefix('device')->group(function () {
        Route::post('register', [DeviceController::class, 'register']);
        Route::post('unregister', [DeviceController::class, 'unregister']);
    });

    // Questionnaire session attach (protected)
    Route::prefix('questionnaire/sessions')->group(function () {
        Route::post('{session_uuid}/attach', [QuestionnaireSessionController::class, 'attach']);
    });
});
