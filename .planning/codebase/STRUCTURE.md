# Codebase Structure

**Analysis Date:** 2026-01-24

## Directory Layout

```
emrun-backend/
├── app/                          # Application code
│   ├── Http/
│   │   ├── Controllers/Api/      # API endpoint handlers
│   │   ├── Requests/             # Form request validation
│   │   └── Middleware/           # HTTP middleware (if any)
│   ├── Models/                   # Eloquent ORM models
│   ├── Services/                 # Business logic layer
│   ├── Jobs/                     # Queued async jobs
│   ├── Providers/                # Service providers
│   └── Events/                   # Event classes (if any)
├── bootstrap/                    # Application bootstrap
│   ├── app.php                   # Main configuration bootstrap
│   ├── providers.php             # Provider list
│   └── cache/                    # Bootstrap cache (generated)
├── routes/                       # Route definitions
│   ├── api.php                   # API routes
│   ├── web.php                   # Web routes (minimal)
│   └── console.php               # Console commands
├── config/                       # Configuration files
│   ├── app.php                   # App configuration
│   ├── auth.php                  # Authentication config (JWT)
│   ├── database.php              # Database connections
│   ├── jwt.php                   # JWT token settings
│   ├── services.php              # External service credentials
│   ├── queue.php                 # Queue driver config
│   └── [other configs]
├── database/
│   ├── migrations/               # Database schema migrations
│   ├── factories/                # Model factories for testing
│   └── seeders/                  # Database seeders
├── resources/
│   ├── js/                       # Frontend asset scripts
│   └── views/                    # Blade templates (minimal for API)
├── public/                       # Web server root
│   └── index.php                 # Laravel entry point
├── tests/                        # Test files (unit, feature)
├── vendor/                       # Composer dependencies (generated)
├── composer.json                 # PHP dependencies
├── composer.lock                 # Locked dependency versions
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
├── artisan                       # Laravel CLI tool
└── [config files]                # .editorconfig, .gitignore, etc.
```

## Directory Purposes

**app/:**
- Purpose: All application code - models, controllers, services, jobs
- Contains: PHP classes organized by responsibility
- Key files: See detailed breakdown below

**app/Http/:**
- Purpose: HTTP request/response handling
- Contains: Controllers (request handlers), Request validators, Middleware

**app/Http/Controllers/Api/:**
- Purpose: API endpoint handlers
- Contains: 7 controller classes
  - `AuthController.php`: Registration, login, authentication, password changes
  - `ProfileController.php`: User profile operations
  - `PlanController.php`: Training plan retrieval and generation
  - `SubscriptionController.php`: Subscription checkout and cancellation
  - `WebhookController.php`: Stripe webhook processing
  - `DeviceController.php`: Device token registration
  - `QuestionnaireSessionController.php`: Questionnaire session CRUD and attachment
- Pattern: Each controller has dependency-injected services in constructor

**app/Http/Requests/:**
- Purpose: Centralized validation for incoming HTTP requests
- Contains:
  - `StoreQuestionnaireSessionRequest.php`: Validates new session creation (lenient schema)
  - `UpdateQuestionnaireSessionRequest.php`: Validates session updates (preserves fields)
  - `AttachQuestionnaireSessionRequest.php`: Validates questionnaire completion (strict schema)
- Pattern: Form Requests inherit from `FormRequest`, define `rules()` method

**app/Models/:**
- Purpose: Database entity representation via Eloquent ORM
- Contains: 10 model classes
  - `User.php`: User authentication, implements JWTSubject
  - `UserProfile.php`: User running profile with questionnaire data
  - `Plan.php`: Training plan with OpenAI-generated content
  - `Subscription.php`: Stripe subscription tracking
  - `Payment.php`: Payment transactions
  - `QuestionnaireSession.php`: Anonymous questionnaire sessions (before user signup)
  - `UserQuestionnaireResponse.php`: User responses to specific questions
  - `Question.php`: Questionnaire questions
  - `DeviceToken.php`: Push notification device tokens
  - `Notification.php`: Push notifications
- Pattern: Models define relationships, casts, fillable attributes

**app/Services/:**
- Purpose: Business logic encapsulation, separated from HTTP concerns
- Contains: 7 service classes
  - `AuthService.php` (283 lines): User registration, login, JWT token management, password changes
  - `ProfileService.php` (312 lines): Profile updates, questionnaire data storage, completion tracking
  - `PlanGeneratorService.php` (313 lines): Plan creation, date calculations, OpenAI prompt building
  - `QuestionnairePayloadService.php` (126 lines): Payload validation, field merging, dependent field cleanup
  - `QuestionnaireResponseService.php` (275 lines): Response validation and storage
  - `NotificationService.php` (218 lines): Push notifications via device tokens
  - `PaymentService.php` (225 lines): Stripe webhook handling, subscription management
