# Codebase Concerns

**Analysis Date:** 2026-01-24

## Tech Debt

### Direct Service Instantiation in AuthService

**Issue:** `AuthService.register()` directly instantiates controller and calls methods
- **Files:** `app/Services/AuthService.php` (lines 70-71)
- **Impact:** Violates separation of concerns. Services should not depend on controllers. Creates tight coupling and makes testing difficult. Could cause circular dependency issues.
- **Fix approach:** Extract session attachment logic into a dedicated service. Have controller call service method directly instead of AuthService calling controller.

### Hardcoded Console Debug Logging

**Issue:** Debug console.log statements left in production code
- **Files:**
  - `lib/api/client.ts` (lines 177-178)
  - `lib/utils/auth.ts` (lines 80, 81, 85, 91, 96-99, 102)
  - `app/index.tsx` (lines 13, 18, 22)
- **Impact:** Leaks sensitive debugging information in production. Console statements can degrade performance on low-end devices in mobile apps.
- **Fix approach:** Wrap debug logs in `__DEV__` checks or use a proper logger with environment-based levels. Remove production telemetry from auth flow.

### Missing Refresh Token Validation

**Issue:** Refresh tokens not validated against database
- **Files:** `app/Services/AuthService.php` (lines 187-204, comment line 187)
- **Impact:** Security risk. Compromised refresh tokens cannot be revoked. Any valid-looking JWT can refresh forever if secret is compromised. No way to force logout globally.
- **Fix approach:** Store refresh tokens in database with expiration. Validate against database before accepting refresh. Implement token revocation list.

### Unencrypted Token Storage on Web Platform

**Issue:** Tokens stored in localStorage without encryption (Web platform)
- **Files:** `lib/utils/auth.ts` (lines 82-84, 113-114)
- **Impact:** Vulnerable to XSS attacks that can steal tokens. localStorage is synchronous and blocks rendering. No protection against token theft via JavaScript injection.
- **Fix approach:** For web, store in httpOnly cookies (requires backend support). For React Native, current AsyncStorage usage is acceptable but ensure JAILBREAK_PROOF storage on native platforms.

### Insufficient Error Context in Token Refresh

**Issue:** Generic "Invalid refresh token" error doesn't distinguish between token expired, revoked, or malformed
- **Files:** `app/Services/AuthService.php` (line 203)
- **Impact:** Frontend cannot determine appropriate user action. Can't distinguish between "re-login needed" vs "try again" scenarios. Poor UX for rate limiting.
- **Fix approach:** Return specific error codes (e.g., 'token_expired', 'token_revoked', 'invalid_signature'). Frontend should handle each appropriately.

---

## Security Concerns

### Debug Mode Enabled in Production Config

**Issue:** APP_DEBUG defaulting to true in example config
- **Files:** `config/app.php` (line 42), `.env.example` (line 4)
- **Impact:** Stack traces and error details exposed to API clients. Database connection strings, file paths, and code structure visible to attackers.
- **Fix approach:** Ensure `.env` production file has `APP_DEBUG=false`. Add production deployment checklist. Document security hardening steps.

### Stripe Webhook Secret Stored in Environment

**Issue:** Webhook secret required but no validation that it's set
- **Files:** `app/Http/Controllers/Api/WebhookController.php` (lines 41-46)
- **Impact:** If webhook secret missing, endpoint returns 500 error publicly exposing the configuration issue. Partial mitigation exists (checks and logs) but could be more robust.
- **Fix approach:** Throw exception if webhook secret missing during service initialization. Add startup validation. Make webhook endpoint return 400 instead of 500 for missing config.

### User Profile Update Without Email Verification

**Issue:** Email can be changed without verification email
- **Files:** `app/Http/Controllers/Api/AuthController.php` (lines 227-271)
- **Impact:** Account takeover risk. User can change email without confirming they own the new email. No audit trail.
- **Fix approach:** Implement email verification flow. Require user to verify new email before it becomes active. Log email changes for audit.

### Session Payload Email Mismatch Warning Only

