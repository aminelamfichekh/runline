# Architecture Research

**Domain:** Mobile Fitness/Running Training Apps (React Native + Laravel)
**Researched:** 2026-01-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT NATIVE FRONTEND                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Expo Router  │  │   State      │  │   Stripe     │          │
│  │ Navigation   │  │ Management   │  │   Payment    │          │
│  │              │  │ (Zustand)    │  │   UI         │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
│                    AsyncStorage (Session Persistence)           │
├─────────────────────────────────────────────────────────────────┤
│                    JWT AUTH + API CLIENT                        │
│                           │                                     │
│                      HTTPS/REST API                             │
│                           │                                     │
├─────────────────────────────────────────────────────────────────┤
│                     LARAVEL BACKEND                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐    │
│  │               CONTROLLERS (Thin)                        │    │
│  │  - AuthController  - QuestionnaireController            │    │
│  │  - SubscriptionController  - PlanController             │    │
│  └────────────┬───────────────────────────────────────────┘    │
│               │                                                 │
│  ┌────────────▼───────────────────────────────────────────┐    │
│  │          SERVICE LAYER (Business Logic)                 │    │
│  │  - AuthService  - ProfileService                        │    │
│  │  - QuestionnaireService  - SubscriptionService          │    │
│  │  - PlanGeneratorService                                 │    │
│  └────────┬───────────────────────┬────────────────────────┘    │
│           │                       │                             │
│  ┌────────▼──────┐    ┌──────────▼──────────┐                  │
│  │  REPOSITORIES  │    │   ASYNC JOBS        │                  │
│  │  (Data Access) │    │  - GenerateAIPlan   │                  │
│  └────────┬───────┘    │  - ProcessPayment   │                  │
│           │            │  - RegeneratePlans  │                  │
│  ┌────────▼───────┐    └──────────┬──────────┘                  │
│  │ ELOQUENT       │               │                             │
│  │ MODELS         │    ┌──────────▼──────────┐                  │
│  └────────┬───────┘    │   QUEUE WORKERS     │                  │
│           │            │   (Redis)           │                  │
├───────────┴────────────┴─────────────────────┴─────────────────┤
│                      DATABASE (MySQL)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  users   │  │sessions  │  │  plans   │  │payments  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                   EXTERNAL INTEGRATIONS                         │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   OpenAI API     │  │   Stripe API     │                    │
│  │  (Plan Gen)      │  │  (Payments)      │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘

                 ┌──────────────────────┐
                 │   LARAVEL SCHEDULER  │
                 │   (Cron: monthly)    │
                 └──────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Expo Router** | File-based navigation, protected routes, auth flow | Route groups, Stack.Protected, session context provider |
| **State Management** | Client-side state (form progress, UI state) | Zustand stores with AsyncStorage persistence |
| **JWT Auth** | Session tokens, API authentication | Secure storage (expo-secure-store), axios interceptors |
| **Controllers** | HTTP request handling, validation, response formatting | Thin layer delegating to services |
| **Services** | Business logic orchestration, multi-model operations | Service classes with dependency injection |
| **Repositories** | Data access abstraction | Interface-based, injected into services |
| **Async Jobs** | Background processing (AI calls, webhooks) | Laravel Queue jobs with Redis driver |
| **Scheduler** | Recurring tasks (monthly plan regeneration) | Laravel schedule in routes/console.php |
| **Eloquent Models** | Database schema representation, relationships | Active record pattern with eager loading |

## Recommended Project Structure

### React Native Frontend

```
src/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Protected auth group
│   │   ├── _layout.tsx    # Auth group layout with protection
│   │   ├── dashboard.tsx
│   │   ├── plan.tsx
│   │   └── history.tsx
│   ├── (onboarding)/      # Onboarding group
│   │   ├── _layout.tsx
│   │   ├── step-1.tsx
│   │   ├── step-2.tsx
│   │   └── pricing.tsx
│   ├── sign-in.tsx        # Public sign-in route
│   └── _layout.tsx        # Root layout with SessionProvider
├── components/            # Reusable UI components
│   ├── questionnaire/
│   ├── payment/
│   └── plan-display/
├── stores/                # Zustand state stores
│   ├── onboarding.ts      # Questionnaire progress state
│   ├── auth.ts            # Auth state
│   └── plan.ts            # Plan display state
├── services/              # API client services
│   ├── api.ts             # Axios instance with interceptors
│   ├── auth.ts            # Auth API calls
│   ├── questionnaire.ts   # Questionnaire submission
│   └── subscription.ts    # Stripe subscription calls
├── contexts/              # React contexts
│   └── SessionProvider.tsx # Auth session provider
└── types/                 # TypeScript types
    └── api.ts
```

