# Requirements: RUNLINE

**Defined:** 2026-01-25
**Core Value:** Runners get personalized AI training plans that adapt monthly to their progress, with a value-first approach where they see exactly what they'll get before paying.

## v1 Requirements

Requirements for production launch. Each maps to roadmap phases.

### Onboarding

- [ ] **ONBOARD-01**: User can complete 9-step questionnaire without creating account (anonymous session)
- [ ] **ONBOARD-02**: Questionnaire uses modern wheel pickers for age, weight, height, volume, experience
- [ ] **ONBOARD-03**: User can navigate back through questionnaire steps without losing data
- [ ] **ONBOARD-04**: Progress indicator shows current step (e.g., "2/9") throughout questionnaire
- [ ] **ONBOARD-05**: Conditional logic works (e.g., race goal questions only show if preparing for race)
- [ ] **ONBOARD-06**: User sees personalized plan preview after completing questionnaire
- [ ] **ONBOARD-07**: User sees subscription pricing after plan preview
- [ ] **ONBOARD-08**: All questionnaire text and labels are in French

### Authentication

- [ ] **AUTH-01**: User can create account with email and password after seeing value
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across app restarts (JWT token refresh)
- [ ] **AUTH-04**: User can log out from profile page
- [ ] **AUTH-05**: Anonymous questionnaire session transfers to user account on signup

### Subscription

- [ ] **SUB-01**: User can subscribe via Stripe Checkout or Payment Sheet
- [ ] **SUB-02**: Stripe webhook handles subscription events (payment success, cancellation, renewal)
- [ ] **SUB-03**: User cannot access AI plans without active subscription
- [ ] **SUB-04**: User can view subscription status in profile
- [ ] **SUB-05**: User can cancel subscription from profile
- [ ] **SUB-06**: Payment flow works on both iOS and Android

**⚠️ App Store Risk**: Using Stripe for digital subscriptions may violate Apple/Google policies requiring In-App Purchase. May need to pivot to IAP if rejected during review.

### AI Plan Generation

- [ ] **PLAN-01**: Initial plan generates automatically after subscription payment
- [ ] **PLAN-02**: Initial plan starts on first Monday after signup
- [ ] **PLAN-03**: Initial plan extends to Sunday before first Monday of next month
- [ ] **PLAN-04**: Plan generation uses OpenAI API with existing "Plan Initial" prompt
- [ ] **PLAN-05**: Plan generation runs asynchronously (non-blocking)
- [ ] **PLAN-06**: User receives push notification when plan is ready
- [ ] **PLAN-07**: Monthly regeneration runs automatically every first Monday
- [ ] **PLAN-08**: Monthly regeneration uses "Mise à jour mensuelle" prompt with user history
- [ ] **PLAN-09**: Failed plan generation retries automatically (3 attempts)

### Plan Display

- [ ] **DISPLAY-01**: User can view current training plan in "Mes Plans" page
- [ ] **DISPLAY-02**: Plan displays weekly breakdown with daily workouts
- [ ] **DISPLAY-03**: Plan shows in French (AI generates French content)
- [ ] **DISPLAY-04**: User can view plan history (all previous months)
- [ ] **DISPLAY-05**: Loading states show while plan is generating
- [ ] **DISPLAY-06**: User can scroll through multi-week plans smoothly (performance optimized)

### Dashboard

- [ ] **DASH-01**: Home page shows current week's training overview
- [ ] **DASH-02**: Home page displays user's running goal
- [ ] **DASH-03**: Dashboard is accessible immediately after login
- [ ] **DASH-04**: Navigation between home, plans, and profile works smoothly

### Profile

- [ ] **PROF-01**: User can view their profile information
- [ ] **PROF-02**: User can edit questionnaire responses (age, weight, goals, etc.)
- [ ] **PROF-03**: User can update personal records
- [ ] **PROF-04**: Profile changes trigger plan regeneration prompt (user decides)
- [ ] **PROF-05**: User can view subscription status and manage subscription

### Legal

- [ ] **LEGAL-01**: CGV (Conditions Générales de Vente) page accessible
- [ ] **LEGAL-02**: Mentions légales page accessible
- [ ] **LEGAL-03**: Politique de confidentialité page accessible
- [ ] **LEGAL-04**: All legal pages in French

### Deployment

- [ ] **DEPLOY-01**: iOS app submitted to App Store and approved
- [ ] **DEPLOY-02**: Android app submitted to Google Play and approved
- [ ] **DEPLOY-03**: Backend deployed to production environment
- [ ] **DEPLOY-04**: OpenAI API configured with production keys
- [ ] **DEPLOY-05**: Stripe configured for production (live keys, webhook endpoint)
- [ ] **DEPLOY-06**: Push notifications working (Firebase configured)
- [ ] **DEPLOY-07**: Cron job for monthly regeneration running reliably

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social Features

- **SOCIAL-01**: Share training achievements to social media
- **SOCIAL-02**: Connect with other RUNLINE runners
- **SOCIAL-03**: Leaderboards and challenges

### Run Tracking

- **TRACK-01**: GPS run tracking integration
- **TRACK-02**: Manual run entry
- **TRACK-03**: Sync with Strava/Garmin

### Enhanced AI

- **AI-01**: Chat with AI coach for questions
- **AI-02**: Adaptive plan adjustments mid-month based on performance
- **AI-03**: Injury prevention recommendations

### Internationalization

- **I18N-01**: Support for English language
- **I18N-02**: Support for Spanish language

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Web version | Mobile-first strategy, defer to v2+ |
| Nutrition tracking | Too broad for v1, focus on training plans only |
| Live coaching sessions | High operational cost, not scalable for v1 |
| Wearable device integration | Complex integrations, defer until proven demand |
| In-App Purchase for v1 | Using Stripe initially, may pivot to IAP if App Store requires it |
| Multiple languages in v1 | French market only to start, validate before expanding |
| Race registration integration | Not core to training plan value |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmapper) | | |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: (pending)
- Unmapped: (pending)

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-25 after initial definition*