**Issue:** Session email mismatch logs warning but silently skips attachment, no user feedback
- **Files:** `app/Services/AuthService.php` (lines 58-67)
- **Impact:** User doesn't know their session wasn't attached. Creates silent data loss. Confusing UX - user completes questionnaire, logs in, profile is empty.
- **Fix approach:** Return warning to frontend with `success: true, warnings: ['session_mismatch']`. Frontend should alert user and offer re-attach option.

### Error Messages Expose System Details

**Issue:** Error responses include raw exception messages
- **Files:** `app/Http/Controllers/Api/AuthController.php` (lines 64, 268), multiple places
- **Impact:** Stack traces and SQL errors can be leaked to frontend revealing system architecture. Attackers can enumerate valid/invalid database operations.
- **Fix approach:** Log full error server-side. Return generic "An error occurred" to frontend in production. Use error codes instead of messages for client handling.

---

## Performance Bottlenecks

### Synchronous JWT Token Generation on Every Registration

**Issue:** JWTAuth::fromUser() called immediately during registration without async queueing
- **Files:** `app/Services/AuthService.php` (lines 103-106, 146-150)
- **Impact:** Blocks registration request. If JWT library is slow or external, user sees timeout. No way to generate tokens asynchronously.
- **Fix approach:** Profile JWT generation time. If >100ms, move to background job and return temporary token. Implement token generation caching.

### N+1 Query Risk in Profile Attachment

**Issue:** `profileService->getProfile()` called after attachment without query optimization
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (lines 184, 249-250)
- **Impact:** Multiple queries loading user, profile, and related relationships. When called in loop (batch processing) causes N+1 problem.
- **Fix approach:** Use eager loading (`with()`). Return profile data from `updateProfile()` directly instead of requerying.

### Database Transaction Without Timeout

**Issue:** `DB::transaction()` wraps multi-step operations without timeout configuration
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (lines 209, 423)
- **Impact:** Long-running transactions lock tables. If plan generation fails, transaction hangs. Can cause deadlocks in high-concurrency scenarios.
- **Fix approach:** Set transaction timeout. Split into smaller transactions. Move plan generation outside transaction (use job queue).

### Lazy-Loading User Relationships in Auth Check

**Issue:** `user->load('profile')` called after every authentication
- **Files:** `app/Http/Controllers/Api/AuthController.php` (line 180)
- **Impact:** Extra query on every `/me` endpoint call. Profile data could be cached or included in JWT.
- **Fix approach:** Cache profile data in JWT claims. Use eager loading in auth middleware to reduce queries.

### No Query Pagination for Questionnaire Data

**Issue:** All questionnaire sessions retrieved without pagination
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (no pagination in store/update methods)
- **Impact:** If thousands of sessions exist, queries slow down. No protection against loading entire table.
- **Fix approach:** Add pagination or limit to queries. Implement cursor-based pagination for large datasets.

---

## Fragile Areas

### Questionnaire Session State Management

**Issue:** Session can be in inconsistent states (partially filled, attached but not completed, completed but not attached)
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (entire controller)
- **Why fragile:** Multiple validation paths, email mismatch scenarios, transaction rollback scenarios all create ambiguous states. Hard to reason about valid state transitions.
- **Safe modification:** Document all valid state transitions. Add state machine. Add database constraints to enforce valid transitions (unique indexes, check constraints).
- **Test coverage:** Gaps in state transition testing. No tests for transaction rollback scenarios.

### PayloadService Dependency on External Cleaning Logic

**Issue:** Questionnaire payload validation split between controller validation and service methods
- **Files:** `app/Services/QuestionnairePayloadService.php` (called from controller), validation logic in controller
- **Why fragile:** Validation can be bypassed if service called directly. No single source of truth for "valid payload". Easy to forget to call cleaning methods.
- **Safe modification:** Move ALL validation into service constructor or dedicated validate() method. Make payload immutable after validation.
- **Test coverage:** Need to test all code paths through service directly, not just controller paths.

### Token Refresh Logic Queuing Race Condition

