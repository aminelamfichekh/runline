# Testing Patterns

**Analysis Date:** 2026-01-24

## Test Framework

**Backend (Laravel/PHP):**
- Framework: PHPUnit (defined in `phpunit.xml`)
- Config: `/c/Users/dell/running/emrun-backend/phpunit.xml`
- Test location: `tests/` directory with `Unit/` and `Feature/` subdirectories

**Run Commands:**
```bash
php artisan test                 # Run all tests
php artisan test --filter=TestName  # Run specific test
php artisan test tests/Feature/QuestionnaireSessionTest.php  # Run specific file
php artisan test --coverage     # Coverage report
```

**Assertion Library:**
- Laravel Testing assertions (HTTP-level)
- PHPUnit assertions for unit tests
- Both built into Laravel TestCase

**Frontend (React Native/TypeScript):**
- No test framework configured in current setup
- No Jest or Vitest config present
- Only development dependencies: Babel, TypeScript, Tailwind

## Test File Organization

**Backend:**

**Location:**
- `tests/Unit/` - unit tests
- `tests/Feature/` - feature/integration tests
- Mirrors app structure but in tests directory

**Naming:**
- PascalCase with `Test` suffix: `QuestionnaireSessionTest.php`, `ExampleTest.php`
- One test class per feature/model

**Structure:**
```
tests/
├── Unit/
│   └── ExampleTest.php
├── Feature/
│   ├── ExampleTest.php
│   ├── QuestionnaireSessionTest.php
│   └── api_test.php
└── TestCase.php
```

**Frontend:**
- No tests currently present in source code
- Test structure would follow convention: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Co-located with components or in parallel `__tests__` directory

## Test Structure

**Backend Test Suite Organization:**

From `QuestionnaireSessionTest.php`:
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\QuestionnaireSession;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuestionnaireSessionTest extends TestCase
{
    use RefreshDatabase;  // Reset database for each test

    /**
     * Test création de session anonyme avec payload vide.
     */
    public function test_can_create_anonymous_session_with_empty_payload(): void
    {
        $response = $this->postJson('/api/questionnaire/sessions', [
            'payload' => [],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'session_uuid',
                    'session_id',
                ],
            ]);

        $this->assertDatabaseHas('questionnaire_sessions', [
            'completed' => false,
            'user_id' => null,
        ]);
    }
}
```

**Patterns:**

**Setup Pattern:**
- Traits used for common behavior: `use RefreshDatabase` resets database
- Factory usage for test data:
```php
$user = User::factory()->create();
```

**Teardown Pattern:**
- Automatic via `RefreshDatabase` trait - database reset after each test
- No explicit cleanup needed for transactions (auto-rolled back)

**Assertion Pattern:**
- Fluent HTTP assertions: `$response->assertStatus(201)->assertJsonStructure(...)`
- Database assertions: `$this->assertDatabaseHas('table', [...])`, `$this->assertArrayNotHasKey(...)`
- Value assertions: `$this->assertEquals(...)`, `$this->assertTrue(...)`
- JWT token assertions: Create token, add to header: `$this->withHeader('Authorization', "Bearer {$token}")`

## Test Types

**Feature/Integration Tests:**
- Full HTTP endpoint testing from controller through service to database
- Primary test type in this project
- Location: `tests/Feature/`
- Example: `QuestionnaireSessionTest.php` tests questionnaire session CRUD operations

```php
public function test_can_update_session_with_merge(): void
{
    $session = QuestionnaireSession::create([
        'payload' => [
            'email' => 'test@example.com',
            'first_name' => 'John',
        ],
        'completed' => false,
    ]);

    $response = $this->putJson("/api/questionnaire/sessions/{$session->session_uuid}", [
        'payload' => [
            'last_name' => 'Doe',
        ],
    ]);

    $response->assertStatus(200);

    $session->refresh();
    $this->assertEquals('John', $session->payload['first_name']); // Preserved
    $this->assertEquals('Doe', $session->payload['last_name']); // Added
}
```

**Unit Tests:**
- Individual method/function testing
- Location: `tests/Unit/`
- Less commonly used in this project (only `ExampleTest.php` present)

**E2E Tests:**
- Not implemented in current setup

## Mocking

**Framework:** Mockery (built into Laravel)

**Patterns:**
```php
$this->mock(\App\Services\PlanGeneratorService::class, function ($mock) use ($user) {
    $mock->shouldReceive('generateInitialPlan')
        ->once()
        ->with($user)
        ->andReturn(true);
});
```

**What to Mock:**
- External services (PlanGeneratorService)
- Complex/slow operations
- Infrastructure calls (not database - use RefreshDatabase instead)

**What NOT to Mock:**
- Database operations (use RefreshDatabase trait)
- Models and relationships
- Controllers (test them as-is)
- Validation logic (should be tested as-is)

**Example from QuestionnaireSessionTest - mocking service:**
```php
public function test_attach_triggers_plan_generation_on_first_completion(): void
{
    $user = User::factory()->create();
    $token = JWTAuth::fromUser($user);

    $session = QuestionnaireSession::create([
        'payload' => $this->getCompletePayload(),
        'completed' => false,
    ]);

    // Mock PlanGeneratorService to verify it's called
    $this->mock(\App\Services\PlanGeneratorService::class, function ($mock) use ($user) {
        $mock->shouldReceive('generateInitialPlan')
            ->once()
            ->with($user)
            ->andReturn(true);
    });

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

    $response->assertStatus(200);
}
```

## Fixtures and Factories

**Test Data:**
- Laravel Factories used: `User::factory()->create()`
- Helper method pattern: `$this->getCompletePayload()` returns valid test data

**Fixtures Location:**
- Database factories: `database/factories/`
- In-test helpers: `getCompletePayload()` method defined in test class itself

**Example from QuestionnaireSessionTest:**
```php
/**
 * Returns a complete valid payload for tests.
 */