- Pattern: Services accept dependencies in constructor, public methods handle orchestration

**app/Jobs/:**
- Purpose: Asynchronous operations via queue
- Contains: `GeneratePlanJob.php` - Handles OpenAI API calls for plan generation
- Pattern: Implements `ShouldQueue`, uses dependency injection in `handle()` method
- Configuration: 3 retry attempts with 60-second backoff

**app/Providers/:**
- Purpose: Service provider registration and bootstrapping
- Contains: `AppServiceProvider.php` (minimal, template from Laravel)
- Pattern: Not actively used in current codebase

**bootstrap/:**
- Purpose: Framework bootstrap and initialization
- Files:
  - `app.php`: Main application configuration (routing, middleware, exceptions)
  - `providers.php`: Service provider list
  - `cache/`: Generated bootstrap cache files

**routes/:**
- Purpose: HTTP route definitions
- Files:
  - `api.php`: All API routes (3,299 bytes, ~82 lines)
    - Public routes: auth (register, login, refresh), webhooks
    - Questionnaire routes: create/update sessions (public), attach (protected)
    - Protected routes: auth (logout, me, change-password, account), profile, plans, subscription, device
    - Middleware: Protected routes use `auth:api` middleware
  - `web.php`: Web routes (minimal, unused)
  - `console.php`: Console command routes (minimal)

**config/:**
- Purpose: Application configuration files
- Key files:
  - `app.php`: Application name, environment, timezone, providers
  - `auth.php`: Authentication guards (JWT), providers, password reset
  - `jwt.php`: JWT token secrets, expiration times (1 hour access, 30 days refresh)
  - `database.php`: Database connection drivers and settings
  - `services.php`: OpenAI and Stripe API credentials from .env
  - `queue.php`: Queue driver (Redis or database)
  - `cors.php`: CORS configuration
  - `cache.php`, `logging.php`, `mail.php`, etc.

**database/:**
- Purpose: Database schema and seed data
- migrations/:
  - `0001_01_01_000000_create_users_table.php`: Core users table
  - `2026_01_08_165135_create_user_profiles_table.php`: User questionnaire profiles
  - `2026_01_08_165145_create_plans_table.php`: Training plans
  - `2026_01_08_165157_create_subscriptions_table.php`: Stripe subscriptions
  - `2026_01_08_165208_create_payments_table.php`: Payment transactions
  - `2026_01_08_165216_create_device_tokens_table.php`: Push notification tokens
  - `2026_01_20_000000_create_questionnaire_sessions_table.php`: Anonymous sessions
  - `2026_01_21_000000_create_questions_table.php`: Questionnaire questions
  - `2026_01_21_000001_create_user_questionnaire_responses_table.php`: Question responses
- Pattern: Timestamp ordering (2026_01_xx), Blueprint syntax for schema definition

**resources/:**
- Purpose: Frontend assets and views
- js/: JavaScript files (app.js, bootstrap.js)
- views/: Blade template files (minimal for API-only backend)

**public/:**
- Purpose: Web server document root
- Contains: `index.php` (Laravel entry point for all requests)

**tests/:**
- Purpose: Automated tests (if present)
- Structure: Matches app/ structure (Unit/, Feature/ directories)

**vendor/:**
- Purpose: Composer-managed dependencies
- Generated from composer.lock
- Do not modify directly

## Key File Locations

**Entry Points:**

**HTTP Entry Point:**
- `public/index.php`: Web server delegates all requests here
- Loads `bootstrap/app.php` which returns configured Application instance

**Application Bootstrap:**
- `bootstrap/app.php`: Configures routing (api.php), middleware (JWT), exception handling
- Called via `public/index.php`

**Route Definitions:**
- `routes/api.php`: All HTTP API route definitions with middleware

**Configuration Core:**
- `app/Http/Controllers/Api/*.php`: All endpoint handlers
- `app/Services/*.php`: All business logic
- `app/Models/*.php`: All data models

**Database Schema:**
- `database/migrations/`: Run via `php artisan migrate`
- Latest migration: `2026_01_21_000001_create_user_questionnaire_responses_table.php`

**Test Entry Point (if configured):**
- `phpunit.xml`: Test configuration file
- Tests location: `tests/` directory

## Naming Conventions