**Issue:** Multiple concurrent 401 responses can create race conditions in token refresh queue
- **Files:** `lib/api/client.ts` (lines 63-77)
- **Why fragile:** If two requests get 401 simultaneously, both might attempt refresh. `isRefreshing` flag is not atomic. Race condition between checking flag and setting it.
- **Safe modification:** Use locking mechanism or Promise-based singleton. Test with concurrent 401 responses.
- **Test coverage:** No test for concurrent request failures.

### Plan Generation Failure Silently Ignored

**Issue:** Plan generation exceptions caught and logged but don't inform user
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (lines 228-237, 442-451)
- **Why fragile:** User completes questionnaire, plan generation fails, user gets plan_generating status but plan never arrives. No way to retry.
- **Safe modification:** Create separate job retry mechanism. Return "plan_generation_failed" status. Add manual retry endpoint.
- **Test coverage:** No test for plan generation failure scenario.

### Environment Configuration File Hardcoded IP

**Issue:** Frontend API URL hardcoded with specific IP address in .env
- **Files:** `emrun-frontend/.env` (line 1: `http://192.168.110.171:8000/api`)
- **Why fragile:** Works only in specific network. Breaks on different network. Not suitable for deployment.
- **Safe modification:** Use config file pattern. Read from device network settings. Support dynamic API URL configuration.
- **Test coverage:** No test for API URL resolution.

---

## Known Limitations

### Missing Active Subscription Enforcement

**Issue:** No endpoint validation that user has active subscription before accessing plan endpoints
- **Files:** `app/Http/Controllers/Api/PlanController.php` (likely needs implementation)
- **Blocks:** Cannot enforce paywall. No way to restrict features to premium users.
- **Workaround:** Check subscription in middleware before plan endpoints. Implement manually for now.

### No Automatic Subscription Renewal Notifications

**Issue:** Payment failure doesn't trigger user notification
- **Files:** `app/Http/Controllers/Api/WebhookController.php` (handleInvoicePaymentFailed, lines 159-182)
- **Blocks:** Users don't know payment failed. Subscription just disappears silently.
- **Workaround:** Implement manual notification service call. Add email template for payment failures.

### Questionnaire Session Deletion Not Implemented

**Issue:** No endpoint to delete old/invalid questionnaire sessions
- **Files:** `app/Http/Controllers/Api/QuestionnaireSessionController.php` (no delete method)
- **Blocks:** Old sessions accumulate. Privacy concern - old session data persists.
- **Workaround:** Add manual database cleanup. Implement TTL for incomplete sessions (add 'expires_at' field).

### No Rate Limiting on Auth Endpoints

**Issue:** No rate limiting on registration, login, or token refresh
- **Files:** `routes/api.php` (routes defined without rate limit middleware)
- **Blocks:** Brute force attacks possible. Token refresh can be hammered.
- **Workaround:** Add `throttle:60,1` middleware to auth routes. Implement IP-based rate limiting.

---

## Test Coverage Gaps

### Missing Error Scenario Testing

**Area:** Authentication error cases
- **What's not tested:**
  - Registration with duplicate email
  - Login with wrong password
  - Token refresh with expired token
  - Token refresh with invalid signature
- **Files:** Likely `tests/Feature/AuthTest.php`
- **Risk:** Bugs in error handling go undetected. Error messages leak data.

### Missing Concurrency Testing

**Area:** Simultaneous requests
- **What's not tested:**
  - Multiple 401 errors triggering token refresh simultaneously
  - Concurrent session attachments
  - Concurrent profile updates
- **Files:** Need new concurrent test suite
- **Risk:** Race conditions in production with multiple active users.

### Missing Integration Testing

**Area:** Stripe webhook integration
- **What's not tested:**
  - Webhook signature verification failure
  - Missing webhook secret
  - Out-of-order webhook events
  - Duplicate webhook events
- **Files:** `WebhookController` has no test coverage visible
- **Risk:** Webhook-related bugs cause data inconsistency.

### Missing Frontend Network Error Testing

**Area:** API client resilience
- **What's not tested:**
  - Network timeout during token refresh
  - API server returning 500 during refresh
  - Token refresh loop failures
