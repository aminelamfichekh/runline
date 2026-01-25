# Architecture

**Analysis Date:** 2026-01-24

## Pattern Overview

**Overall:** Layered MVC with Service Layer pattern

**Key Characteristics:**
- HTTP API layer (Controllers) delegates to business logic (Services)
- Service layer handles validation, business rules, and orchestration
- Eloquent ORM models represent database entities with relationships
- Asynchronous job queue for long-running operations (plan generation)
- Request validation through form requests before controller access
- JWT token-based authentication for protected endpoints

## Layers

**HTTP/API Layer (Controllers):**
- Purpose: Handle incoming HTTP requests, validate, and return JSON responses
- Location: `app/Http/Controllers/Api/`
- Contains: API controllers for Auth, Profile, Plans, Subscriptions, Devices, Questionnaires, Webhooks
- Depends on: Services, Request validators, Eloquent models
- Used by: API routes defined in `routes/api.php`
- Example: `AuthController` receives requests, delegates to `AuthService`, formats JSON responses

**Service Layer:**
- Purpose: Encapsulate business logic, validation rules, and domain operations
- Location: `app/Services/`
- Contains:
  - `AuthService`: User registration, login, JWT token management, password changes
  - `ProfileService`: User profile updates, questionnaire attachment, completion tracking
  - `PlanGeneratorService`: Plan creation logic, date calculations, OpenAI prompt building
  - `NotificationService`: Push notification handling and device token management
  - `PaymentService`: Stripe webhook processing and subscription management
  - `QuestionnairePayloadService`: Payload validation and merging logic
  - `QuestionnaireResponseService`: Response validation and storage
- Depends on: Models, external services (OpenAI, Stripe), utilities
- Used by: Controllers and Jobs

**Data/Model Layer:**
- Purpose: Database entity representation and relationships
- Location: `app/Models/`
- Contains: User, UserProfile, Plan, Subscription, Payment, QuestionnaireSession, UserQuestionnaireResponse, Question, DeviceToken, Notification
- Key relationships:
  - User hasOne UserProfile
  - User hasMany Plans, Subscriptions, Payments, DeviceTokens, Notifications
  - User hasMany UserQuestionnaireResponses
  - QuestionnaireSession belongsTo User (when attached)
- Depends on: Eloquent ORM, Castable types

**Request Validation Layer:**
- Purpose: Validate HTTP request data before controller access
- Location: `app/Http/Requests/`
- Contains: StoreQuestionnaireSessionRequest, UpdateQuestionnaireSessionRequest, AttachQuestionnaireSessionRequest
- Pattern: Form Requests with authorization checks and rule definitions

**Async Job Queue:**
- Purpose: Handle long-running operations asynchronously
- Location: `app/Jobs/`
- Contains: `GeneratePlanJob` for OpenAI plan generation
- Mechanism: Queued jobs dispatched from services, executed by queue worker
- Retry logic: 3 attempts with 60-second backoff

**Configuration Layer:**
- Purpose: Application configuration and environment setup
- Location: `config/`
- Key files:
  - `auth.php`: JWT configuration, guards, and authentication providers
  - `services.php`: OpenAI and Stripe API credentials
  - `database.php`: Database connection configuration
  - `jwt.php`: JWT token expiration, refresh token settings

## Data Flow

**Authentication Flow:**
1. Client sends POST to `/api/auth/register` or `/api/auth/login`
2. `AuthController` receives request
3. `AuthService.register()` or `AuthService.login()` validates and creates/authenticates user
4. Service generates JWT token via `JWTAuth::fromUser()`
5. Controller returns JSON with access_token, refresh_token, user data
6. Client stores tokens and includes in subsequent requests via Authorization header

**Plan Generation Flow:**
1. User completes questionnaire and calls POST `/api/plans/generate`
2. `PlanController.generate()` checks subscription and questionnaire status
3. `PlanGeneratorService.generateInitialPlan()` creates Plan record with status='pending'
4. `GeneratePlanJob::dispatch()` queues async job
5. Queue worker executes `GeneratePlanJob.handle()`
6. Job calls `PlanGeneratorService.buildPrompt()` with user profile data
7. Job makes API call to OpenAI with prompt
8. Job parses response and updates Plan record with content
9. `NotificationService` sends push notification to user's devices

