# Phase 2: AI Plan Delivery - Research

**Researched:** 2026-02-11
**Domain:** AI-generated training plans with Laravel async jobs, OpenAI API, and React Native display
**Confidence:** HIGH

## Summary

This phase connects the user's completed questionnaire to AI-generated personalized training plans. The existing codebase already has substantial infrastructure: `GeneratePlanJob`, `PlanGeneratorService`, `NotificationService`, `Plan` model, and frontend scaffolding in `(plans)/` routes. Research confirms this foundation is solid and follows Laravel best practices.

Key implementation areas:
1. **Trigger flow**: Subscription webhook triggers initial plan generation automatically
2. **OpenAI integration**: Use structured JSON outputs with gpt-4o for reliable plan schema
3. **Async processing**: Existing job with 3 retries and 60s backoff is well-configured
4. **Push notifications**: Replace Firebase with Expo Push Service for simpler React Native integration
5. **Frontend display**: Wire existing UI scaffolding to real API data with FlatList optimization

**Primary recommendation:** Enhance the existing `PlanGeneratorService` prompt to include explicit week/day structure, upgrade OpenAI call to use structured outputs with JSON schema, replace Firebase FCM with Expo Push Notifications, and connect frontend mock data to real API endpoints.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| openai-php/client | ^0.18.0 | OpenAI API calls | Official PHP client, supports structured outputs |
| Laravel Queues | 12.x | Async job processing | Built-in, battle-tested |
| predis/predis | ^3.3 | Redis for queues | High performance queue driver |
| expo-notifications | ~0.31.0 | Push notifications | Native Expo integration (needs install) |

### Supporting (Need Installation)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | Latest | Push notifications | Frontend notification handling |
| expo-device | Latest | Device detection | Required for push token generation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Expo Push | Firebase FCM | FCM requires more setup, Expo is simpler for Expo apps |
| Redis queue | Database queue | Database is slower but doesn't need Redis server |
| gpt-4o | gpt-4 | gpt-4o is faster, cheaper, and supports structured outputs |

**Backend Installation:** Already complete (existing composer.json)

**Frontend Installation:**
```bash
npx expo install expo-notifications expo-device expo-constants
```

## Architecture Patterns

### Existing Backend Structure (Verified)
```
app/
├── Jobs/
│   └── GeneratePlanJob.php       # Async plan generation (exists)
├── Services/
│   ├── PlanGeneratorService.php  # Plan business logic (exists)
│   └── NotificationService.php   # Push notifications (exists, needs update)
├── Models/
│   └── Plan.php                  # Plan model (exists)
└── Http/Controllers/Api/
    ├── PlanController.php        # Plan endpoints (exists)
    └── WebhookController.php     # Stripe webhooks (needs plan trigger)
```

### Existing Frontend Structure (Verified)
```
app/
├── (tabs)/
│   └── plans.tsx                 # Week overview (exists, uses mock data)
└── (plans)/
    ├── _layout.tsx               # Layout (exists)
    ├── week/[weekNumber].tsx     # Week detail (exists, uses mock data)
    └── day/[dayId].tsx           # Day detail (exists, uses mock data)
```

### Pattern 1: Webhook-Triggered Plan Generation
**What:** Initial plan generation triggered by Stripe subscription webhook
**When to use:** After subscription payment succeeds
**Why:** Eliminates need for frontend to poll/trigger, immediate plan generation

```php
// In WebhookController::handleSubscriptionCreated()
case 'customer.subscription.created':
    $subscription = $this->paymentService->handleSubscriptionCreated($event->data->object->toArray());

    // Trigger initial plan generation if questionnaire completed
    if ($subscription->user->profile?->questionnaire_completed) {
        app(PlanGeneratorService::class)->generateInitialPlan($subscription->user);
    }
    break;
```

### Pattern 2: OpenAI Structured Output with JSON Schema
**What:** Use response_format with json_schema for guaranteed valid output
**When to use:** All plan generation calls
**Why:** Eliminates JSON parsing errors, 100% schema compliance