protected function getCompletePayload(): array
{
    return [
        'email' => 'test@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'birth_date' => '1990-01-15',
        'gender' => 'male',
        'height_cm' => 180,
        'weight_kg' => 75,
        'primary_goal' => 'entretenir',
        'current_weekly_volume_km' => 30,
        'current_runs_per_week' => '3_4',
        'available_days' => ['monday', 'wednesday', 'friday'],
        'running_experience_period' => '1_10_ans',
        'training_locations' => ['route', 'piste'],
    ];
}
```

## Coverage

**Requirements:**
- PHPUnit configured to source `app/` directory for coverage tracking
- No explicit coverage targets enforced
- Coverage includes: `/c/Users/dell/running/emrun-backend/app/`

**View Coverage:**
```bash
php artisan test --coverage
php artisan test --coverage-html=coverage  # Generate HTML report
```

## Test Environment Configuration

**PHPUnit Configuration (`phpunit.xml`):**
```xml
<testsuites>
    <testsuite name="Unit">
        <directory>tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
        <directory>tests/Feature</directory>
    </testsuite>
</testsuites>

<source>
    <include>
        <directory>app</directory>
    </include>
</source>

<php>
    <env name="APP_ENV" value="testing"/>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>  <!-- In-memory database for tests -->
    <env name="MAIL_MAILER" value="array"/>
    <env name="QUEUE_CONNECTION" value="sync"/>
    <env name="CACHE_STORE" value="array"/>
</php>
```

**Key Settings:**
- SQLite in-memory database (`:memory:`) for fast test isolation
- Synchronous queue processing (not async)
- Array-based mail and cache stores (no external services)
- Testing environment configuration

## Test Patterns

**Async Testing (Backend):**
- All HTTP methods return promises checked with assertions
- Async operations tested within test methods
- Example:
```php
$response = $this->postJson('/api/questionnaire/sessions', [
    'payload' => [],
]);
// Response is immediately available for assertions
$response->assertStatus(201);
```

**Error/Validation Testing:**
- Invalid input tested by sending bad data and asserting 422 status
- Validation errors checked with `assertJsonValidationErrors()`:

```php
public function test_attach_validates_weekly_volume_multiple_of_5(): void
{
    $user = User::factory()->create();
    $token = JWTAuth::fromUser($user);

    $payload = $this->getCompletePayload();
    $payload['current_weekly_volume_km'] = 23; // Not multiple of 5

    $session = QuestionnaireSession::create([
        'payload' => $payload,
        'completed' => false,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

    $response->assertStatus(422)
        ->assertJsonValidationErrors('current_weekly_volume_km');
}
```

**State Testing:**
- Database state verified after operations using `refresh()`:

```php
$session->refresh();
$this->assertEquals($user->id, $session->user_id);
$this->assertTrue($session->completed);
```

**Dependency/Authorization Testing:**
- JWT tokens created and passed in headers
- Unauthorized access tested by omitting or using wrong token
- Role/owner-based access tested by creating different users

```php
$user1 = User::factory()->create();
$user2 = User::factory()->create();
$token2 = JWTAuth::fromUser($user2);

$session = QuestionnaireSession::create([
    'payload' => $this->getCompletePayload(),
    'completed' => true,
    'user_id' => $user1->id,
]);

// User2 tries to access User1's session
$response = $this->withHeader('Authorization', "Bearer {$token2}")
    ->postJson("/api/questionnaire/sessions/{$session->session_uuid}/attach");

$response->assertStatus(403);  // Forbidden
```

## Complex Flow Testing

**End-to-End Scenario Testing:**
- Multiple operations tested in sequence
- Example: Questionnaire creation → Registration → Auto-attach → Profile creation

```php
public function test_complete_flow_questionnaire_to_signup_to_attach(): void
{
    // 1. Create anonymous questionnaire session
    $sessionResponse = $this->postJson('/api/questionnaire/sessions', [
        'payload' => $this->getCompletePayload(),
    ]);

    $sessionResponse->assertStatus(201);
    $sessionUuid = $sessionResponse->json('data.session_uuid');

    // 2. Register with session_uuid
    $signupResponse = $this->postJson('/api/auth/register', [
        'name' => 'John Doe',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'session_uuid' => $sessionUuid,
    ]);

    $signupResponse->assertStatus(201);

    // 3. Verify automatic attachment
    $session = QuestionnaireSession::where('session_uuid', $sessionUuid)->first();
    $user = User::where('email', 'test@example.com')->first();

    $this->assertEquals($user->id, $session->user_id);
    $this->assertTrue($session->completed);

    // 4. Verify profile creation
    $profile = UserProfile::where('user_id', $user->id)->first();
    $this->assertNotNull($profile);
    $this->assertTrue($profile->questionnaire_completed);
    $this->assertEquals('John', $profile->first_name);
}
```

## Frontend Testing Strategy

**Current State:**
- No tests implemented in React Native/TypeScript codebase
- Recommended frameworks: Jest (common with React Native), Vitest, React Native Testing Library

**Recommended Patterns for Future:**
- Component testing with react-native-testing-library
- Mock Axios for API calls using `jest.mock()`
- Test form behavior with react-hook-form integration tests
- Mock AsyncStorage for storage operations

---

*Testing analysis: 2026-01-24*
