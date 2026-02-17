<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register JWT middleware
        $middleware->alias([
            'auth:api' => \Tymon\JWTAuth\Http\Middleware\Authenticate::class,
            'subscription' => \App\Http\Middleware\EnsureUserHasSubscription::class,
        ]);

        // Configure CORS for API routes (allow Expo app)
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom API exception handler - hide internal errors from clients
        $exceptions->render(function (Throwable $e, Request $request) {
            // Only handle API requests
            if (!$request->is('api/*') && !$request->expectsJson()) {
                return null;
            }

            // Validation errors - return detailed field errors
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation. Veuillez vérifier vos données.',
                    'errors' => $e->errors(),
                ], 422);
            }

            // JWT Token expired
            if ($e instanceof TokenExpiredException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Votre session a expiré. Veuillez vous reconnecter.',
                    'error_code' => 'TOKEN_EXPIRED',
                ], 401);
            }

            // JWT Token invalid
            if ($e instanceof TokenInvalidException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session invalide. Veuillez vous reconnecter.',
                    'error_code' => 'TOKEN_INVALID',
                ], 401);
            }

            // JWT general error
            if ($e instanceof JWTException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur d\'authentification. Veuillez vous reconnecter.',
                    'error_code' => 'AUTH_ERROR',
                ], 401);
            }

            // Database errors - NEVER expose to client
            if ($e instanceof QueryException) {
                // Log the actual error for debugging
                \Log::error('Database error: ' . $e->getMessage(), [
                    'sql' => $e->getSql() ?? 'N/A',
                    'bindings' => $e->getBindings() ?? [],
                    'trace' => $e->getTraceAsString(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de base de données. Veuillez vérifier la connexion à la base de données et les migrations.',
                    'error_code' => 'DATABASE_ERROR',
                ], 500);
            }

            // Route not found
            if ($e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ressource non trouvée.',
                    'error_code' => 'NOT_FOUND',
                ], 404);
            }

            // Method not allowed
            if ($e instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Méthode HTTP non autorisée.',
                    'error_code' => 'METHOD_NOT_ALLOWED',
                ], 405);
            }

            // All other exceptions - generic error (hide internals)
            $isDebug = config('app.debug', false);

            \Log::error('Unhandled exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $isDebug
                    ? $e->getMessage()
                    : 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
                'error_code' => 'INTERNAL_ERROR',
            ], 500);
        });
    })->create();