**Files:**
- Controllers: `{Entity}Controller.php` (e.g., `AuthController.php`)
- Services: `{Domain}Service.php` (e.g., `AuthService.php`, `PlanGeneratorService.php`)
- Models: `{Entity}` or `{Entity}Model.php` (e.g., `User.php`, `UserProfile.php`)
- Migrations: `YYYY_MM_DD_HHMMSS_{description}.php` (e.g., `2026_01_08_165135_create_user_profiles_table.php`)
- Requests: `{Action}{Entity}Request.php` (e.g., `StoreQuestionnaireSessionRequest.php`)
- Jobs: `{Action}Job.php` (e.g., `GeneratePlanJob.php`)

**Directories:**
- Lowercase: `app/`, `routes/`, `config/`, `database/`, `resources/`, `public/`, `bootstrap/`, `vendor/`, `tests/`
- Pascal case: `Http/`, `Models/`, `Services/`, `Controllers/`, `Requests/`, `Jobs/`, `Providers/`, `Api/` (sub-directory)

**Classes:**
- Pascal case for all class names: `User`, `AuthService`, `PlanGeneratorService`
- Interfaces: `{Name}Interface` or `Contracts\{Name}` (if used)

**Methods:**
- Camel case: `register()`, `login()`, `generateInitialPlan()`, `getActivePlan()`
- Verbs first for action methods: `create`, `update`, `delete`, `generate`, `attach`
- Getters without `get` prefix: `profile()` instead of `getProfile()` for relationships

**Variables & Properties:**
- Camel case: `$authService`, `$planGenerator`, `$userId`
- Protected/private properties: prefixed for clarity when needed
- Database columns: snake_case: `user_id`, `questionnaire_completed`, `created_at`

## Where to Add New Code

**New Feature (Auth/Plan/Profile):**
- Primary code: `app/Services/{FeatureName}Service.php`
- Controller layer: `app/Http/Controllers/Api/{FeatureName}Controller.php`
- Routes: Add to `routes/api.php` in appropriate prefix group
- Validation: `app/Http/Requests/{Action}{Name}Request.php`
- Database: `database/migrations/{timestamp}_{description}.php` if needed

**New Database Model:**
- Model: `app/Models/{EntityName}.php`
- Migration: `database/migrations/{timestamp}_create_{table_name}_table.php`
- Define relationships in model: `hasMany()`, `belongsTo()`, `hasOne()`
- Add to relationships in related models

**New Validation Rule:**
- Location: `app/Http/Requests/{ActionName}Request.php`
- Pattern: Add to `rules()` method array
- Reference: Laravel validation syntax

**New Async Job:**
- Location: `app/Jobs/{ActionName}Job.php`
- Pattern: Implement `ShouldQueue`, use dependency injection in `handle()`
- Dispatch from service: `{JobName}::dispatch($parameter)`

**New Service Method:**
- Location: Add to appropriate `app/Services/{Domain}Service.php`
- Pattern: Public method orchestrates logic, throws meaningful exceptions
- Inject dependencies in service constructor

**New Endpoint:**
- Controller method: Add to appropriate `app/Http/Controllers/Api/{Entity}Controller.php`
- Route: Add to `routes/api.php` in appropriate group
- Request validation: Create `app/Http/Requests/{Action}{Entity}Request.php` if needed
- Service call: Inject and call appropriate service method

**Shared Utilities:**
- Location: Create `app/Helpers/` or `app/Utils/` if needed (currently not used)
- Pattern: Static helper methods or utility classes
- Import: Use fully qualified namespace or create service for DI

**Database Migration:**
- Naming: `{timestamp}_{description}.php`
- Pattern: Timestamp must be newer than all existing migrations
- Run: `php artisan migrate`

## Special Directories

**vendor/:**
- Purpose: Composer-managed dependencies
- Generated: Yes (from composer.lock)
- Committed: No (unless special reason)
- Do not edit directly

**bootstrap/cache/:**
- Purpose: Generated bootstrap cache for performance
- Generated: Yes (by Laravel)
- Committed: No
- Regenerate: `php artisan config:cache`

**storage/:**
- Purpose: Application storage (logs, uploads, sessions if used)
- Generated: Yes
- Committed: No (except directory structure)
- Variants: `storage/logs/`, `storage/app/`, `storage/framework/`

**.env:**
- Purpose: Local environment variables
- Generated: No (template from .env.example)
- Committed: No (contains secrets)
- Template: `.env.example` is committed

**public/:**
- Purpose: Web-accessible directory (served by web server)
- Committed: Yes
- Key file: `index.php` is the Laravel entry point

---

*Structure analysis: 2026-01-24*
