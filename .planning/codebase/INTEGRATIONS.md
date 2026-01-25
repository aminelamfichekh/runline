# External Integrations

**Analysis Date:** 2026-01-24

## APIs & External Services

**AI/ML:**
- OpenAI (GPT-4) - Generates personalized running training plans
  - SDK/Client: `openai-php/client` 0.18.0
  - Auth: `OPENAI_API_KEY`, `OPENAI_ORGANIZATION`
  - Configuration: `config/services.php` lines 47-50
  - Usage: `app/Jobs/GeneratePlanJob.php` - Called asynchronously to generate initial and monthly training plans
  - Model: `gpt-4` with 4000 max tokens
  - Used in: Plan generation workflow with system prompt for expert running coach

**Payment Processing:**
- Stripe - Subscription management and payment processing
  - SDK/Client: `stripe/stripe-php` 19.1
  - Auth: `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
  - Configuration: `config/services.php` lines 61-65
  - Endpoints:
    - POST `/api/subscription/checkout` - Create checkout session
    - POST `/api/subscription/cancel` - Cancel subscription
    - GET `/api/subscription` - Get current subscription
    - POST `/api/webhooks/stripe` - Webhook receiver
  - Webhook Handler: `app/Http/Controllers/Api/WebhookController.php`
  - Events Handled:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - Service: `app/Services/PaymentService.php` - Manages customer creation, checkout sessions, subscription lifecycle
  - Models: `app/Models/Subscription.php`, `app/Models/Payment.php`

**Push Notifications:**
- Firebase Cloud Messaging (FCM) - Push notifications to mobile devices
  - Auth: `FIREBASE_SERVER_KEY`
  - Configuration: `config/services.php` lines 76-78
  - Service: `app/Services/NotificationService.php`
  - API Endpoint: `https://fcm.googleapis.com/fcm/send`
  - Features:
    - Register device tokens: POST `/api/device/register`
    - Unregister tokens: POST `/api/device/unregister`
    - Send notifications for plan generation and subscription events
  - Model: `app/Models/DeviceToken.php`, `app/Models/Notification.php`
  - Notification Types: `plan_generated`, `subscription_renewed`, `subscription_expiring`

## Data Storage

**Databases:**
- SQLite (Development default)
  - Connection: `DB_CONNECTION=sqlite`
  - File: `database/database.sqlite`
  - Client: Laravel's built-in query builder (Eloquent ORM)

- MySQL/MariaDB (Production ready)
  - Connection: Configured in `config/database.php`
  - Environment: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
  - Client: Laravel Eloquent ORM

- PostgreSQL (Production ready)
  - Connection: Configured in `config/database.php`
  - Environment: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`

**Tables:**
- `users` - User accounts
- `user_profiles` - Running profile information (height, weight, experience, goals)
- `plans` - Training plans (initial and monthly)
- `subscriptions` - Active subscriptions linked to Stripe
- `payments` - Payment records from Stripe webhooks
- `notifications` - Push notification history
- `device_tokens` - Mobile device push notification tokens
- `questionnaire_sessions` - Questionnaire responses before signup
- `questions` - Questionnaire definitions
- `user_questionnaire_responses` - User responses to questionnaire questions
- `sessions` - User sessions (database driver)
- `cache` - Cache entries (database driver)
- `jobs` - Queued jobs (database queue driver)
- `failed_jobs` - Failed job records

**File Storage:**
- Local filesystem only
  - Configuration: `FILESYSTEM_DISK=local`
  - Storage location: `storage/app/` (Laravel default)
  - Not externally integrated (no AWS S3, etc.)

**Caching:**
- Database (Development default)
  - Configuration: `CACHE_STORE=database`
  - Table: `cache`

- Redis (Production optional)
  - Configuration: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - Uses: `predis/predis` 3.3
  - Client: `redis` (phpredis)
  - Databases: Default (0) and Cache (1)
  - Used for: Cache, Sessions, Queue (optional)

## Authentication & Identity

**Auth Provider:**
- Custom JWT (JSON Web Token) implementation
  - Implementation: `tymon/jwt-auth` 2.2
  - Configuration: `config/jwt.php`
  - Service: `app/Services/AuthService.php`
  - Routes: `routes/api.php` lines 24-28
  - Token Generation: POST `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
  - Validation: Middleware `auth:api` guards protected routes
  - Credentials: Email + password with bcrypt hashing
  - Bcrypt Rounds: 12 (from `.env.example`)

**Mobile App Storage:**
- React Native AsyncStorage for local token persistence
  - Package: `@react-native-async-storage/async-storage` 2.2.0
  - Stores JWT tokens locally on device

## Monitoring & Observability

**Error Tracking:**
- None detected - Application uses standard Laravel logging

**Logs:**
- Laravel's built-in logging system
  - Configuration: `config/logging.php`
  - Default: Stack channel (single file)
  - File location: `storage/logs/`
  - Log channels: Monolog-based
  - Available drivers: stack, single, daily, slack, syslog, errorlog
  - Configured mailer: `log` channel (logs to stdout/file)

**Error Handling:**
- Custom exception handling in controllers
- Job retry mechanism: 3 attempts with 60-second backoff
- Graceful error responses to API clients

## CI/CD & Deployment

**Hosting:**
- Not specified in configuration - Local development setup
- Laravel Sail available for Docker development

**CI Pipeline:**
- None configured
- Manual testing via PHPUnit: `composer test`

**Development Commands:**
```bash
composer setup              # Install dependencies, create .env, generate key, migrate, build
composer dev               # Run development server with queue listener and asset bundler
composer test              # Run PHPUnit tests
```

**Asset Building:**
- NPM build: `npm run build` (Vite)
- Dev server: `npm run dev` (Vite with hot reload)

## Environment Configuration

**Required env vars for features:**

For Payment/Subscription:
- `STRIPE_KEY` - Stripe publishable key
- `STRIPE_SECRET` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

For AI Plan Generation:
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_ORGANIZATION` (optional)

For Push Notifications:
- `FIREBASE_SERVER_KEY` - Firebase project server key

For Database:
- `DB_CONNECTION` - driver (sqlite, mysql, pgsql, etc.)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` - Connection details

For Caching/Sessions:
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (optional, for Redis)

For Frontend:
- `EXPO_PUBLIC_API_URL` - Backend API URL for mobile/web client

**Secrets Location:**
- `.env` file (not committed, use `.env.example` as template)
- Environment variables in deployment

## Webhooks & Callbacks

**Incoming Webhooks:**
- Stripe Webhook: POST `/api/webhooks/stripe`
  - Signature verification via `Stripe\Webhook::constructEvent()`
  - Processes payment events asynchronously
  - Endpoint configured in Stripe Dashboard

**Outgoing Webhooks:**
- None detected

**Callbacks:**
- Stripe redirect URLs configured in checkout session:
  - Success: `{FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
  - Cancel: `{FRONTEND_URL}/subscription/cancel`
  - Configuration: `app/Services/PaymentService.php` lines 53-54

## API Integration Details

**Mobile to Backend Communication:**
- Base URL: `EXPO_PUBLIC_API_URL` (default: `http://192.168.110.171:8000/api`)
- HTTP Client: `axios` 1.6.5+
- Configured in: `app.config.js` lines 56-58

**Frontend URL (for Stripe redirects):**
- Configuration: `app.frontend_url` in `PaymentService::createCheckoutSession()`
- Must be set in `.env` as `APP_FRONTEND_URL` or similar

---

*Integration audit: 2026-01-24*