```php
// Source: OpenAI API documentation
$response = $client->chat()->create([
    'model' => 'gpt-4o-2024-08-06',
    'messages' => [...],
    'response_format' => [
        'type' => 'json_schema',
        'json_schema' => [
            'name' => 'training_plan',
            'strict' => true,
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'weeks' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'week_number' => ['type' => 'integer'],
                                'start_date' => ['type' => 'string'],
                                'end_date' => ['type' => 'string'],
                                'days' => [
                                    'type' => 'array',
                                    'items' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'day_name' => ['type' => 'string'],
                                            'date' => ['type' => 'string'],
                                            'is_rest' => ['type' => 'boolean'],
                                            'workout' => ['type' => ['object', 'null']]
                                        ],
                                        'required' => ['day_name', 'date', 'is_rest']
                                    ]
                                ]
                            ],
                            'required' => ['week_number', 'start_date', 'end_date', 'days']
                        ]
                    ]
                ],
                'required' => ['weeks']
            ]
        ]
    ]
]);
```

### Pattern 3: Week Date Calculation
**What:** Calculate weeks from first Monday after signup to Sunday before next month's first Monday
**When to use:** Initial and monthly plan generation
**Why:** Ensures complete weeks, consistent Monday-Sunday structure

```php
// Existing implementation in PlanGeneratorService is correct
// Plan period: Mon Jan 20 -> Sun Feb 2 (if signup Jan 15)
$startDate = $this->getNextMonday(Carbon::now());
$endDate = $this->getSundayBeforeNextMonthFirstMonday($startDate);

// Calculate number of weeks
$weeks = [];
$currentMonday = $startDate->copy();
$weekNumber = 1;

while ($currentMonday->lte($endDate)) {
    $weeks[] = [
        'week_number' => $weekNumber,
        'start_date' => $currentMonday->format('Y-m-d'),
        'end_date' => $currentMonday->copy()->addDays(6)->format('Y-m-d'),
    ];
    $currentMonday->addWeek();
    $weekNumber++;
}
```

### Pattern 4: Expo Push Notifications (Replace Firebase)
**What:** Use Expo Push Service instead of Firebase FCM
**When to use:** All push notifications to React Native app
**Why:** Simpler setup, native Expo integration, no Firebase configuration needed

```php
// Backend: Replace NotificationService::sendToDevice
private function sendToExpo(string $expoPushToken, string $title, string $body, ?array $data = null): void
{
    $response = Http::post('https://exp.host/--/api/v2/push/send', [
        'to' => $expoPushToken,
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'sound' => 'default',
    ]);

    if (!$response->successful()) {
        throw new \Exception('Expo push failed: ' . $response->body());
    }
}
```

```typescript
// Frontend: Get Expo Push Token
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data; // "ExponentPushToken[xxx]"
}
```

### Anti-Patterns to Avoid
- **Synchronous plan generation:** Never generate plans in HTTP request cycle - always use jobs
- **Polling for plan status:** Use push notifications instead of client polling
- **Manual JSON parsing:** Use structured outputs to guarantee valid JSON
- **Hardcoded week dates:** Always calculate dynamically based on signup date
- **Blocking webhook handlers:** Dispatch jobs, don't process inline

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date/week calculation | Custom date math | Carbon's `next()`, `addWeek()` | Handles edge cases, DST, leap years |
| JSON validation | Custom parsing/validation | OpenAI structured outputs | 100% guaranteed schema compliance |
| Retry logic | Custom retry loops | Laravel job $tries/$backoff | Built-in exponential backoff |
| Push notifications | Raw FCM HTTP calls | Expo Push Service | Token management, delivery tracking |
| List virtualization | Custom scroll handling | FlatList with getItemLayout | Native performance optimization |

**Key insight:** The existing codebase already avoids most hand-rolling. The job retry mechanism, date calculations, and service architecture are solid. Main enhancement is OpenAI structured outputs.

## Common Pitfalls

### Pitfall 1: Plan Generation Race Condition
**What goes wrong:** Multiple plans created for same period if webhook fires twice
**Why it happens:** Stripe can send duplicate webhooks during network issues
**How to avoid:** Check for existing plan before creating (existing code does this)
**Warning signs:** Duplicate plan records in database for same user/period

### Pitfall 2: OpenAI Response Not Valid JSON
**What goes wrong:** AI returns conversational text instead of JSON, parsing fails
**Why it happens:** Using json_object mode or no response_format
**How to avoid:** Use `json_schema` structured outputs with strict mode
**Warning signs:** JSON parse errors in logs, plans stuck in "failed" status

### Pitfall 3: Push Token Expiration
**What goes wrong:** Notifications fail silently, users miss plan-ready alerts
**Why it happens:** Device tokens expire, users reinstall app
**How to avoid:** Mark invalid tokens inactive, refresh token on app launch
**Warning signs:** High notification failure rate, "NotRegistered" errors