### Laravel Backend

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── QuestionnaireController.php
│   │   ├── SubscriptionController.php
│   │   └── PlanController.php
│   └── Middleware/
│       └── AuthenticateJWT.php
├── Services/              # Business logic layer
│   ├── AuthService.php
│   ├── QuestionnaireService.php
│   ├── SubscriptionService.php
│   ├── PlanGeneratorService.php
│   └── SessionTransferService.php
├── Repositories/          # Data access layer
│   ├── Contracts/        # Repository interfaces
│   │   ├── UserRepositoryInterface.php
│   │   ├── SessionRepositoryInterface.php
│   │   └── PlanRepositoryInterface.php
│   └── Eloquent/
│       ├── UserRepository.php
│       ├── SessionRepository.php
│       └── PlanRepository.php
├── Jobs/                  # Async queue jobs
│   ├── GenerateAIPlan.php
│   ├── ProcessStripeWebhook.php
│   └── RegeneratePlansMonthly.php
├── Models/
│   ├── User.php
│   ├── QuestionnaireSession.php
│   ├── Subscription.php
│   └── TrainingPlan.php
└── Console/
    └── Commands/
        └── RegenerateMonthlyPlans.php

routes/
└── console.php            # Scheduled tasks definition

config/
├── queue.php              # Queue configuration (Redis)
└── services.php           # OpenAI, Stripe credentials
```

### Structure Rationale

- **Frontend app/ folder:** Expo Router uses file-based routing. Route groups `(auth)` and `(onboarding)` allow different layouts and navigation stacks without affecting URLs.
- **Zustand stores/:** Lightweight state management with minimal boilerplate. Better performance than Context API for frequently updating state. Easy persistence with AsyncStorage.
- **Backend Services/:** Orchestration layer keeps controllers thin. Services handle complex workflows like "questionnaire → session → account → payment → plan generation".
- **Repositories/:** Abstract data access for testability. Allows switching between Eloquent/raw queries without changing service layer.
- **Jobs/:** OpenAI API calls are slow (3-10 seconds). Running them async prevents timeout issues and improves UX.

## Architectural Patterns

### Pattern 1: Anonymous Session to Authenticated User Transfer

**What:** Anonymous users complete questionnaire before creating account. Session data must transfer to authenticated user profile.

**When to use:** Onboarding flows where you want to reduce friction (don't force sign-up before seeing value).

**Trade-offs:**
- Pros: Lower drop-off rates, users see pricing before committing
- Cons: Complexity in session management, potential orphaned sessions

**Example:**

```typescript
// Frontend: Zustand store with session token
export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      sessionToken: null,
      responses: {},

      initSession: async () => {
        const { data } = await api.post('/questionnaire/session');
        set({ sessionToken: data.token });
      },

      saveResponse: async (step: number, answers: any) => {
        const { sessionToken } = get();
        await api.post('/questionnaire/responses',
          { step, answers },
          { headers: { 'X-Session-Token': sessionToken } }
        );
        set(state => ({
          responses: { ...state.responses, [step]: answers }
        }));
      },

      transferSession: async () => {
        // Called after user signs up/signs in
        const { sessionToken } = get();
        await api.post('/questionnaire/transfer', { sessionToken });
        set({ sessionToken: null }); // Clear after transfer
      }
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

```php
// Backend: SessionTransferService
class SessionTransferService
{
    public function transferAnonymousSession(User $user, string $sessionToken): void
    {
        DB::transaction(function () use ($user, $sessionToken) {
            $session = QuestionnaireSession::where('token', $sessionToken)
                ->whereNull('user_id')
                ->firstOrFail();

            // Transfer session to user
            $session->update(['user_id' => $user->id]);

            // Create initial profile from questionnaire data
            $this->profileService->createFromQuestionnaire($user, $session);

            // Queue plan generation
            GenerateAIPlan::dispatch($user);
        });
    }
}
```

