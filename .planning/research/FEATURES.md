# Feature Research: Running Training Apps

**Domain:** Mobile running training apps (French market focus)
**Researched:** 2026-01-25
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Personalized training plans | Industry standard - all major apps (Runna, TrainAsONE, Hal Higdon) offer this. Users expect AI/ML-driven customization based on goals and fitness level. | HIGH | Requires AI/ML algorithms, plan generation logic, adaptation based on performance. Core differentiator is HOW personalization happens, not IF. |
| Goal-based plan creation | Users need to specify race distance (5K, 10K, Half, Marathon) and target date. This is the foundation of any training plan. | MEDIUM | Needs goal selection UI, race distance picker, date picker, validation logic. Standard implementation pattern. |
| Weekly schedule view | Training plans displayed in calendar/weekly format is universal. Users need to see what's scheduled for each day at a glance. | MEDIUM | Calendar UI component, drag-and-drop for rescheduling (seen in Runna), week/month toggle views. |
| Workout details per session | Each training day shows specific workout type (easy run, tempo, intervals, rest) with distance/time targets. | LOW | Data model for workout types, detail view screen, clear workout descriptions. |
| Progress tracking | Users expect to see how they're progressing toward their goal with stats, charts, and completion indicators. | MEDIUM | Workout completion tracking, statistics calculation, chart/graph components, streak tracking. |
| Wearable integration | Seamless sync with Garmin, Apple Watch, Strava is baseline. Users won't manually log runs in 2026. | HIGH | API integrations with multiple platforms (Garmin SDK, Apple HealthKit, Strava API), sync logic, conflict resolution. Critical for retention. |
| Profile management | Users need ability to update personal info (age, weight, fitness level), change goals, adjust schedule preferences. | LOW | Standard user settings screen, form validation, data persistence. Hygiene factor. |
| Onboarding questionnaire | Fitness level assessment, goal setting, schedule availability, injury history are expected during signup. 9-step questionnaire aligns with industry (Runna has 26 steps). | MEDIUM | Multi-step form flow, conditional logic based on answers, data validation, progress indicator. |
| Audio coaching cues | Real-time audio guidance during runs (pace alerts, interval transitions, encouragement) is standard in Nike Run Club, Runna. | MEDIUM | Audio file management, GPS tracking integration, pace calculation, audio playback during workouts. |
| Rest and recovery integration | Training plans must include rest days, recovery runs, and injury prevention guidance. Users expect this to avoid burnout. | LOW | Plan generation includes rest days, educational content about recovery, flexibility in scheduling. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI plan adaptation (RUNLINE's core value) | Plans that adapt monthly based on performance, missed workouts, changing goals. Runna does this; it's RUNLINE's main differentiator. | HIGH | Requires ML model to analyze performance trends, detect patterns, adjust future weeks. This is the "personalized AI plans that adapt monthly" promise. |
| Value-first plan preview | Show users their complete generated plan BEFORE payment. This is RUNLINE's strategic advantage vs. competitors who show paywall after quiz. | MEDIUM | Generate full plan during onboarding, display in read-only mode, clear "unlock to start training" CTA. Increases conversion through transparency (trial-to-paid conversion up to 70% with value demonstration). |
| French-market optimization | UI/UX/content in French, French running culture nuances, European race distances, metric-first. | LOW | Localization (i18n), French content, cultural research. Underestimated by global competitors. |
| Transparent pricing preview | Show subscription pricing early in onboarding (during questionnaire) so users know cost before plan generation. Reduces drop-off at paywall. | LOW | Pricing display component, clear annual/monthly breakdown, cost-per-week formatting (Runna pattern). Trust builder. |
| Multi-goal training support | Train for multiple races simultaneously with blended adaptive plans (seen in TrainAsONE). Advanced users value this. | HIGH | Complex plan generation, priority management, recovery balance across goals. Post-MVP feature. |
| Strength & mobility add-ons | Complement running with strength training, Pilates, mobility sessions (Runna offers this). Injury prevention value. | MEDIUM | Library of non-running workouts, integration into weekly schedule, video demonstrations. Enhances stickiness. |
| AI performance insights | Post-workout AI-generated feedback analyzing pace, heart rate trends, suggesting adjustments (Runna's feedback loop). | HIGH | Data analysis algorithms, natural language generation, personalized recommendations. Reinforces adaptive value. |
| Flexible schedule rescheduling | Drag-and-drop workouts across days/weeks, automatic plan rebalancing when life happens. | MEDIUM | Calendar interaction, plan regeneration logic, preserving training load. Quality-of-life feature. |
| Community features (lite version) | Minimal social elements - sharing milestones, optional community challenges. NOT a social network. | MEDIUM | Activity sharing, optional leaderboards, achievement system. Keep lightweight to avoid Strava clone perception. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social network / feed | "Everyone wants Strava's social features" | Strava already dominates social running. Building a competing social platform dilutes focus on AI training value. 67% of users choose annual subscriptions for training value, not social. | Allow Strava integration for sharing. Keep RUNLINE focused on training plans. Users can have both apps. |
| Real-time GPS run tracking | "Apps need to track runs during workout" | Huge development complexity (battery optimization, GPS accuracy, offline mode). Wearable integration solves this better - users already track on Garmin/Apple Watch. | Integrate with existing tracking platforms (Strava, Garmin, Apple Health). Don't rebuild what works. |
| Unlimited plan regeneration | "Let users regenerate plans anytime" | Causes decision paralysis, undermines plan commitment, creates customer support burden when users constantly restart. | Allow plan adjustments (reschedule workouts, modify goal) but discourage full regeneration. One major revision per month. |
| Gamification overload | "Add badges, levels, streaks, points" | Can feel gimmicky and distract from serious training. Runna succeeds without heavy gamification. Focus on intrinsic motivation (race goals) over extrinsic rewards. | Simple achievement system for milestones (first 5K, longest run). Keep it understated. |
| Free tier with limited features | "Freemium drives adoption" | Fitness apps hit only 2-5% freemium conversion. Trial-to-paid (40-70% conversion) is far more effective. Free users consume resources without converting. | Offer 7-day free trial with full access (no credit card required), then paywall. Let trial be the sales pitch. |
| Nutrition tracking | "Training apps should include diet" | Scope creep into crowded nutrition space (MyFitnessPal dominates). Users already have nutrition apps. Integration > duplication. | Provide general nutrition guidance for runners. Link to MyFitnessPal if users want detailed tracking. |
| Multi-sport support | "Support cycling, swimming, triathlons" | Dilutes running expertise, increases complexity 3x, confuses brand positioning. RUNLINE is AI running coach, not general fitness app. | Stay focused on running. Master one sport deeply vs. many superficially. |
| Mandatory account creation upfront | "We need user data immediately" | 64% of users drop off during signup flows. 27% abandon forms that feel too long. Creates friction before demonstrating value. | Allow users to complete questionnaire and see plan preview without account. Require signup only when they want to start training (after paywall conversion). |
| Complex customization options | "Let users tweak every workout detail" | Overwhelms beginners, undermines "AI coach" positioning, creates decision fatigue. Users want plans, not homework. | Offer simple adjustments (reschedule, mark as completed, skip if injured) but keep core plan AI-controlled. Trust the coach. |

## Feature Dependencies

```
[Onboarding Questionnaire]
    └──generates──> [Personalized Training Plan]
                        └──requires──> [Weekly Schedule View]
                                           └──requires──> [Workout Details]

[Plan Preview (read-only)]
    └──leads to──> [Subscription Paywall]
                      └──unlocks──> [Full Plan Access]
                                       └──enables──> [Progress Tracking]
                                       └──enables──> [Wearable Integration]
                                       └──enables──> [AI Plan Adaptation]

[Profile Management] ──updates──> [Personalized Training Plan] (triggers regeneration)

[Wearable Integration] ──feeds data to──> [AI Performance Insights]
                                             └──informs──> [AI Plan Adaptation]

[Subscription Payment (Stripe)] ──unlocks──> [Full Plan Access]
```

### Dependency Notes

- **Onboarding Questionnaire must come first:** Cannot generate personalized plan without fitness level, goals, schedule availability, injury history.
- **Plan Preview before Paywall:** RUNLINE's key differentiator is showing complete plan before asking for payment. Plan generation must work for non-paying users.
- **Subscription unlocks full experience:** Free trial (7 days) then hard paywall. No freemium tier.
- **Profile changes trigger plan updates:** If user changes goal (e.g., 10K → Half Marathon) or injury status, plan must regenerate with "monthly adaptation" logic.
- **Wearable integration is post-payment:** Don't sync with Garmin/Strava until user commits to subscription (reduces API costs for trial users who don't convert).
- **AI adaptation requires performance data:** Can't adapt plans without workout completion data, hence dependency on tracking integration.

## Onboarding Flow Architecture

Based on research of top apps (Runna, Nike Run Club, Strava) and best practices:

### Phase 1: Immediate Hook (Pre-Signup)
- **Welcome screen:** "Get your personalized AI running plan in 2 minutes"
- **Value proposition:** "See your complete training plan before paying"
- **CTA:** "Start questionnaire" (NO account creation yet)
- **Goal:** Get users invested before friction

### Phase 2: 9-Step Questionnaire
Questions based on industry patterns (Runna has 26 steps, but 9 is optimal for conversion):

1. **Primary goal:** Race distance (5K, 10K, Half Marathon, Marathon, Just improve fitness)
2. **Target race date:** Date picker (if racing) or "No specific date"
3. **Current fitness level:** Beginner / Intermediate / Advanced (with definitions)
4. **Weekly running frequency:** How many days can you run? (2-6 days/week)
5. **Long run day preference:** Which day works for long runs? (Usually Saturday/Sunday)
6. **Recent running volume:** Average km/week in past month
7. **Injury history:** Any current injuries or recurring issues? (Affects intensity progression)
8. **Schedule constraints:** Work schedule, family commitments (for flexible rescheduling feature)
9. **Preferred run times:** Morning / Lunch / Evening (for notifications)

**Design notes:**
- Progress indicator (Step X of 9)
- Conditional logic (skip race date if "just improve fitness")
- Save progress locally (browser storage) in case user drops off
- 5-8 minutes to complete (Runna's 26 steps takes ~10 min, but causes drop-off)

### Phase 3: Plan Generation & Preview
- **Loading screen:** "AI is creating your personalized plan..." (15-30 seconds for API call)
- **Plan preview (read-only):**
  - Weekly calendar view showing 4-8 weeks of training
  - Drill into specific workouts to see details
  - Key stats: Total weeks, workouts per week, peak volume, estimated race time
  - **Value reinforcement:** "This plan adapts monthly based on your progress"
- **Pricing preview card (visible but not blocking):**
  - "Unlock your plan: €20/month or €120/year (save 50%)"
  - "First 7 days free, cancel anytime"
  - Breakdown: "Only €2.77/week for personal coaching"

**Goal:** Let users explore their specific plan, build commitment through preview, understand pricing with no surprises.

### Phase 4: Subscription Paywall
- **CTA:** "Start your free trial" (on plan preview screen)
- **Paywall screen:**
  - Annual plan (highlighted): €120/year "SAVE 50%" → €2.31/week
  - Monthly plan: €20/month → €4.62/week
  - "7 days free, then €X/month, cancel anytime"
  - Payment via Stripe (Apple Pay, Google Pay, credit card)
  - Clear benefits: Full plan access, AI adaptation, performance insights, wearable sync
- **Trust signals:** "15,000+ runners trust RUNLINE" / "Cancel in 2 clicks"

**Note:** Longer trials (17-32 days) achieve 46% conversion vs. 7 days. Consider 14-day trial as A/B test after launch.

### Phase 5: Account Creation (Post-Payment)
- **Timing:** AFTER subscription payment confirmed
- **Minimal friction:** Email + password (or social login)
- **Why delayed?**
  - 64% drop-off during signup flows if done upfront
  - Users have already paid, so conversion is secured
  - Creates positive first impression (value before friction)
- **Immediate onboarding:** "Your plan is ready! Let's connect your watch to start training."

### Phase 6: Wearable Integration (Optional but Encouraged)
- **Connect Garmin / Apple Watch / Strava:** One-click OAuth flows
- **Value:** "Sync your runs automatically - we'll adapt your plan based on performance"
- **Skip option:** "I'll add this later" (some users want to explore first)

### Total Time: Questionnaire (5-8 min) + Preview (2-3 min) + Payment (1-2 min) = 8-13 minutes to first value

## Plan Display Patterns

Based on research of Runna, Hal Higdon, Nike Run Club interfaces:

### Weekly Calendar View (Primary Interface)
- **Grid layout:** 7 columns (Mon-Sun), scrollable by week
- **Workout cards:**
  - Color-coded by type (easy run = blue, tempo = orange, intervals = red, rest = gray, long run = purple)
  - Distance + estimated time shown on card
  - Completion checkbox (✓ when synced from wearable)
- **Drag-and-drop rescheduling:** Move workouts within same week or to next week
- **Week summary stats:** Total km, elevation gain, estimated time commitment

### Monthly Overview (Secondary View)
- **Calendar month grid:** Shows all workouts across 4 weeks
- **Visual density:** Mini workout indicators, color patterns visible at glance
- **Goal:** See training progression over time, identify recovery weeks

### Workout Detail View (Drill-Down)
When user taps a workout card:
- **Workout type:** "Easy Run" / "Tempo Run" / "Interval Session" / "Long Run"
- **Target metrics:** Distance (km), Target pace range, Estimated duration
- **Instructions:** AI-generated coaching notes ("Keep this conversational pace, you should be able to talk easily")
- **Warmup/cooldown:** If applicable (e.g., intervals include 10 min warmup)
- **Post-workout:** After completion, shows actual vs. target, performance insights

### List View (Alternative)
- **For users who prefer linear view:** Workouts in chronological list
- **Filters:** Upcoming / Completed / This week / This month
- **Search:** Find specific workout types

### Best Practices (From Research)
- **Runna pattern:** Drag-and-drop workouts to reschedule, automatic week rebalancing
- **Hal Higdon pattern:** Clear progress tracking with stats, charts, summaries
- **Nike Run Club pattern:** Guided workouts with pre-recorded coaching tips
- **RUNLINE approach:** Combine calendar view (visual planning) + AI coaching notes (guidance) + flexible rescheduling (life happens)

## Profile Management Structure

Based on UX research and fitness app patterns:

### Profile Settings Categories

**1. Personal Information**
- Name, age, gender
- Current weight (affects pace calculations)
- Height (optional, for BMI-based recommendations)
- Location/timezone (for local race suggestions, notification timing)

**2. Training Preferences**
- Current fitness level (can update as they improve)
- Preferred run times (morning/lunch/evening)
- Long run day preference
- Weekly availability (days/week)

**3. Goals & Plans**
- Current active plan (with option to modify goal)
- Race history (completed races)
- Upcoming races (update target race date)
- **Critical:** "Change my goal" triggers plan regeneration

**4. Health & Injuries**
- Injury status (current injuries pause/modify plan)
- Injury history (informs plan generation)
- Medical notes (e.g., "Heart condition - avoid high intensity")

**5. Integrations**
- Connected wearables (Garmin, Apple Watch, Strava)
- Sync status and last sync time
- Add/remove integrations

**6. Subscription & Billing**
- Current plan (Annual/Monthly)
- Next billing date
- Payment method (manage via Stripe portal)
- Cancel subscription (2-click process with exit survey)

**7. Notifications**
- Workout reminders (time of day)
- Progress updates (weekly summary)
- Plan adaptation alerts ("Your plan updated based on performance")
- Marketing emails (opt-in/out)

**8. App Settings**
- Language (French/English)
- Units (metric/imperial - default metric for France)
- Dark mode toggle
- Data & privacy settings

### Profile Edit Triggers Plan Updates
- **Change goal/race date:** Regenerates full plan with new target
- **Update fitness level:** Adjusts workout intensities
- **Report injury:** Reduces intensity, adds recovery time
- **Change availability:** Redistributes workouts across available days

**Design principle:** Make editing easy (avoid "Are you sure?" overload) but show clear preview of plan changes before applying.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate "AI running coach with value-first approach."

- [x] **9-step onboarding questionnaire** — Core to personalization
- [x] **AI plan generation** — The product's main value
- [x] **Plan preview (read-only)** — RUNLINE's differentiator vs. competitors
- [x] **Subscription paywall (Stripe)** — Monetization (annual/monthly)
- [x] **7-day free trial** — Standard acquisition model (no credit card required)
- [x] **Weekly calendar view** — How users interact with their plan
- [x] **Workout detail view** — Show specific workout instructions
- [x] **Basic profile management** — Edit personal info, goals, preferences
- [x] **Account creation (post-payment)** — Email/password signup after conversion
- [x] **Manual workout completion** — Checkbox to mark workouts done (before wearable sync)

**Why these 10 features:**
- Features 1-4: Complete the conversion funnel (questionnaire → preview → paywall → payment)
- Features 5-7: Deliver core training plan experience (calendar, workouts, completion tracking)
- Features 8-9: Essential account management
- Feature 10: MVP tracking before complex integrations

**What's intentionally missing from MVP:**
- Wearable integration (add in v1.1 after validating conversion)
- AI plan adaptation (add in v1.2 after collecting performance data)
- Audio coaching (add in v1.3 as retention feature)
- Strength/mobility add-ons (v2.0+ feature)

### Add After Validation (v1.x)

Features to add once core is working and conversion metrics are positive.

- [x] **Wearable integration (Apple Health, Garmin, Strava)** — Trigger: When manual tracking becomes friction point (likely week 2-3 of user journey)
- [x] **AI plan adaptation (monthly)** — Trigger: After 1 month of user data collected (need performance trends to adapt)
- [x] **Workout rescheduling (drag-and-drop)** — Trigger: User requests for flexibility (probably top support request)
- [x] **AI performance insights** — Trigger: Once wearable data flowing, add feedback loop
- [x] **Audio coaching cues** — Trigger: When retention data shows users want in-run guidance
- [x] **Notification system** — Trigger: When engagement drops, add reminder prompts
- [x] **French language optimization** — Trigger: Immediate if targeting French market (may promote to v1 if research shows critical)

**Priority order:**
1. **Wearable integration (v1.1)** — Biggest friction remover, enables future features
2. **AI plan adaptation (v1.2)** — Delivers on core promise "plans that adapt monthly"
3. **Workout rescheduling (v1.3)** — Quality of life, reduces churn
4. **Performance insights + Audio coaching (v1.4)** — Retention features

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [x] **Multi-goal training support** — Defer: Complexity high, niche use case (advanced runners only)
- [x] **Strength & mobility library** — Defer: Scope expansion, validate running-only first
- [x] **Community features (lite)** — Defer: Social features are nice-to-have, not core value
- [x] **Nutrition guidance** — Defer: Crowded space, better to integrate with existing tools
- [x] **Custom plan editor** — Defer: Undermines "AI coach" positioning, adds complexity
- [x] **Race finder/recommendations** — Defer: Useful but not essential for training
- [x] **Training analytics dashboard** — Defer: Data nerds love this, but minority of users
- [x] **Coaching messaging/support** — Defer: High support cost, test demand first

**Deferral rationale:** These features are valuable but not essential for proving core hypothesis ("value-first AI running plans convert better in French market"). Add based on user feedback and retention data.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Onboarding questionnaire | HIGH | MEDIUM | P1 |
| AI plan generation | HIGH | HIGH | P1 |
| Plan preview (read-only) | HIGH | LOW | P1 |
| Subscription paywall (Stripe) | HIGH | MEDIUM | P1 |
| Weekly calendar view | HIGH | MEDIUM | P1 |
| Workout detail view | HIGH | LOW | P1 |
| Manual workout completion | MEDIUM | LOW | P1 |
| Basic profile management | MEDIUM | LOW | P1 |
| Account creation | MEDIUM | LOW | P1 |
| Free trial (7 days) | HIGH | MEDIUM | P1 |
| Wearable integration | HIGH | HIGH | P2 |
| AI plan adaptation | HIGH | HIGH | P2 |
| Workout rescheduling | MEDIUM | MEDIUM | P2 |
| AI performance insights | MEDIUM | HIGH | P2 |
| Audio coaching cues | MEDIUM | MEDIUM | P2 |
| Notification system | MEDIUM | LOW | P2 |
| French language optimization | HIGH (for target market) | MEDIUM | P2 (or P1) |
| Multi-goal training | LOW | HIGH | P3 |
| Strength & mobility | MEDIUM | MEDIUM | P3 |
| Community features | LOW | MEDIUM | P3 |
| Nutrition guidance | LOW | LOW | P3 |
| Custom plan editor | LOW | HIGH | P3 |
| Race finder | LOW | MEDIUM | P3 |
| Analytics dashboard | LOW | MEDIUM | P3 |

**Priority key:**
- **P1:** Must have for launch (MVP)
- **P2:** Should have post-launch (v1.1-1.4)
- **P3:** Nice to have, future consideration (v2+)

**Trade-off notes:**
- **French language:** Listed as P2 but may need to promote to P1 if research confirms French market requires native experience from day 1
- **Wearable integration:** P2 because MVP can launch with manual tracking, but high priority for v1.1 (4-6 weeks post-launch)
- **AI adaptation:** The core promise but requires user data first, so P2 (need 1 month of workouts before adaptation is meaningful)

## Competitor Feature Analysis

| Feature | Runna | Strava Training | Nike Run Club | RUNLINE Approach |
|---------|-------|-----------------|---------------|------------------|
| **Onboarding questionnaire** | 26 steps (very detailed) | Minimal (assumes existing Strava data) | Short (5-7 questions) | 9 steps (balanced - enough for personalization, not overwhelming) |
| **Plan preview before paywall** | ❌ Paywall after quiz | N/A (freemium model) | ✅ Free guided runs, limited plans | ✅ Full plan preview before payment (differentiator) |
| **Pricing transparency** | ✅ Clear (€20/month) | ✅ Clear ($79.99/year premium) | ✅ Free (Nike strategy) | ✅ Shown during onboarding + pricing preview page |
| **Free trial** | ✅ 7 days | ✅ 30 days for premium | N/A (free app) | ✅ 7 days (may test 14 days for conversion) |
| **AI plan adaptation** | ✅ Weekly adaptation | ❌ Static plans | ❌ Pre-set plans | ✅ Monthly adaptation (core value) |
| **Wearable integration** | ✅ Garmin, Apple, Strava | ✅ Native (Strava is platform) | ✅ Apple Watch | ✅ Garmin, Apple, Strava (post-MVP) |
| **Weekly calendar view** | ✅ Drag-and-drop | ✅ Activity feed | ✅ Workout list | ✅ Calendar + drag-and-drop |
| **Audio coaching** | ✅ Real-time cues | ❌ (social focus) | ✅ Guided runs | ✅ (v1.4 feature) |
| **Social features** | Minimal (focus on training) | ✅✅✅ Core feature | ✅ Challenges, clubs | Minimal (avoid competing with Strava) |
| **Strength training** | ✅ Strength, Pilates, mobility | ❌ | ✅ Pre-recorded videos | Defer to v2+ |
| **Performance insights** | ✅ AI-generated feedback | ✅ Stats analysis | Basic stats | ✅ AI insights (v1.4) |
| **Multi-goal training** | ❌ Single goal | ❌ | ❌ | Defer to v2+ |
| **Account creation timing** | Upfront (after quiz) | Requires Strava account | Optional (guest mode) | Post-payment (after preview) |
| **French market focus** | ❌ English-first | ❌ English-first | ❌ English-first | ✅ French-first (differentiator) |

**RUNLINE's Competitive Position:**

**1. Value-First Positioning**
- Runna shows paywall immediately after quiz (no plan preview)
- RUNLINE shows complete plan before asking for payment
- **Advantage:** Transparency builds trust, increases trial-to-paid conversion (target 40-70% vs. freemium's 2-5%)

**2. French Market Focus**
- All major competitors are English-first, global apps
- RUNLINE is French-first with local cultural understanding
- **Advantage:** Underserved market, reduced competition, localized value

**3. Simplified Feature Set**
- Runna has 26-step onboarding (too long, causes drop-off)
- Nike Run Club is free but lacks personalization depth
- Strava is social-first, not training-focused
- **Advantage:** RUNLINE balances personalization (9 steps) with simplicity (focused on training, not social)

**4. Monthly Adaptation Cadence**
- Runna adapts weekly (may feel aggressive)
- RUNLINE adapts monthly (stable but responsive)
- **Advantage:** Gives users time to settle into plan, reduces decision fatigue, aligns with typical race training cycles

**Where RUNLINE Lags (Intentionally):**
- **Social features:** Can't compete with Strava's network effects → Integrate instead
- **GPS tracking:** Complex battery/offline challenges → Integrate with existing wearables
- **Strength training:** Crowded space → Defer to v2+ after validating core running value

## Implementation Complexity Notes

### HIGH Complexity Features
**AI Plan Generation**
- Requires training plan algorithms (rule-based or ML model)
- Consider workout progressions, periodization, taper phases
- Account for fitness level, goal race pace, available days
- Edge cases: Injury modifications, race date too soon/far, unrealistic goals
- **Recommendation:** Start with rule-based system (faster to build), migrate to ML later as data accumulates

**AI Plan Adaptation**
- Needs performance data analysis (pace trends, workout completion rate, missed workouts)
- Decision logic: When to increase intensity, when to add recovery, when to adjust goal
- **Challenge:** Requires 2-4 weeks of data before meaningful adaptation
- **Recommendation:** Launch without adaptation (v1), add in v1.2 after collecting user data

**Wearable Integration**
- Multiple SDKs: Garmin Connect API, Apple HealthKit, Strava API v3
- OAuth flows for each platform
- Data sync logic (handle duplicates, offline syncs, conflicting data)
- Rate limits and API costs
- **Recommendation:** Start with Strava API (easiest), add Apple Health (iOS users), then Garmin (serious runners)

**AI Performance Insights**
- Parse workout data (GPS tracks, heart rate, pace variability)
- Generate natural language feedback ("Your pace was more consistent this week - great progress!")
- Requires ML or NLP for quality insights
- **Recommendation:** Defer to v1.4, focus on plan quality first

### MEDIUM Complexity Features
**Onboarding Questionnaire**
- Multi-step form with conditional logic
- Data validation (realistic race dates, sensible weekly km)
- Progress saving (local storage if user drops off)
- **Challenge:** Balance detail (for personalization) vs. brevity (for conversion)
- **Recommendation:** 9 steps, skip logic (e.g., race date only if racing), ~5-8 min completion time

**Subscription Paywall (Stripe)**
- Stripe Checkout integration (simpler than custom payment form)
- Webhook handling for subscription events (created, renewed, canceled)
- Trial period logic (7 days free, then charge)
- Annual vs. monthly plans
- **Challenge:** Handling edge cases (payment fails, user cancels mid-trial, refund requests)
- **Recommendation:** Use Stripe Billing portal for subscription management (reduces custom UI needs)

**Weekly Calendar View**
- Calendar grid component (7 columns, scrollable weeks)
- Workout cards with color coding
- Drag-and-drop interaction (if rescheduling feature)
- **Challenge:** Mobile touch interactions, responsive design
- **Recommendation:** Use calendar library (e.g., React Big Calendar for web, custom component for mobile)

**Workout Rescheduling**
- Drag-and-drop UI
- Plan rebalancing logic (ensure recovery days, maintain training load)
- Sync with plan adaptation system
- **Challenge:** Complex state management, UX for "invalid" reschedules (e.g., back-to-back hard workouts)
- **Recommendation:** v1.3 feature, start with simple "move workout to different day" before advanced rebalancing

**Audio Coaching**
- Audio file generation/storage
- GPS tracking integration (trigger cues at specific distances/times)
- Pace calculation in real-time
- **Challenge:** Battery usage, background app permissions, offline support
- **Recommendation:** v1.4 feature, significant mobile development effort

### LOW Complexity Features
**Plan Preview (Read-Only)**
- Display generated plan in calendar view
- No edit permissions, just viewing
- **Challenge:** Minimal - reuse calendar component from full app
- **Recommendation:** MVP feature, quick win for conversion

**Workout Detail View**
- Drill-down screen for individual workouts
- Show distance, target pace, instructions, warmup/cooldown
- **Challenge:** Minimal - standard detail screen
- **Recommendation:** MVP feature, essential for plan usability

**Manual Workout Completion**
- Checkbox or button to mark workout as done
- Update progress stats
- **Challenge:** Minimal - basic CRUD operation
- **Recommendation:** MVP feature before wearable sync is ready

**Basic Profile Management**
- Forms for editing personal info, goals, preferences
- Trigger plan regeneration if goal/fitness level changes
- **Challenge:** Form validation, state management
- **Recommendation:** MVP feature, hygiene factor

**Notification System**
- Push notifications for workout reminders, weekly summaries
- **Challenge:** Platform-specific (iOS/Android push, web notifications)
- **Recommendation:** v1.3-1.4 feature, use service like Firebase Cloud Messaging

## Feature Development Dependencies

Critical sequencing for phase planning:

**Phase 1: Core Conversion Funnel**
1. Onboarding questionnaire (collects user data)
2. AI plan generation (creates personalized plan)
3. Plan preview display (shows value)
4. Subscription paywall (Stripe integration)
5. Account creation (captures user after payment)

**Must complete in order:** Can't generate plan without questionnaire data. Can't show preview without generated plan. Can't collect payment without preview to convert user. Can't create account without payment confirmation.

**Phase 2: Training Plan Experience**
1. Weekly calendar view (plan display)
2. Workout detail view (drill-down)
3. Manual workout completion (basic tracking)
4. Basic profile management (edit goals/info)

**Depends on Phase 1:** Requires generated plan to display. Account system must exist for profile management.

**Phase 3: Integration & Automation**
1. Wearable integration (auto-sync workouts)
2. Replaces manual completion (Phase 2 feature)

**Depends on Phase 2:** Needs workout completion system to integrate with. User must have active plan.

**Phase 4: Adaptation & Intelligence**
1. AI plan adaptation (monthly updates)
2. AI performance insights (post-workout feedback)

**Depends on Phase 3:** Requires performance data from wearable integration. Need 2-4 weeks of workout data before adaptation is meaningful.

**Phase 5: Retention Features**
1. Workout rescheduling (drag-and-drop)
2. Audio coaching cues
3. Notification system

**Depends on Phase 2-3:** Needs calendar view (rescheduling), wearable integration (audio coaching triggers), engagement data (notification timing).

**Key Insight for Roadmap:**
- Phases 1-2 are MVP (can launch after these)
- Phases 3-5 are post-launch iterations (add every 3-4 weeks based on user feedback)
- Don't start Phase 4 until Phase 3 has collected data (2-4 week lag)

## Sources

### Running App Features & Comparisons
- [The Race for the Best Running App is On - Strava x Runna](https://neoads.substack.com/p/best-running-app)
- [Nike Run Club vs Runna Premium Features 2025 Breakdown](https://mostly.media/nike-run-club-vs-runna-which-running-app-delivers-real-value-in-2025/)
- [The Best Running Apps of 2026: A Comprehensive Guide](https://www.livefortheoutdoors.com/trail-running/accessories/best-running-apps/)
- [The 5 Best Running Apps in 2026 (Honest Comparison)](https://www.vimafitness.com/blog/best-running-apps-2026/)
- [Runna: Running Plans & Coach](https://www.runna.com/)
- [TrainAsONE | The AI Running App](https://trainasone.com/)
- [Official Hal Higdon App - Custom and Adaptable Training Plans](https://www.halhigdon.com/apps/)

### Onboarding Best Practices
- [The Ultimate Mobile App Onboarding Guide (2026) | VWO](https://vwo.com/blog/mobile-app-onboarding-guide/)
- [17 Best Onboarding Flow Examples for New Users (2026)](https://whatfix.com/blog/user-onboarding-examples/)
- [The Best App Onboarding Examples & Best Practices to Engage Users](https://www.purchasely.com/blog/app-onboarding)
- [Mobile Onboarding UX: 11 Best Practices for Retention (2026)](https://www.designstudiouiux.com/blog/mobile-app-onboarding-best-practices/)

### Subscription Paywall Strategies
- [Top Fitness App Paywalls (UX Patterns + Pricing Insights)](https://dev.to/paywallpro/top-fitness-app-paywalls-ux-patterns-pricing-insights-2868)
- [How Top Fitness Apps Price & Convert: Insights from 1,200 Paywalls](https://dev.to/paywallpro/how-top-fitness-apps-price-convert-insights-from-1200-paywalls-2p1d)
- [State of Subscription Apps 2025 – RevenueCat](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [What the best subscription apps get right about paywalls](https://www.revenuecat.com/blog/growth/how-top-apps-approach-paywalls/)
- [10 Types of Paywalls for Mobile Apps and Examples](https://adapty.io/blog/the-10-types-of-mobile-app-paywalls/)

### Signup Flow Timing
- [The Ultimate Guide to SaaS Signup Flow UX](https://userpilot.com/blog/saas-signup-flow/)
- [Best Sign Up Flows (2025): 15 UX Examples That Convert](https://www.eleken.co/blog-posts/sign-up-flow)
- [Sign-up Flows and Friction: Analyzing 3 Examples to Design the Perfect One](https://cxl.com/blog/saas-signup-flows/)

### Runna App Specifics
- [Runna: Running Plans & Coach | ScreensDesign](https://screensdesign.com/showcase/runna-running-training-plans)
- [Runna Running Training Plans App Onboarding Flow](https://gallery.reteno.com/flows/app-screens-runna)
- [Runna Coaching App Review - The Runner Beans](https://therunnerbeans.com/runna-coaching-app-review/)

### Training Plan Display & Calendar UI
- [How to Use Your Training Calendar | Runna Support](https://support.runna.com/en/articles/10137793-how-to-use-and-manage-your-training-calendar)
- [Calendar UI Examples: 33 Inspiring Designs [+ UX Tips]](https://www.eleken.co/blog-posts/calendar-ui)

### Fitness Questionnaire Design
- [How to Write the Perfect Initial Client Questionnaire](https://www.trainerize.com/blog/how-to-write-the-perfect-initial-client-questionnaire/)
- [32 Fitness Survey Questions: Examples & Best Practices for Insights](https://heysurvey.io/examples/fitness-survey-questions)
- [The Ultimate Guide to Writing the Perfect Onboarding Questionnaire for Personal Trainers](https://www.fitbudd.com/post/the-ultimate-guide-to-writing-the-perfect-onboarding-questionnaire-for-personal-trainers)

### UX Mistakes & Anti-Patterns
- [12 Bad UX Examples: Learn from Criticized Apps [Expert Analysis]](https://www.eleken.co/blog-posts/bad-ux-examples)
- [7 UI Pitfalls Mobile App Developers Should Avoid in 2026](https://www.webpronews.com/7-ui-pitfalls-mobile-app-developers-should-avoid-in-2026/)
- [13 UX Design Mistakes You Should Avoid in 2026](https://www.wearetenet.com/blog/ux-design-mistakes)
- [Mobile App UX: The 7 Biggest Mistakes First-Time Founders Make](https://mindsea.com/blog/mobile-app-ux-mistakes/)

### Profile Management
- [Designing profile, account, and setting pages for better UX | Medium](https://medium.com/design-bootcamp/designing-profile-account-and-setting-pages-for-better-ux-345ef4ca1490)

---
*Feature research for: RUNLINE - AI running coach for French market*
*Researched: 2026-01-25*
*Confidence: HIGH (verified with multiple authoritative sources, competitor analysis, 2026 industry data)*