### Pitfall 4: Month Boundary Edge Cases
**What goes wrong:** Plan ends mid-week or spans calendar month incorrectly
**Why it happens:** Not accounting for "first Monday of next month" rule
**How to avoid:** Always calculate to "Sunday before next month's first Monday"
**Warning signs:** Plans ending on non-Sunday, gaps between monthly plans

### Pitfall 5: FlatList Performance on Large Plans
**What goes wrong:** Janky scrolling, high memory usage on 5+ week plans
**Why it happens:** Re-rendering all items, no height optimization
**How to avoid:** Use `getItemLayout`, `React.memo`, `keyExtractor`
**Warning signs:** Dropped frames, slow scroll, memory warnings

### Pitfall 6: Webhook Signature Verification Missing
**What goes wrong:** Malicious actors trigger fake plan generation
**Why it happens:** Not verifying Stripe webhook signature
**How to avoid:** Existing WebhookController correctly verifies (keep it)
**Warning signs:** Plans generated without corresponding Stripe events

## Code Examples

### Plan JSON Schema (Complete Structure)
```php
// Source: Project-specific schema for training plans
$planSchema = [
    'type' => 'object',
    'properties' => [
        'plan_summary' => [
            'type' => 'string',
            'description' => 'Resume du plan en francais (2-3 phrases)'
        ],
        'total_weeks' => ['type' => 'integer'],
        'weeks' => [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'week_number' => ['type' => 'integer'],
                    'start_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD'],
                    'end_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD'],
                    'week_focus' => ['type' => 'string', 'description' => 'Theme de la semaine'],
                    'days' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'day_name' => ['type' => 'string', 'enum' => ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']],
                                'date' => ['type' => 'string'],
                                'is_rest' => ['type' => 'boolean'],
                                'workout' => [
                                    'type' => ['object', 'null'],
                                    'properties' => [
                                        'title' => ['type' => 'string'],
                                        'type' => ['type' => 'string', 'enum' => ['endurance', 'vma', 'seuil', 'fractionne', 'recuperation', 'sortie_longue']],
                                        'duration_minutes' => ['type' => 'integer'],
                                        'description' => ['type' => 'string'],
                                        'steps' => [
                                            'type' => 'array',
                                            'items' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'title' => ['type' => 'string'],
                                                    'description' => ['type' => 'string'],
                                                    'duration_minutes' => ['type' => 'integer']
                                                ],
                                                'required' => ['title', 'description']
                                            ]
                                        ]
                                    ],
                                    'required' => ['title', 'type', 'duration_minutes', 'description', 'steps']
                                ]
                            ],
                            'required' => ['day_name', 'date', 'is_rest']
                        ]
                    ]
                ],
                'required' => ['week_number', 'start_date', 'end_date', 'week_focus', 'days']
            ]
        ]
    ],
    'required' => ['plan_summary', 'total_weeks', 'weeks']
];
```

### Enhanced Prompt Builder
```php
// Include explicit week structure in prompt
public function buildPrompt(Plan $plan, string $type): string
{
    $profile = $plan->user->profile;
    $weeks = $this->calculateWeeks($plan->start_date, $plan->end_date);

    $prompt = "Tu es un coach de course a pied expert. Genere un plan d'entrainement personnalise.\n\n";
    $prompt .= "=== PROFIL DU COUREUR ===\n";
    $prompt .= "Objectif principal: {$profile->primary_goal}\n";
    $prompt .= "Jours disponibles: " . implode(', ', $profile->available_days ?? []) . "\n";
    $prompt .= "Volume actuel: {$profile->current_weekly_volume_km} km/semaine\n";
    // ... other profile fields

    $prompt .= "\n=== STRUCTURE DU PLAN ===\n";
    $prompt .= "Nombre de semaines: " . count($weeks) . "\n";

    foreach ($weeks as $week) {
        $prompt .= "Semaine {$week['week_number']}: {$week['start_date']} au {$week['end_date']}\n";
    }

    $prompt .= "\n=== CONSIGNES ===\n";
    $prompt .= "- Genere un workout pour chaque jour de chaque semaine\n";
    $prompt .= "- Marque les jours de repos avec is_rest: true\n";
    $prompt .= "- Respecte les jours disponibles du coureur\n";
    $prompt .= "- Tout le contenu DOIT etre en francais\n";

    return $prompt;
}

private function calculateWeeks(Carbon $startDate, Carbon $endDate): array
{
    $weeks = [];
    $current = $startDate->copy();
    $weekNum = 1;

    while ($current->lte($endDate)) {
        $weekEnd = $current->copy()->endOfWeek(Carbon::SUNDAY);
        if ($weekEnd->gt($endDate)) {
            $weekEnd = $endDate->copy();
        }

        $weeks[] = [
            'week_number' => $weekNum,
            'start_date' => $current->format('Y-m-d'),
            'end_date' => $weekEnd->format('Y-m-d'),
        ];

        $current = $weekEnd->copy()->addDay();
        $weekNum++;
    }

    return $weeks;
}
```