### Pattern 2: Service Orchestration for Complex Flows

**What:** Services orchestrate multi-step workflows across repositories, jobs, and external APIs.

**When to use:** Complex business processes like "subscribe → verify payment → generate plan → send email".

**Trade-offs:**
- Pros: Single source of truth for workflow, easy to test, reusable
- Cons: Can become "god classes" if not properly decomposed

**Example:**

```php
class SubscriptionService
{
    public function __construct(
        private UserRepository $users,
        private SubscriptionRepository $subscriptions,
        private StripeClient $stripe,
    ) {}

    public function createSubscription(User $user, string $priceId): Subscription
    {
        return DB::transaction(function () use ($user, $priceId) {
            // Create Stripe customer if not exists
            if (!$user->stripe_customer_id) {
                $customer = $this->stripe->customers->create([
                    'email' => $user->email,
                    'metadata' => ['user_id' => $user->id],
                ]);
                $user->update(['stripe_customer_id' => $customer->id]);
            }

            // Create subscription
            $stripeSubscription = $this->stripe->subscriptions->create([
                'customer' => $user->stripe_customer_id,
                'items' => [['price' => $priceId]],
                'payment_behavior' => 'default_incomplete',
                'expand' => ['latest_invoice.payment_intent'],
            ]);

            // Save to database
            $subscription = $this->subscriptions->create([
                'user_id' => $user->id,
                'stripe_subscription_id' => $stripeSubscription->id,
                'status' => $stripeSubscription->status,
                'plan_id' => $priceId,
            ]);

            // Queue plan generation (only run after payment confirms)
            ProcessPayment::dispatch($subscription);

            return $subscription;
        });
    }
}
```

### Pattern 3: Stripe Payment Flow with Client-Server Separation

**What:** Frontend collects no payment data. Backend creates sessions, frontend displays Stripe-hosted UI, webhooks confirm payment.

**When to use:** All payment integrations (PCI compliance requirement).

**Trade-offs:**
- Pros: PCI compliant, secure, Stripe handles 3DS authentication
- Cons: Requires webhook infrastructure, more complex than direct charges

**Example:**

```typescript
// Frontend: Checkout flow
const handleSubscribe = async (priceId: string) => {
  // 1. Create checkout session on backend
  const { data } = await api.post('/subscriptions/create-checkout', {
    priceId,
  });

  // 2. Redirect to Stripe Checkout
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({
    sessionId: data.sessionId,
  });
};

// Or for embedded checkout:
const { data } = await api.post('/subscriptions/create-checkout', {
  priceId,
});

const checkout = await stripe.initEmbeddedCheckout({
  clientSecret: data.clientSecret,
});

checkout.mount('#checkout');
```

```php
// Backend: Create checkout session
class SubscriptionController extends Controller
{
    public function createCheckout(Request $request)
    {
        $user = $request->user();

        $session = $this->stripe->checkout->sessions->create([
            'customer' => $user->stripe_customer_id,
            'line_items' => [[
                'price' => $request->priceId,
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => config('app.frontend_url') . '/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/pricing',
        ]);

        return response()->json([
            'sessionId' => $session->id,
            'clientSecret' => $session->client_secret,
        ]);
    }

    // Webhook handler
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response('Invalid signature', 400);
        }

        // Dispatch to job for processing
        ProcessStripeWebhook::dispatch($event);

        return response('Webhook received', 200);
    }
}
```

### Pattern 4: Queue Jobs for AI Plan Generation

**What:** AI API calls take 3-10 seconds. Queue jobs prevent timeout, allow retries, enable progress tracking.

**When to use:** Any long-running operation (external API calls, complex calculations, bulk operations).

**Trade-offs:**
- Pros: Non-blocking, retriable, scalable
- Cons: Eventual consistency, requires status polling UI

**Example:**

