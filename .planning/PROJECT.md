# RUNLINE

## What This Is

RUNLINE is an AI-powered running coach mobile app for the French market. Runners complete a personalized questionnaire anonymously, see a preview of their training plan, subscribe via Stripe, and receive AI-generated monthly training plans that automatically regenerate every first Monday of each month.

## Core Value

Runners get personalized AI training plans that adapt monthly to their progress, with a value-first approach where they see exactly what they'll get before paying.

## Requirements

### Validated

<!-- Existing infrastructure from codebase -->

- ✓ Laravel 12 backend API with JWT authentication — existing
- ✓ React Native/Expo mobile app (iOS + Android support) — existing
- ✓ OpenAI PHP client integrated (prompts ready for plan generation) — existing
- ✓ Stripe PHP SDK integrated (webhook handling implemented) — existing
- ✓ User authentication system (register, login, JWT tokens, refresh) — existing
- ✓ Anonymous questionnaire session system (UUID-based temporary storage) — existing
- ✓ User profile system with questionnaire data attachment — existing
- ✓ Plan generation infrastructure (async jobs via GeneratePlanJob) — existing
- ✓ Push notification system (Firebase device tokens, NotificationService) — existing
- ✓ Database models (User, UserProfile, Plan, Subscription, Payment, QuestionnaireSession) — existing

### Active

<!-- v1 launch requirements -->

- [ ] Modern onboarding questionnaire UI (9 steps, wheel pickers, dark theme, French)
- [ ] Questionnaire → pricing preview → account creation flow
- [ ] Stripe subscription payment flow (Checkout or Payment Sheet)
- [ ] AI plan generation execution (call OpenAI with user data, store plan)
- [ ] Initial plan generation (starts first Monday after signup)
- [ ] Monthly plan auto-regeneration (cron job, first Monday each month)
- [ ] Dashboard/home page (plan overview, weekly progress)
- [ ] "Mes Plans" page (current plan display, plan history)
- [ ] Profile page (view/edit questionnaire responses, personal records)
- [ ] Subscription management (view status, cancel subscription)
- [ ] Legal pages (CGV, mentions légales, politique de confidentialité)
- [ ] App Store deployment (iOS TestFlight → production)
- [ ] Google Play deployment (Android beta → production)

### Out of Scope

- Social features (sharing runs, leaderboards) — not core to v1 value
- Run tracking/GPS integration — focus on training plans, not run recording
- Integration with Strava/Garmin — defer to v2
- In-app messaging/coach chat — too complex for v1
- Multiple languages — French only for v1
- Web version — mobile-first, iOS/Android only

## Context

**Existing Codebase:**
- Laravel backend with service layer architecture (AuthService, ProfileService, PlanGeneratorService, PaymentService)
- React Native frontend with Expo Router for navigation
- Questionnaire session flow partially implemented but broken (data doesn't transfer properly to user account)
- Basic page scaffolding exists (home, plans, profile) but non-functional
- OpenAI prompts already written and ready ("Plan Initial" and "Mise à jour mensuelle")

**Design Approach:**
- Designs provided per phase before implementation
- Reference quality: Runna app level of polish
- Brand colors: Primary #318ce7 (vibrant blue), dark black with blue tints
- Modern native components, smooth animations, professional typography
- Dark theme by default

**Technical Environment:**
- Backend: PHP 8.2+, Laravel 12, MySQL/PostgreSQL, Redis (caching/queues)
- Frontend: React Native 0.81.5, Expo 54, TypeScript 5.1.3
- External services: OpenAI API, Stripe, Firebase (push notifications)

**Market Context:**
- French running community (all UI/content in French)
- Competing with Runna and similar AI coaching apps
- Value-first monetization (show plan preview before payment)

## Constraints

- **Language**: French only — all UI text, error messages, legal pages, notifications must be in French
- **Design quality**: Must match Runna-level polish — no web forms, no generic UI, modern native components required
- **Platforms**: iOS and Android native apps — no web version for v1
- **Payment**: Stripe only — subscription-based monetization
- **Tech stack**: Must use existing Laravel backend + React Native frontend (no framework changes)
- **Timeline**: Production launch — real users, App Store/Google Play approval required

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Value-first onboarding | Show plan preview before payment to increase conversion | — Pending |
| Anonymous sessions | Let users complete questionnaire without account, create account only when committing | — Pending |
| Subscription-only model | Recurring revenue, no freemium complexity | — Pending |
| Monthly auto-regeneration | Keep users engaged, plans adapt to progress, retention strategy | — Pending |
| Dark theme default | Modern aesthetic, matches Runna/fitness app trends | — Pending |
| Designs per phase | Allows iterative refinement, prevents upfront design bottleneck | — Pending |

---
*Last updated: 2026-01-24 after initialization*