**Questionnaire Session Flow:**
1. Client creates anonymous session: POST `/api/questionnaire/sessions` with partial payload
2. `QuestionnaireSessionController.store()` creates QuestionnaireSession record with UUID
3. Client performs multiple updates: PUT `/api/questionnaire/sessions/{session_uuid}`
4. `QuestionnaireSessionController.update()` merges payload (doesn't overwrite)
5. When user registers, `AuthController.register()` calls `AuthService.register()`
6. If session_uuid provided, `AuthService` calls `QuestionnaireSessionController.attachFromSignup()`
7. `ProfileService.attachQuestionnaireSession()` validates complete payload and transfers to user_profiles
8. Sets `questionnaire_completed=true` on user profile

**Webhook Processing Flow:**
1. Stripe sends POST to `/api/webhooks/stripe` with signature
2. `WebhookController.handle()` verifies Stripe signature
3. Routes to appropriate handler based on event type
4. `PaymentService` processes payment/subscription updates
5. Updates Payment and Subscription records in database

**State Management:**
- User state: Tracked in `users` table, JWT token contains user ID
- Profile state: Stored in `user_profiles` table, linked by foreign key
- Session state: Anonymous sessions in `questionnaire_sessions` table with UUID
- Plan state: Tracked in `plans` table with status (pending→generating→completed/failed)
- Subscription state: Tracked in `subscriptions` table with Stripe subscription ID

## Key Abstractions

**Service Interface Pattern:**
- Purpose: Encapsulate business logic away from HTTP concerns
- Examples: `AuthService`, `ProfileService`, `PlanGeneratorService`
- Pattern: Public methods handle validation and orchestration, delegate complex operations to services
- Benefit: Reusable from controllers and jobs

**Model Relationships:**
- Purpose: Express domain logic through Eloquent relationships
- Examples:
  - `User->profile()` returns hasOne relationship to UserProfile
  - `User->subscription()` returns hasOne with status filter for active subscription
  - `Plan->user()` returns belongsTo User
- Pattern: Use relationship loading to avoid N+1 queries (`User->load('profile')`)

**Request Validation Pattern:**
- Purpose: Centralize validation logic before business layer
- Examples: `StoreQuestionnaireSessionRequest`, `AttachQuestionnaireSessionRequest`
- Pattern: Define rules() method with Laravel validation syntax
- Benefit: Fails fast at HTTP layer, prevents invalid data reaching services

**Async Job Pattern:**
- Purpose: Handle heavy operations without blocking HTTP response
- Example: `GeneratePlanJob` for OpenAI API calls
- Pattern: Create Model, dispatch Job, job updates model on completion
- Benefit: HTTP response returns immediately while plan generates in background

**Payload Merging Pattern:**
- Purpose: Support multi-step form filling for questionnaire
- Location: `QuestionnairePayloadService`
- Pattern: `mergePayload()` method preserves existing fields and merges new ones
- Benefit: Client can update questionnaire incrementally without losing data

## Entry Points

**HTTP Entry Points:**

**Authentication Endpoints:**
- Location: `routes/api.php` (lines 24-28, 40-47)
- Routes:
  - `POST /api/auth/register` → `AuthController@register`
  - `POST /api/auth/login` → `AuthController@login`
  - `POST /api/auth/refresh` → `AuthController@refresh`
  - `POST /api/auth/logout` → `AuthController@logout` (protected)
  - `GET /api/auth/me` → `AuthController@me` (protected)
  - `POST /api/auth/change-password` → `AuthController@changePassword` (protected)
  - `PUT /api/auth/account` → `AuthController@updateAccount` (protected)

**Plan Endpoints:**
- Location: `routes/api.php` (lines 56-62)
- Routes:
  - `GET /api/plans` → `PlanController@index` (protected)
  - `GET /api/plans/active` → `PlanController@active` (protected)
  - `POST /api/plans/generate` → `PlanController@generate` (protected)
  - `GET /api/plans/{id}` → `PlanController@show` (protected)

**Profile Endpoints:**
- Location: `routes/api.php` (lines 49-54)
- Routes:
  - `GET /api/profile` → `ProfileController@show` (protected)
  - `PUT/PATCH /api/profile` → `ProfileController@update` (protected)

**Questionnaire Endpoints:**
- Location: `routes/api.php` (lines 34-37, 77-80)
- Routes:
  - `POST /api/questionnaire/sessions` → `QuestionnaireSessionController@store` (public)
  - `PUT /api/questionnaire/sessions/{session_uuid}` → `QuestionnaireSessionController@update` (public)
  - `POST /api/questionnaire/sessions/{session_uuid}/attach` → `QuestionnaireSessionController@attach` (protected)

**Webhook Endpoints:**
- Location: `routes/api.php` (line 31)
- Routes:
  - `POST /api/webhooks/stripe` → `WebhookController@handle` (public, signature verified)

**Framework Entry Point:**
- Location: `bootstrap/app.php`
- Responsibilities: Define routing configuration, middleware setup, exception handling
- Sets up API routes from `routes/api.php`
- Registers JWT middleware for `auth:api` guard

**Queue Entry Point:**
- Jobs queued via `dispatch()` helper
- Queue worker processes via `php artisan queue:listen`
- Configuration in `config/queue.php` (Redis or database driver)

## Error Handling

**Strategy:** Try-catch in controllers with specific exception handling

**Patterns:**
- Controllers catch `ValidationException` → return 422 with error details
- Controllers catch `ModelNotFoundException` → return 404
- Controllers catch generic `Exception` → return 500 with debug info when `config('app.debug')` true
- Services throw `ValidationException` via `Validator::make()->validate()`
- Services throw domain `Exception` with meaningful messages
- Jobs log errors and retry with backoff strategy

**Logging:**
- Used in services for important operations (registration, session attachment, errors)
- Location: `Log::error()`, `Log::warning()`, `Log::info()` calls
- Examples: AuthService logs session attachment failures without failing signup

## Cross-Cutting Concerns

**Logging:**
- Framework: Laravel's built-in logging
- Pattern: Use `Log::error()`, `Log::warning()`, `Log::info()` with context arrays
- Examples: AuthService logs failed validations, missing users; QuestionnaireSessionController logs attachment failures

**Validation:**
- Framework: Laravel Validator with custom Form Requests
- Pattern: Define rules() in Request classes, validate in Services
- Examples: StoreQuestionnaireSessionRequest defines payload schema

**Authentication:**
- Framework: JWT via tymon/jwt-auth package
- Pattern: `auth:api` middleware on protected routes, extract user via `Auth::user()`
- Token lifecycle: Generated on login/register, refreshed via refresh endpoint
- Claims: Contains user ID, custom claims defined in User model

**Authorization:**
- Pattern: Controllers check business rules (e.g., user has active subscription)
- Examples: PlanController checks subscription status, QuestionnaireSessionController prevents updates to attached sessions

---

*Architecture analysis: 2026-01-24*