```php
class GenerateAIPlan implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public User $user,
    ) {}

    public function handle(PlanGeneratorService $service): void
    {
        // Check if batch cancelled (for monthly regeneration)
        if ($this->batch()?->cancelled()) {
            return;
        }

        // Generate plan via OpenAI
        $plan = $service->generateForUser($this->user);

        // Update user status
        $this->user->update(['plan_status' => 'ready']);

        // Notify user (push notification or email)
        $this->user->notify(new PlanReady($plan));
    }

    public function failed(\Throwable $exception): void
    {
        // Update status to failed
        $this->user->update(['plan_status' => 'failed']);

        // Log for admin review
        Log::error('Plan generation failed', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

```typescript
// Frontend: Poll for plan status
const { data: plan } = useQuery({
  queryKey: ['plan', userId],
  queryFn: async () => {
    const response = await api.get('/plans/current');
    return response.data;
  },
  refetchInterval: (data) => {
    // Poll every 3 seconds if plan is generating
    return data?.status === 'generating' ? 3000 : false;
  },
});
```

### Pattern 5: Monthly Scheduled Plan Regeneration

**What:** Cron job runs monthly to regenerate plans for all active subscribers.

**When to use:** Recurring tasks (subscriptions, reports, cleanup).

**Trade-offs:**
- Pros: Automated, reliable, Laravel provides clean API
- Cons: Single point of failure if scheduler stops, need monitoring

**Example:**

```php
// routes/console.php
use Illuminate\Support\Facades\Schedule;
use App\Jobs\RegeneratePlansMonthly;

Schedule::call(function () {
    $activeUsers = User::whereHas('subscription', function ($query) {
        $query->where('status', 'active');
    })->get();

    // Use batch for progress tracking
    Bus::batch(
        $activeUsers->map(fn($user) => new GenerateAIPlan($user))
    )
    ->name('Monthly Plan Regeneration')
    ->onQueue('plans')
    ->dispatch();

})->monthlyOn(1, '02:00')  // 1st of month at 2 AM
  ->timezone('UTC')
  ->onOneServer()           // Only one server in multi-server setup
  ->withoutOverlapping();   // Prevent concurrent runs

// Or use a command for better testability
Schedule::command('plans:regenerate')
    ->monthlyOn(1, '02:00')
    ->timezone('UTC')
    ->onOneServer()
    ->withoutOverlapping();
```

```php
// app/Console/Commands/RegenerateMonthlyPlans.php
class RegenerateMonthlyPlans extends Command
{
    protected $signature = 'plans:regenerate';
    protected $description = 'Regenerate training plans for all active subscribers';

    public function handle(): int
    {
        $activeUsers = User::whereHas('subscription', function ($query) {
            $query->where('status', 'active');
        })->get();

        $this->info("Regenerating plans for {$activeUsers->count()} users...");

        $batch = Bus::batch(
            $activeUsers->map(fn($user) => new GenerateAIPlan($user))
        )
        ->name('Monthly Plan Regeneration - ' . now()->format('Y-m-d'))
        ->onQueue('plans')
        ->progress(function (Batch $batch) {
            $this->info("Progress: {$batch->progress()}%");
        })
        ->dispatch();

        $this->info("Batch dispatched: {$batch->id}");

        return Command::SUCCESS;
    }
}
```

## Data Flow

### Request Flow: Questionnaire Completion

```
[User starts questionnaire]
    ↓
[Frontend: POST /questionnaire/session]
    ↓
[Backend: QuestionnaireController@initSession]
    ↓
[QuestionnaireService creates anonymous session]
    ↓
[Return session token (JWT, not in DB)]
    ↓
[Frontend stores token in AsyncStorage]
    ↓
[User completes 4-step questionnaire]
    ↓
[Frontend: POST /questionnaire/responses (with session token header)]
    ↓
[QuestionnaireController validates + saves to temp sessions table]
    ↓
[User sees pricing page]
    ↓
[User clicks "Subscribe"]
    ↓
[Frontend: POST /auth/register (with session token)]
    ↓
[AuthService: create user → transfer session → return JWT]
    ↓
[Frontend stores JWT, navigates to payment]
```

### Request Flow: Stripe Subscription

```
[User on pricing page, authenticated]
    ↓
[Frontend: POST /subscriptions/create-checkout]
    ↓