- **Files:** `lib/api/client.ts`
- **Risk:** App hangs or crashes on network issues.

---

## Dependency Version Concerns

### Outdated Expo Version

**Issue:** expo ~54.0.0 is multiple versions behind current
- **Files:** `emrun-frontend/package.json` (line 17)
- **Impact:** Missing bug fixes and security patches. Security vulnerabilities in dependencies.
- **Current status:** Likely depends on specific Expo API behavior that might change.

### React 19 in Mobile App

**Issue:** React 19.1.0 is very new with limited production history
- **Files:** `emrun-frontend/package.json` (line 22)
- **Impact:** Potential bugs in new React version affecting mobile. Limited community support for issues.
- **Recommendation:** Consider downgrading to React 18 LTS for stability.

### axios 1.6.5 Outdated

**Issue:** axios version very old (latest is 1.7+)
- **Files:** `emrun-frontend/package.json` (line 15)
- **Impact:** Security vulnerabilities in HTTP client. Missing performance improvements.

### Missing @types/react-native

**Issue:** No type definitions for react-native in frontend
- **Files:** `emrun-frontend/package.json` (devDependencies)
- **Impact:** Type safety issues when using RN APIs. IDE doesn't provide autocomplete for RN functions.

---

## Potential Data Loss Scenarios

### Questionnaire Session Without Email Verification

**Issue:** User can attach session with different email than signup email
- **Files:** `app/Services/AuthService.php` (lines 58-67)
- **Scenario:** User completes questionnaire with email A, signs up with email B, profile never attached
- **Impact:** Lost questionnaire data. User doesn't know why profile is empty.
- **Fix:** Require email verification or session email match.

### Plan Generation Job Timeout

**Issue:** If `GeneratePlanJob` times out, plan stays in 'pending' state forever
- **Files:** `app/Jobs/GeneratePlanJob.php` (likely needs investigation)
- **Scenario:** User completes questionnaire, job queued, job times out after max retries
- **Impact:** User never receives plan. No way to recover.
- **Fix:** Add job failure handler. Create retry endpoint for users.

### AsyncStorage Loss on Mobile Reinstall

**Issue:** Tokens stored in AsyncStorage lost if app uninstalled
- **Files:** `lib/utils/auth.ts` (entire file)
- **Scenario:** User reinstalls app, loses refresh token, cannot login
- **Impact:** User locked out. No way to recover without password reset.
- **Fix:** Document this behavior. Add account recovery flow.

---

## Configuration Issues

### Missing Environment Variables in Production

**Issue:** No validation that all required env vars are set on startup
- **Files:** Backend `config/` files, Frontend `.env`
- **Required vars:**
  - `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
  - `JWT_SECRET` (if not auto-generated)
  - `API_URL` (frontend)
- **Impact:** Cryptic errors at runtime if var missing. Silent failures.
- **Fix approach:** Add startup validation script. Check all required vars exist and are non-empty. Throw clear error if missing.

### Hardcoded SQLite Database in Example Config

**Issue:** Default DB_CONNECTION=sqlite in .env.example
- **Files:** `emrun-backend/.env.example` (line 23)
- **Impact:** New developers might deploy SQLite to production. SQLite doesn't support concurrent writes well. Not suitable for production multi-instance deployment.
- **Fix approach:** Use PostgreSQL or MySQL as default example. Document that SQLite is development-only.

---

## Documentation & Communication Issues

### No API Error Code Documentation

**Issue:** Frontend receives error responses but error codes/types not documented
- **Files:** Multiple controller files return generic error messages
- **Impact:** Frontend must guess how to handle errors. Easy to miss error cases.
- **Fix approach:** Document all error response formats and codes. Create error code enum shared between frontend and backend.

### Missing Validation Error Response Format

**Issue:** Validation errors return Laravel format which might differ from other error responses
- **Files:** `app/Http/Controllers/Api/` (multiple places)
- **Impact:** Frontend must handle multiple error response formats. Hard to create generic error handler.
- **Fix approach:** Standardize error response format across all endpoints. Always return `{ success, message, errors, errorCode }`.

---

*Concerns audit: 2026-01-24*
