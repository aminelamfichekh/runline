# Roadmap: RUNLINE

## Overview

RUNLINE launches through four phases: build the value-first onboarding flow that converts runners into subscribers, deliver the core AI training plan generation and display system, create the retention layer with dashboard and profile management, and deploy to production on App Store and Google Play. This roadmap takes an existing Laravel backend and broken React Native frontend to a polished, production-ready AI running coach app for the French market.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: User Acquisition** - Anonymous questionnaire to paid subscriber flow
- [ ] **Phase 2: AI Plan Delivery** - Generate and display personalized training plans
- [ ] **Phase 3: User Retention** - Dashboard, profile management, and legal compliance
- [ ] **Phase 4: Production Launch** - Deploy to App Store and Google Play

## Phase Details

### Phase 1: User Acquisition
**Goal**: Users complete anonymous questionnaire, see personalized plan preview, and subscribe via Stripe
**Depends on**: Nothing (first phase)
**Requirements**: ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-04, ONBOARD-05, ONBOARD-06, ONBOARD-07, ONBOARD-08, AUTH-01, AUTH-02, AUTH-03, AUTH-05, SUB-01, SUB-02, SUB-03, SUB-06
**Success Criteria** (what must be TRUE):
  1. User completes 9-step French questionnaire with wheel pickers without creating account
  2. User navigates back/forward through questionnaire without losing data
  3. User sees personalized plan preview and pricing after questionnaire
  4. User creates account after seeing value and subscribes via Stripe
  5. Anonymous session data transfers to user account on signup
  6. Subscription payment works on both iOS and Android
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Complete 9-step questionnaire with wheel pickers, i18n, and state persistence
- [x] 01-02-PLAN.md — JWT authentication with secure storage and anonymous session transfer
- [x] 01-03-PLAN.md — Stripe subscription flow with PaymentSheet and webhook handling

### Phase 2: AI Plan Delivery
**Goal**: Users receive AI-generated training plans that start first Monday after signup and auto-regenerate monthly
**Depends on**: Phase 1 (requires authenticated, subscribed users)
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-05, PLAN-06, PLAN-07, PLAN-08, PLAN-09, DISPLAY-01, DISPLAY-02, DISPLAY-03, DISPLAY-04, DISPLAY-05, DISPLAY-06
**Success Criteria** (what must be TRUE):
  1. Initial plan generates automatically after subscription payment
  2. Initial plan starts first Monday after signup and extends to Sunday before next month's first Monday
  3. Plan generation runs asynchronously with push notification when ready
  4. User can view current plan with weekly breakdown and daily workouts in French
  5. User can view plan history for all previous months
  6. Monthly regeneration runs automatically every first Monday using user history
  7. Failed plan generation retries automatically (3 attempts)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Backend OpenAI structured outputs, webhook trigger, and monthly cron
- [ ] 02-02-PLAN.md — Expo Push notifications (replace Firebase) with frontend token registration
- [ ] 02-03-PLAN.md — Frontend API wiring for plan display with loading states

### Phase 3: User Retention
**Goal**: Users stay engaged with dashboard home page, manage their profile, and access required legal pages
**Depends on**: Phase 2 (requires plans to display on dashboard)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, AUTH-04, SUB-04, SUB-05, LEGAL-01, LEGAL-02, LEGAL-03, LEGAL-04
**Success Criteria** (what must be TRUE):
  1. Home page shows current week's training overview and user's running goal
  2. Dashboard accessible immediately after login with smooth navigation to plans and profile
  3. User can view and edit profile information (questionnaire responses, personal records)
  4. Profile changes trigger plan regeneration prompt (user decides whether to regenerate)
  5. User can view subscription status and cancel subscription from profile
  6. All legal pages (CGV, mentions legales, politique de confidentialite) accessible in French
**Plans**: TBD (1-3 plans)

Plans:
- [ ] TBD

### Phase 4: Production Launch
**Goal**: RUNLINE deployed to production with App Store and Google Play approval
**Depends on**: Phase 3 (requires complete app functionality)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, DEPLOY-07
**Success Criteria** (what must be TRUE):
  1. iOS app submitted to App Store and approved for production
  2. Android app submitted to Google Play and approved for production
  3. Backend deployed to production environment with OpenAI and Stripe production keys
  4. Push notifications working via Expo Push in production
  5. Cron job for monthly regeneration running reliably in production
**Plans**: TBD (1-2 plans)

Plans:
- [ ] TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. User Acquisition | 3/3 | Complete | 2026-01-26 |
| 2. AI Plan Delivery | 0/3 | Ready | - |
| 3. User Retention | 0/TBD | Not started | - |
| 4. Production Launch | 0/TBD | Not started | - |