### Frontend API Hook for Plans
```typescript
// Source: React Native data fetching pattern
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface Plan {
  id: number;
  start_date: string;
  end_date: string;
  type: 'initial' | 'monthly';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  content: PlanContent | null;
}

interface PlanContent {
  plan_summary: string;
  total_weeks: number;
  weeks: Week[];
}

export function useActivePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ plan: Plan | null }>('/plans/active');
      setPlan(response.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch: fetchPlan };
}
```

### FlatList Optimization for Week Display
```typescript
// Source: React Native performance docs
const WEEK_CARD_HEIGHT = 120; // Fixed height for getItemLayout

const getItemLayout = useCallback(
  (_: any, index: number) => ({
    length: WEEK_CARD_HEIGHT,
    offset: WEEK_CARD_HEIGHT * index,
    index,
  }),
  []
);

const WeekCard = React.memo(({ week, onPress }: WeekCardProps) => (
  <TouchableOpacity onPress={() => onPress(week.week_number)}>
    {/* ... */}
  </TouchableOpacity>
));

<FlatList
  data={plan?.content?.weeks ?? []}
  keyExtractor={(item) => `week-${item.week_number}`}
  renderItem={({ item }) => <WeekCard week={item} onPress={handleWeekPress} />}
  getItemLayout={getItemLayout}
  removeClippedSubviews={true}
  maxToRenderPerBatch={5}
  windowSize={7}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| json_object mode | json_schema structured outputs | Aug 2024 | 100% schema compliance |
| Firebase FCM | Expo Push Service | 2024 | Simpler setup for Expo apps |
| gpt-4 | gpt-4o-2024-08-06 | Aug 2024 | Faster, cheaper, supports structured outputs |
| Manual webhook retry | Laravel job retry | Laravel 8+ | Built-in exponential backoff |

**Deprecated/outdated:**
- `response_format: {type: "json_object"}` - Use json_schema with strict mode instead
- Firebase legacy API (`fcm.googleapis.com/fcm/send`) - Use HTTP v1 or Expo Push
- Synchronous OpenAI calls in controllers - Always use queued jobs

## Open Questions

1. **Model selection for cost optimization**
   - What we know: gpt-4o-mini is cheaper, gpt-4o is more capable
   - What's unclear: Whether gpt-4o-mini produces quality training plans
   - Recommendation: Start with gpt-4o, evaluate gpt-4o-mini for cost savings later

2. **Plan preview before payment**
   - What we know: User decision states "Show plan preview before payment"
   - What's unclear: How much of the plan to show (full vs partial)
   - Recommendation: Generate and display summary/first week preview, full plan after payment

3. **Plan regeneration on profile update**
   - What we know: Monthly regeneration runs first Monday
   - What's unclear: Should profile changes trigger immediate regeneration?
   - Recommendation: Add "Regenerate Plan" button in profile for manual regeneration

## Sources

### Primary (HIGH confidence)
- OpenAI Platform docs - Structured outputs, json_schema format
- Laravel 12.x docs - Queues, job retries, scheduling
- Expo docs - expo-notifications setup, push service
- Existing codebase analysis:
  - `emrun-backend/app/Jobs/GeneratePlanJob.php`
  - `emrun-backend/app/Services/PlanGeneratorService.php`
  - `emrun-backend/app/Services/NotificationService.php`
  - `emrun-frontend/app/(plans)/`

### Secondary (MEDIUM confidence)
- [OpenAI Structured Outputs announcement](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- [Expo Push Notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Push Sending docs](https://docs.expo.dev/push-notifications/sending-notifications/)
- [React Native FlatList optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [Laravel Queues best practices 2026](https://laravel.com/docs/12.x/queues)

### Tertiary (LOW confidence)
- openai-php/client v0.18 structured outputs support - needs verification during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed/verified
- Architecture: HIGH - Existing codebase provides solid foundation
- OpenAI integration: MEDIUM - json_schema in PHP client needs testing
- Pitfalls: HIGH - Based on official docs and codebase analysis

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable domain)