[SubscriptionController creates Stripe checkout session]
    ↓
[Return session ID + client secret]
    ↓
[Frontend redirects to Stripe Checkout / Embedded UI]
    ↓
[User enters payment info (directly to Stripe)]
    ↓
[Stripe processes payment]
    ↓
[Stripe webhook: POST /webhooks/stripe]
    ↓
[SubscriptionController validates signature]
    ↓
[Dispatch ProcessStripeWebhook job]
    ↓
[Job updates subscription status]
    ↓
[If payment success: Dispatch GenerateAIPlan job]
    ↓
[GenerateAIPlan calls OpenAI API]
    ↓
[Save plan to database]
    ↓
[Update user plan_status to 'ready']
    ↓
[Send push notification to user]
    ↓
[Frontend polls /plans/current, receives plan]
```

### State Management Flow

```
┌─────────────────────────────────────────────────┐
│          FRONTEND STATE (Zustand)               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Onboarding Store                               │
│  ┌───────────────────────────────────┐          │
│  │ sessionToken: string | null       │          │
│  │ currentStep: number               │          │
│  │ responses: Record<number, any>    │          │
│  │ isComplete: boolean               │          │
│  └───────────────────────────────────┘          │
│                    ↕ (persist)                  │
│              AsyncStorage                       │
│                                                 │
│  Auth Store                                     │
│  ┌───────────────────────────────────┐          │
│  │ user: User | null                 │          │
│  │ token: string | null              │          │
│  │ isAuthenticated: boolean          │          │
│  └───────────────────────────────────┘          │
│                    ↕ (persist)                  │
│           SecureStore (native)                  │
│           localStorage (web)                    │
│                                                 │
│  Plan Store                                     │
│  ┌───────────────────────────────────┐          │
│  │ currentPlan: Plan | null          │          │
│  │ planHistory: Plan[]               │          │
│  │ status: 'loading' | 'ready' | ... │          │
│  └───────────────────────────────────┘          │
│                    ↕ (sync from API)            │
│               React Query Cache                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Anonymous Session Flow:** Frontend creates session token → stores in AsyncStorage → sends with each questionnaire request → transfers to user on registration
2. **Authentication Flow:** User signs in → backend returns JWT → frontend stores in SecureStore → JWT sent with all protected API requests via axios interceptor
3. **Plan Generation Flow:** Subscription webhook → queue job → OpenAI API call → save plan → update status → frontend polls → displays plan

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Monolith is fine. Single Redis instance. Single queue worker. Monthly cron can process sequentially. |
| **1k-10k users** | Add queue workers (3-5). Use Redis queue priorities (high for payments, default for plans). Add database indexes on frequently queried fields. |
| **10k-100k users** | Multiple queue workers per queue. Redis Sentinel for failover. Cache frequently accessed plans (Redis). Use Laravel Horizon for queue monitoring. Consider CDN for static assets. Database read replicas for analytics. |
| **100k+ users** | Consider microservices (separate plan generation service). Use database partitioning for plans table. Implement rate limiting on API. Consider serverless for monthly regeneration (AWS Lambda). Use queue batching for bulk operations. |

### Scaling Priorities

1. **First bottleneck (5k-10k users):** Queue workers. Symptom: Slow plan generation, jobs piling up. Fix: Horizontal scaling of queue workers, optimize OpenAI API calls (batch requests if possible).

2. **Second bottleneck (20k-50k users):** Database reads. Symptom: Slow dashboard loads, plan history queries. Fix: Add Redis caching for current plans, database read replicas, optimize queries with eager loading.

3. **Third bottleneck (50k-100k users):** API rate limits (OpenAI). Symptom: Plan generation failures. Fix: Implement queue rate limiting, spread monthly regeneration over 3-7 days instead of single day, negotiate higher OpenAI limits.

## Anti-Patterns

### Anti-Pattern 1: Storing Payment Data on Backend

**What people do:** Save credit card numbers or full payment details in their database "for convenience".

**Why it's wrong:** PCI compliance nightmare. Massive security liability. Stripe already stores this securely.

**Do this instead:** Only store Stripe customer ID, subscription ID, and payment status. Let Stripe handle all payment data. Use Stripe Customer Portal for users to update payment methods.

### Anti-Pattern 2: Synchronous AI API Calls in Controllers

**What people do:**
```php
public function generatePlan() {
    $plan = OpenAI::chat()->create(...); // 5-10 second wait
    return response()->json($plan);
}
```

**Why it's wrong:** HTTP timeout (30-60 seconds). Poor UX (user waits). Single point of failure (if OpenAI is down, whole request fails).

**Do this instead:** Queue the job immediately, return status, frontend polls for completion:
```php
public function generatePlan() {
    GenerateAIPlan::dispatch(auth()->user());
    return response()->json(['status' => 'generating']);
}
```

### Anti-Pattern 3: Using Context API for Frequently Updating State

**What people do:** Put form state, questionnaire progress, or real-time data in React Context.

**Why it's wrong:** Every context update re-renders all consumers. Performance degrades with complex component trees. No built-in persistence.

**Do this instead:** Use Zustand for app state (selectors prevent unnecessary re-renders), React Query for server state (automatic caching + polling), Context only for stable values (theme, auth user object).

### Anti-Pattern 4: Fat Controllers with Business Logic

**What people do:**
```php
class PlanController {
    public function create(Request $request) {
        // 100+ lines of validation, calculation, external API calls
        // directly in controller
    }
}
```

**Why it's wrong:** Untestable without HTTP layer. Not reusable (can't call from CLI, jobs, etc.). Violates single responsibility.

**Do this instead:** Thin controllers that delegate to services:
```php
class PlanController {
    public function create(Request $request, PlanGeneratorService $service) {
        $plan = $service->generate(auth()->user(), $request->validated());
        return new PlanResource($plan);
    }
}
```

### Anti-Pattern 5: Not Handling Failed Jobs

**What people do:** Dispatch jobs and assume they'll always succeed.

**Why it's wrong:** OpenAI API failures, network issues, rate limits happen. Users left in "generating" state forever.

**Do this instead:** Implement `failed()` method, update user status, log for admin review, optionally retry with exponential backoff:
```php
public function failed(\Throwable $exception): void {
    $this->user->update(['plan_status' => 'failed']);
    Log::error('Plan generation failed', [
        'user_id' => $this->user->id,
        'error' => $exception->getMessage(),
    ]);
    // Optionally notify user or admin
}
```

### Anti-Pattern 6: Loading Entire Plan History Without Pagination

**What people do:** `Plan::where('user_id', $userId)->get()` → returns 12+ months of plans.

**Why it's wrong:** Slow queries, large response payloads, mobile data usage, poor UX.

**Do this instead:** Paginate with cursor-based pagination for infinite scroll:
```php
$plans = Plan::where('user_id', $userId)
    ->latest()
    ->cursorPaginate(10);
```

Frontend uses infinite query:
```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['plans', userId],
  queryFn: ({ pageParam = null }) =>
    api.get('/plans', { params: { cursor: pageParam } }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **OpenAI API** | Backend only, via queue jobs | Store API key in `.env`. Use exponential backoff for rate limits. Cache common prompts to reduce costs. |
| **Stripe API** | Backend creates sessions, frontend displays UI, webhooks confirm | Separate publishable key (frontend) and secret key (backend). Always verify webhook signatures. Test with Stripe CLI locally. |
| **Push Notifications** | Expo Push Notifications via backend | Get push token on app load, store in users table. Send via Laravel notification system. |
| **Analytics** | Frontend sends events via Segment/Mixpanel | Track onboarding funnel drop-off, payment conversion, plan engagement. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend API** | REST over HTTPS, JWT auth | Use axios interceptors for token injection. Handle 401 by refreshing token or redirecting to sign-in. |
| **Controllers ↔ Services** | Direct method calls (DI) | Controllers handle HTTP, services handle business logic. Never call repositories directly from controllers. |
| **Services ↔ Repositories** | Interface-based DI | Services depend on repository interfaces, not concrete classes. Allows testing with mocks. |
| **Services ↔ Jobs** | Dispatch via Laravel Queue | Jobs run async. Services should not wait for job completion. Use status polling for UI updates. |
| **Frontend State ↔ AsyncStorage** | Zustand persist middleware | Automatic serialization. Clear storage on sign-out to prevent data leaks between accounts. |

## Build Order Implications

### What Must Be Built First (Dependencies)

1. **Phase 1: Core Infrastructure**
   - Database schema (users, sessions, plans, subscriptions)
   - JWT auth (backend + frontend)
   - API client setup (axios with interceptors)
   - Expo Router navigation structure (route groups)

2. **Phase 2: Anonymous Questionnaire**
   - Session management (anonymous tokens)
   - Questionnaire state (Zustand store)
   - Questionnaire API endpoints
   - AsyncStorage persistence

3. **Phase 3: Account Creation + Session Transfer**
   - Registration flow
   - Session transfer service
   - Auth state management
   - Protected routes

4. **Phase 4: Payment Integration**
   - Stripe account setup (test + live mode)
   - Subscription service
   - Checkout flow (frontend + backend)
   - Webhook infrastructure

5. **Phase 5: Plan Generation**
   - OpenAI API integration
   - Queue setup (Redis + workers)
   - Plan generator service
   - Job implementation
   - Status polling UI

6. **Phase 6: Plan Display + History**
   - Plan display components
   - History list with pagination
   - React Query setup

7. **Phase 7: Monthly Regeneration**
   - Scheduled task setup
   - Batch job implementation
   - Monitoring/alerting

### Parallel Work Streams

These can be built independently after Phase 1:

- **UI/UX refinement:** Questionnaire form validation, loading states, error handling
- **Analytics:** Event tracking, funnel analysis
- **Admin panel:** View users, subscriptions, failed jobs
- **Testing:** Unit tests for services, integration tests for APIs

### Critical Path

The blocking dependency chain is:
```
Auth → Session Management → Account Creation → Payment → Plan Generation → Display
```

You cannot build payment without auth. You cannot generate plans without payment confirmation. But you can build UI components, write tests, and set up infrastructure in parallel.

## Sources

### High Confidence (Official Documentation)

- [Expo Router Authentication](https://docs.expo.dev/router/advanced/authentication/) - Protected routes, session providers
- [Laravel Queues Documentation](https://laravel.com/docs/11.x/queues) - Queue configuration, job batching, Redis patterns
- [Laravel Task Scheduling](https://laravel.com/docs/11.x/scheduling) - Monthly recurring tasks, cron setup
- [Stripe Subscriptions API](https://docs.stripe.com/billing/subscriptions/build-subscriptions) - Client-server architecture, webhooks
- [Stripe React Native SDK](https://docs.stripe.com/sdks/react-native) - Mobile payment integration

### Medium Confidence (Verified Community Sources)

- [OnboardJS - React Onboarding Libraries 2026](https://onboardjs.com/blog/5-best-react-onboarding-libraries-in-2025-compared)
- [React Native Onboarding with XState](https://dev.to/gtodorov/react-native-onboarding-wizard-with-xstate-v5-1naf)
- [Laravel Service-Action Pattern](https://ratheepan.medium.com/clean-service-action-architecture-a-battle-tested-pattern-for-laravel-applications-dc311ecc5c29)
- [Laravel Queue Management Guide 2025](https://nihardaily.com/47-advanced-laravel-queue-management-complete-guide-to-background-jobs-batching-performance-optimization)
- [Zustand vs Redux vs Context API Comparison](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [React Native State Management 2026](https://teachmeidea.com/react-native-state-management-comparison/)
- [AI Fitness App Architecture 2026](https://www.lowcode.agency/blog/ai-fitness-app-development-guide)
- [Fitness App UI/UX Best Practices](https://stormotion.io/blog/fitness-app-ux/)
- [SuperTokens Anonymous Session Implementation](https://supertokens.com/docs/post-authentication/session-management/advanced-workflows/anonymous-session)
- [Laravel Repository Pattern Best Practices](https://www.shkodenko.com/laravel-best-practices-repository-pattern-for-clean-and-scalable-code/)

---
*Architecture research for: RUNLINE - Mobile Fitness/Running Training App*
*Researched: 2026-01-25*
*Tech Stack: React Native (Expo) + Laravel + Redis + MySQL + OpenAI + Stripe*
