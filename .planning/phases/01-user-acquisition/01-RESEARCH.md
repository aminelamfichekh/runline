# Phase 1: User Acquisition - Research

**Researched:** 2026-01-25
**Domain:** React Native Mobile App Development with Authentication & Payments
**Confidence:** MEDIUM

## Summary

Phase 1 requires building a React Native/Expo mobile application with three core capabilities: (1) anonymous multi-step questionnaire with wheel pickers and French localization, (2) JWT-based authentication with session transfer from anonymous to authenticated state, and (3) Stripe payment integration for iOS/Android subscriptions.

The standard stack centers on Expo SDK with React Hook Form for performant form state management, React Navigation for stack-based navigation with automatic state preservation, expo-secure-store for encrypted token storage, and Stripe's official React Native SDK for payments. The backend uses Node.js/Express with JWT middleware for authentication and Stripe webhooks for subscription event handling.

Critical findings: (1) React Hook Form outperforms Formik and is actively maintained, (2) expo-secure-store has a 2048-byte limit requiring careful token handling, (3) Stripe for digital goods faces App Store policy risks in non-US/EU markets but is now permitted in US and EU with external payment links, (4) anonymous session transfer requires careful UID preservation on backend, and (5) Stack Navigator automatically preserves state on back navigation without additional configuration.

**Primary recommendation:** Use Expo with React Hook Form for forms, React Navigation Stack for questionnaire flow, expo-secure-store for tokens, and Stripe React Native SDK with PaymentSheet for subscriptions, while preparing contingency for In-App Purchase if App Store rejects Stripe in your target market.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Expo SDK | 52+ | React Native framework | Production-ready, 75% of projects use New Architecture, eliminates native code complexity |
| React Navigation | 6.x/7.x | Multi-screen navigation | De facto standard, automatic state preservation, stack navigator built for step-by-step flows |
| React Hook Form | 7.x | Form state management | Best performance (1800ms mount vs 2070+ms competitors), 12KB gzipped, zero dependencies, actively maintained |
| @stripe/stripe-react-native | Latest | Payment processing | Official Stripe SDK, supports iOS/Android, PaymentSheet handles Apple/Google Pay out-of-box |
| expo-secure-store | Latest | Encrypted token storage | Expo's wrapper for iOS Keychain & Android Keystore, industry standard for token security |
| react-i18next | Latest | Internationalization | Most popular i18n solution for React Native, full pluralization/interpolation support |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @quidone/react-native-wheel-picker | 1.6.1+ | iOS-style wheel pickers | Age/weight/height selection, Expo-compatible, TypeScript support |
| react-native-wheely | Latest | Alternative wheel picker | If quidone doesn't meet design requirements, all-JavaScript implementation |
| zod | Latest | Schema validation | Pair with React Hook Form for runtime validation, TypeScript-first |
| axios | Latest | HTTP client | API requests, interceptor support for JWT refresh tokens |
| react-native-axios-jwt | Latest | JWT token management | Automatic refresh token handling with axios interceptors |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form | Formik | Formik: 44KB, not actively maintained (no commits in 1 year), slower re-renders. Only if team already expert in Formik. |
| expo-secure-store | react-native-keychain | Bare React Native only. Use if not using Expo. |
| Stripe SDK | In-App Purchase (IAP) | Required if App Store/Play Store reject Stripe. More complex, 15-30% fees vs 2.9%. Keep as contingency. |
| React Navigation | React Router Native | Web-centric, doesn't handle mobile navigation patterns well. Avoid. |

**Installation:**
```bash
# Expo project initialization
npx create-expo-app emrun-app
cd emrun-app

# Core dependencies
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npm install react-hook-form
npm install zod
npm install @stripe/stripe-react-native
npx expo install expo-secure-store
npm install react-i18next i18next
npm install axios

# Supporting (wheel pickers)
npm install @quidone/react-native-wheel-picker

# Backend
npm install express jsonwebtoken bcrypt stripe dotenv
npm install express-validator helmet cors
```

## Architecture Patterns

### Recommended Project Structure

```
emrun-frontend/
├── src/
│   ├── screens/               # Screen components
│   │   ├── onboarding/        # Questionnaire steps (9 screens)
│   │   ├── auth/              # Login, signup screens
│   │   ├── subscription/      # Pricing, checkout screens
│   │   └── profile/           # User profile, subscription management
│   ├── components/            # Reusable UI components
│   │   ├── form/              # Form inputs, wheel pickers
│   │   └── navigation/        # Progress indicators
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.tsx   # Root navigator setup
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Authentication logic
│   │   └── useSecureStorage.ts # Token management
│   ├── services/              # API and business logic
│   │   ├── api.ts             # Axios instance with interceptors
│   │   ├── auth.service.ts    # Auth API calls
│   │   └── payment.service.ts # Stripe integration
│   ├── store/                 # State management
│   │   └── authContext.tsx    # Auth state (Context API sufficient for Phase 1)
│   ├── locales/               # i18n translations
│   │   └── fr.json            # French translations
│   └── types/                 # TypeScript definitions

emrun-backend/
├── src/
│   ├── routes/                # Express routes
│   │   ├── auth.routes.ts     # Login, signup, refresh
│   │   ├── user.routes.ts     # User profile, questionnaire data
│   │   └── webhook.routes.ts  # Stripe webhooks
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts # JWT verification
│   │   └── validate.middleware.ts # Input validation
│   ├── controllers/           # Route handlers
│   ├── services/              # Business logic
│   │   ├── auth.service.ts    # JWT generation, session transfer
│   │   └── stripe.service.ts  # Stripe API calls
│   ├── models/                # Database models (if using ORM)
│   └── utils/                 # Helper functions
```

### Pattern 1: Multi-Step Form with Stack Navigator

**What:** Use React Navigation Stack with one screen per questionnaire step. Stack Navigator automatically preserves state when navigating back, eliminating need for complex state management.

**When to use:** Multi-step flows where users can navigate back/forward (onboarding, checkout).

**Example:**
```typescript
// Source: https://reactnavigation.org/docs/stack-navigator/
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Custom header with progress
        gestureEnabled: true, // Allow swipe back on iOS
      }}
    >
      <Stack.Screen name="Step1Age" component={Step1AgeScreen} />
      <Stack.Screen name="Step2Weight" component={Step2WeightScreen} />
      {/* ... 9 total steps ... */}
      <Stack.Screen name="PlanPreview" component={PlanPreviewScreen} />
    </Stack.Navigator>
  );
}
```

### Pattern 2: React Hook Form with Wheel Picker Integration

**What:** Use React Hook Form's Controller component to integrate wheel pickers. Form state persists across screens without manual state management.

**When to use:** Forms with custom input components (wheel pickers, sliders).

**Example:**
```typescript
// Source: https://react-hook-form.com/
import { useForm, Controller } from 'react-hook-form';
import WheelPicker from '@quidone/react-native-wheel-picker';

function Step1AgeScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: { age: 30 }
  });

  const onSubmit = (data) => {
    // Save to context or backend
    navigation.navigate('Step2Weight');
  };

  return (
    <Controller
      control={control}
      name="age"
      render={({ field: { onChange, value } }) => (
        <WheelPicker
          selectedIndex={value - 18}
          options={Array.from({ length: 63 }, (_, i) => ({
            label: String(18 + i),
            value: 18 + i
          }))}
          onChange={(index) => onChange(18 + index)}
        />
      )}
    />
  );
}
```

### Pattern 3: Anonymous Session Transfer on Signup

**What:** Create anonymous user with temporary UUID on app start, store questionnaire data associated with UUID, then transfer ownership to authenticated user on signup.

**When to use:** Allowing data collection before account creation.

**Example:**
```typescript
// Source: https://medium.com/@rishabhnigam_87721/linking-anonymous-user-to-phone-authenticated-users-in-react-native-firebase-36376f200ea9
// Frontend - Auth Service
async function signUp(email: string, password: string) {
  const anonymousSessionId = await AsyncStorage.getItem('anonymousSessionId');

  const response = await api.post('/auth/signup', {
    email,
    password,
    anonymousSessionId, // Backend links this data to new user
  });

  // Clear anonymous session
  await AsyncStorage.removeItem('anonymousSessionId');

  return response.data;
}

// Backend - Signup Handler
async function handleSignup(req, res) {
  const { email, password, anonymousSessionId } = req.body;

  // Create user account
  const user = await User.create({ email, passwordHash: await bcrypt.hash(password, 10) });

  // Transfer anonymous questionnaire data
  if (anonymousSessionId) {
    await QuestionnaireData.updateMany(
      { sessionId: anonymousSessionId },
      { userId: user.id }
    );
  }

  // Return JWT tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.json({ accessToken, refreshToken, user });
}
```

### Pattern 4: Secure Token Storage with Refresh

**What:** Store access token (short-lived, 5-15 min) and refresh token (long-lived, 7-30 days) in expo-secure-store. Use axios interceptors to auto-refresh on 401 errors.

**When to use:** JWT authentication in React Native apps.

**Example:**
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/securestore/
// Source: https://medium.com/@aqeel_ahmad/handling-jwt-access-token-refresh-token-using-axios-in-react-react-native-app-2024-f452c96a83fc
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Token storage (max 2048 bytes per key)
async function storeTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

// Axios interceptor for auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const { data } = await axios.post('/auth/refresh', { refreshToken });

      await storeTokens(data.accessToken, data.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

### Pattern 5: Stripe PaymentSheet Integration

**What:** Use Stripe's pre-built PaymentSheet for checkout. Handles Apple Pay, Google Pay, cards, validation, and PCI compliance automatically.

**When to use:** Accepting payments in React Native apps.

**Example:**
```typescript
// Source: https://docs.stripe.com/payments/accept-a-payment?platform=react-native
import { useStripe } from '@stripe/stripe-react-native';

function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    // 1. Create payment intent on backend
    const { data } = await api.post('/payment/create-intent', {
      amount: 999, // $9.99
      currency: 'usd',
    });

    // 2. Initialize payment sheet
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: 'EmRun',
      paymentIntentClientSecret: data.clientSecret,
      defaultBillingDetails: { name: user.name },
    });

    if (initError) {
      Alert.alert('Error', initError.message);
      return;
    }

    // 3. Present payment sheet
    const { error: paymentError } = await presentPaymentSheet();

    if (paymentError) {
      if (paymentError.code === 'Canceled') {
        // User canceled, do nothing
      } else {
        Alert.alert('Payment failed', paymentError.message);
      }
    } else {
      Alert.alert('Success', 'Subscription activated!');
      navigation.navigate('Dashboard');
    }
  };

  return <Button title="Subscribe" onPress={handlePayment} />;
}
```

### Pattern 6: Stripe Webhook Handler with Signature Verification

**What:** Dedicated Express route for Stripe webhooks with signature verification and subscription event handling.

**When to use:** Processing Stripe subscription events (payment success, failure, cancellation).

**Example:**
```typescript
// Source: https://docs.stripe.com/webhooks
// Source: https://docs.stripe.com/billing/subscriptions/webhooks
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook/stripe',
  express.raw({ type: 'application/json' }), // IMPORTANT: Use raw body
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      // Verify webhook signature (CRITICAL for security)
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'invoice.paid':
        // Grant/extend access
        await User.updateOne(
          { stripeCustomerId: event.data.object.customer },
          { subscriptionStatus: 'active', subscriptionEnd: new Date(event.data.object.current_period_end * 1000) }
        );
        break;

      case 'invoice.payment_failed':
        // Notify user, retry payment
        await User.updateOne(
          { stripeCustomerId: event.data.object.customer },
          { subscriptionStatus: 'past_due' }
        );
        break;

      case 'customer.subscription.deleted':
        // Revoke access
        await User.updateOne(
          { stripeCustomerId: event.data.object.customer },
          { subscriptionStatus: 'canceled' }
        );
        break;
    }

    res.json({ received: true });
  }
);
```

### Pattern 7: Conditional Form Logic with React Hook Form

**What:** Use React Hook Form's `watch` to monitor field values and conditionally render/register fields based on answers.

**When to use:** Forms with conditional logic (e.g., race questions only if preparing for race).

**Example:**
```typescript
// Source: https://devmarvels.com/creating-conditional-form-fields-with-react-hook-form-and-typescript/
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

function GoalsScreen() {
  const { register, unregister, watch, control } = useForm();
  const preparingForRace = watch('preparingForRace');

  useEffect(() => {
    if (!preparingForRace) {
      // Unregister race-specific fields when not needed
      unregister(['raceDate', 'raceDistance', 'raceGoalTime']);
    }
  }, [preparingForRace, unregister]);

  return (
    <>
      <Controller
        control={control}
        name="preparingForRace"
        render={({ field }) => (
          <Switch value={field.value} onValueChange={field.onChange} />
        )}
      />

      {preparingForRace && (
        <>
          <Controller name="raceDate" control={control} render={...} />
          <Controller name="raceDistance" control={control} render={...} />
          <Controller name="raceGoalTime" control={control} render={...} />
        </>
      )}
    </>
  );
}
```

### Anti-Patterns to Avoid

- **Using AsyncStorage for tokens:** AsyncStorage is unencrypted. Always use expo-secure-store for sensitive data.
- **Storing entire form state in React state across screens:** Let Stack Navigator preserve screen state automatically. Only lift state to context if needed across non-adjacent screens.
- **Manual navigation state management:** Stack Navigator handles it. Don't build custom back/forward logic.
- **Storing large objects in SecureStore:** 2048-byte limit exists. Store only tokens, not entire user objects.
- **Ignoring webhook signature verification:** Always verify Stripe signatures to prevent malicious events.
- **Using Formik for new projects:** Not actively maintained, worse performance than React Hook Form.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token refresh on 401 | Custom axios logic | react-native-axios-jwt or manual interceptors (pattern above) | Handles race conditions, token expiration edge cases, request queuing during refresh |
| Wheel picker UI | Custom ScrollView implementation | @quidone/react-native-wheel-picker or react-native-wheely | Native feel, haptic feedback, momentum scrolling, iOS/Android platform differences |
| Payment UI forms | Custom card input validation | Stripe PaymentSheet | PCI compliance, Apple/Google Pay, card validation, 3D Secure, regional payment methods |
| Secure storage | Custom encryption | expo-secure-store | Platform-specific encryption (Keychain/Keystore), biometric auth, proper key management |
| Form validation | Manual field checking | React Hook Form + Zod | Re-render optimization, error handling, async validation, TypeScript integration |
| i18n translation switching | Custom translation object | react-i18next | Pluralization rules, interpolation, language detection, lazy loading, React Context integration |
| JWT generation/verification | Custom crypto | jsonwebtoken library | Algorithm support, expiration handling, claim validation, security best practices |
| Webhook signature verification | Custom HMAC | stripe.webhooks.constructEvent | Timing attack protection, replay attack prevention, proper constant-time comparison |

**Key insight:** Mobile payments, security, and form performance are domains with significant hidden complexity. Using battle-tested libraries prevents security vulnerabilities, edge case bugs, and performance issues that only surface at scale. Custom solutions for these domains typically require months of refinement.

## Common Pitfalls

### Pitfall 1: SecureStore Size Limit Exceeded

**What goes wrong:** Storing JWTs larger than 2048 bytes fails silently or throws errors on iOS. This happens when JWT payload contains large user objects or extensive claims.

**Why it happens:** iOS Keychain historically rejected values above ~2048 bytes. Developers store entire user objects or verbose claims in JWT payload without checking size.

**How to avoid:**
- Keep JWT payload minimal (user ID, role only)
- Store user details in database, fetch after token verification
- Check token length before storing: `if (token.length > 2000) throw new Error('Token too large')`
- Use separate SecureStore keys for access/refresh tokens

**Warning signs:**
- SecureStore.setItemAsync fails intermittently on iOS
- Token storage works in dev (small payloads) but fails in production (larger payloads)
- Error messages about keychain size limits

### Pitfall 2: Webhook Signature Verification Skipped

**What goes wrong:** Attackers send fake webhook events to your endpoint, granting free subscriptions or canceling legitimate ones.

**Why it happens:** Developers skip signature verification during initial testing and forget to add it before production.

**How to avoid:**
- Always use `stripe.webhooks.constructEvent()` with webhook secret
- Use `express.raw()` middleware for webhook route (JSON parsing breaks signature)
- Test signature verification with Stripe CLI: `stripe trigger customer.subscription.created`
- Store webhook secret in environment variables, never hardcode

**Warning signs:**
- Webhook endpoint accepts POST from any source
- Using `express.json()` globally (breaks raw body for webhooks)
- Webhook secret in source code
- No error handling for signature verification failures

### Pitfall 3: Race Condition in Token Refresh

**What goes wrong:** Multiple API calls fail simultaneously (all get 401), triggering multiple refresh token requests. First refresh succeeds, subsequent ones fail with invalid refresh token, logging user out.

**Why it happens:** Axios interceptor doesn't queue requests during token refresh.

**How to avoid:**
- Use request queuing pattern: store pending requests, retry after refresh completes
- Use `react-native-axios-jwt` library (handles this automatically)
- Add `_retry` flag to prevent infinite refresh loops
- Implement mutex/lock around refresh logic

**Warning signs:**
- Users randomly logged out when multiple API calls happen
- Multiple `/auth/refresh` requests in network logs for single 401
- Refresh token becomes invalid after first use

### Pitfall 4: Anonymous Session Not Cleaned Up

**What goes wrong:** Anonymous questionnaire data accumulates in database, never transferred to user accounts. Database bloats with orphaned sessions.

**Why it happens:** Signup flow doesn't include anonymousSessionId, or backend doesn't implement transfer logic.

**How to avoid:**
- Always send anonymousSessionId from frontend on signup
- Backend validates and transfers data atomically
- Implement cleanup job to delete anonymous sessions older than 7 days
- Log anonymous session transfer success/failure for monitoring

**Warning signs:**
- Database has many anonymous sessions with completed questionnaires
- Users report questionnaire data missing after signup
- No transfer logic in signup endpoint

### Pitfall 5: Platform-Specific Design Ignored

**What goes wrong:** App uses iOS design patterns on Android (or vice versa), feeling "foreign" to users. Navigation gestures don't match platform expectations. 70% of users abandon apps due to poor navigation.

**Why it happens:** Developers design for one platform and assume it works on both.

**How to avoid:**
- Use `Platform.OS` to conditionally render iOS/Android components
- Test on both platforms regularly
- Use platform-specific navigation patterns (swipe-back on iOS, hardware back button on Android)
- Follow Material Design (Android) and Human Interface Guidelines (iOS)

**Warning signs:**
- Android users complain about missing back button functionality
- iOS users expect swipe-back but it doesn't work
- UI components look out of place on one platform

### Pitfall 6: Stripe vs In-App Purchase Confusion

**What goes wrong:** App uses Stripe for digital subscriptions, gets rejected by App Store for violating IAP requirements (outside US/EU).

**Why it happens:** Developer unaware of regional App Store policies. Stripe is now legal in US/EU but restricted elsewhere.

**How to avoid:**
- Check target market regulations BEFORE implementing payments
- If targeting global markets, implement BOTH Stripe and IAP with feature flags
- Use Stripe in US/EU (2.9% fee), IAP elsewhere (15-30% fee)
- Read Apple's external payment link requirements (updated April 2025)
- Test App Store submission in target regions EARLY

**Warning signs:**
- Only Stripe implemented with no IAP fallback
- No feature flag to switch payment providers
- Targeting markets outside US/EU with Stripe
- No App Store submission testing before Phase 1 completion

### Pitfall 7: Not Using React Hook Form's Uncontrolled Mode

**What goes wrong:** Every keystroke triggers full component re-render, causing lag on lower-end devices, especially with 9-step forms.

**Why it happens:** Using controlled inputs (`value={state}`) instead of React Hook Form's uncontrolled approach.

**How to avoid:**
- Use React Hook Form's Controller for custom components (wheel pickers)
- Use `register` for standard inputs (don't manually wire up `value` and `onChange`)
- Avoid `watch()` in render body; use it in `useEffect` or callbacks only
- Use `getValues()` for one-time reads instead of `watch()`

**Warning signs:**
- Noticeable input lag on mid-range devices
- React DevTools shows excessive re-renders
- Form performance degrades with more fields

## Code Examples

Verified patterns from official sources:

### JWT Authentication Middleware (Express)

```typescript
// Source: https://www.topcoder.com/thrive/articles/authentication-and-authorization-in-express-js-api-using-jwt
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Attach user to request
    next();
  });
}

// Usage in routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});
```

### Token Generation (Access + Refresh)

```typescript
// Source: https://dhruvpvx.medium.com/advanced-jwt-session-management-in-react-and-react-native-69f475581181
import jwt from 'jsonwebtoken';

function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' } // Short-lived
  );
}

function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Long-lived
  );
}

// Refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Optional: Check if refresh token is revoked (store in DB or Redis)

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});
```

### React i18next Setup (French)

```typescript
// Source: https://react.i18next.com/
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;

// locales/fr.json
{
  "onboarding": {
    "step1": {
      "title": "Quel âge avez-vous?",
      "continue": "Continuer"
    },
    "step2": {
      "title": "Quel est votre poids?",
      "unit": "kg"
    }
  }
}

// Usage in component
import { useTranslation } from 'react-i18next';

function Step1Screen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('onboarding.step1.title')}</Text>
      <Button title={t('onboarding.step1.continue')} />
    </View>
  );
}
```

### Progress Indicator Component

```typescript
// Custom component, pattern from https://medium.com/@senalisa/creating-a-customizable-multi-step-progress-component-in-react-native-1678f4a0ae45
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{currentStep}/{totalSteps}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 14, color: '#666', marginBottom: 8 },
  barContainer: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  barFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 2 },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik for forms | React Hook Form | 2020-2021 | Formik unmaintained (no commits in 1 year), React Hook Form faster (1800ms vs 2070ms mount), smaller (12KB vs 44KB) |
| AsyncStorage for tokens | expo-secure-store / react-native-keychain | Always (security) | AsyncStorage unencrypted, fails PCI/security audits. SecureStore uses platform encryption (Keychain/Keystore) |
| Stripe via Apple/Google IAP required | Stripe direct with external links (US/EU) | April 2025 (Epic v. Apple ruling) | US/EU apps can use Stripe (2.9% fee) instead of mandatory IAP (15-30%). Other regions still require IAP. |
| React Navigation v5 | React Navigation v6/v7 | 2021 | TypeScript-first, improved type safety, simplified API |
| Class components | Functional components with hooks | 2019 | Hooks are standard, better performance, easier testing |
| Expo SDK < 52 | Expo SDK 52+ with New Architecture | 2025 | 75% of projects use New Architecture, faster Time to Interactive, Hermes V1 bytecode optimization |

**Deprecated/outdated:**
- **Formik:** Not maintained, last commit >1 year ago. Use React Hook Form.
- **tipsi-stripe:** Old Stripe React Native library. Use official `@stripe/stripe-react-native`.
- **react-native-i18n:** Deprecated. Use `react-i18next` (i18next ecosystem standard).
- **Storing tokens in Redux/Context state:** Tokens lost on app restart. Use expo-secure-store with persistence.

## Open Questions

Things that couldn't be fully resolved:

1. **Stripe vs IAP final decision for target market**
   - What we know: US/EU permit Stripe external links (April 2025 ruling), other regions unclear
   - What's unclear: Exact App Store/Play Store policy enforcement in 2026 for non-US/EU markets
   - Recommendation: Implement Stripe first, build IAP contingency plan (feature flag), test App Store submission EARLY in Phase 1 to identify rejection risk. If targeting global markets, budget for IAP implementation.

2. **Optimal JWT access token expiration time**
   - What we know: Industry standard 5-15 minutes, refresh token 7-30 days
   - What's unclear: Best balance for mobile app (longer = better UX, shorter = more secure)
   - Recommendation: Start with 15-minute access, 7-day refresh. Monitor user complaints about re-login frequency. Mobile apps can use longer access tokens (30-60 min) due to device-level security.

3. **Anonymous session cleanup strategy**
   - What we know: Needs cleanup to prevent DB bloat
   - What's unclear: Optimal retention period (7 days? 30 days?)
   - Recommendation: Delete anonymous sessions after 7 days if not converted to account. Implement as scheduled job (cron). Monitor conversion rate (questionnaire completion → signup) to validate timing.

4. **Wheel picker library final choice**
   - What we know: @quidone/react-native-wheel-picker (1.6.1) is most recent with Expo support
   - What's unclear: Real-world performance/UX compared to react-native-wheely
   - Recommendation: Prototype with @quidone first (TypeScript, Expo-compatible). If design requirements not met, switch to react-native-wheely (all-JavaScript). Budget 1 day for testing both.

5. **Backend framework choice (Express vs alternatives)**
   - What we know: Express is most common, mature ecosystem
   - What's unclear: Whether modern alternatives (Fastify, Hono) offer meaningful benefits for this use case
   - Recommendation: Use Express unless team has strong preference for alternative. Express has best Stripe webhook examples and JWT middleware patterns. Don't optimize prematurely.

## Sources

### Primary (HIGH confidence)

- [Stripe React Native SDK Documentation](https://docs.stripe.com/sdks/react-native) - Official Stripe docs, installation and features
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) - Signature verification, security best practices
- [Stripe Subscription Webhooks](https://docs.stripe.com/billing/subscriptions/webhooks) - Essential events, best practices
- [Expo Authentication Guide](https://docs.expo.dev/develop/authentication/) - Token storage recommendations, OAuth patterns
- [React Native Security Documentation](https://reactnative.dev/docs/security) - Token storage, secure storage solutions
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/) - Storage limits, platform behaviors, security guarantees
- [React Navigation Stack Navigator](https://reactnavigation.org/docs/stack-navigator/) - State preservation, configuration options
- [React Hook Form Documentation](https://react-hook-form.com/) - Performance metrics, React Native support
- [react-i18next Documentation](https://react.i18next.com/) - Official i18n library for React/React Native

### Secondary (MEDIUM confidence)

- [React Native Expo Complete Guide (2026)](https://reactnativeexpert.com/blog/react-native-expo-complete-guide/) - Best practices, new architecture adoption
- [Top React Native Wheel Pickers (2026)](https://dev.to/eira-wexford/top-react-native-wheel-pickers-for-date-color-selection-2026-1oap) - Library comparison
- [Can You Use Stripe for In-App Purchases in 2026?](https://adapty.io/blog/can-you-use-stripe-for-in-app-purchases/) - IAP policy analysis, regional differences, Epic v. Apple ruling impact
- [Stripe React Native Integration Guide](https://docs.stripe.com/payments/accept-a-payment?platform=react-native) - PaymentSheet implementation examples
- [React Hook Form vs Formik Comparison](https://refine.dev/blog/react-hook-form-vs-formik/) - Performance metrics, bundle size, maintenance status
- [JWT Authentication in React Native (Medium, 2024)](https://medium.com/@aqeel_ahmad/handling-jwt-access-token-refresh-token-using-axios-in-react-react-native-app-2024-f452c96a83fc) - Axios interceptor patterns
- [Advanced JWT Session Management (Medium)](https://dhruvpvx.medium.com/advanced-jwt-session-management-in-react-and-react-native-69f475581181) - Token refresh patterns
- [Authentication in Express.js with JWT (TopCoder)](https://www.topcoder.com/thrive/articles/authentication-and-authorization-in-express-js-api-using-jwt) - Middleware patterns
- [Linking Anonymous Users in React Native Firebase (Medium)](https://medium.com/@rishabhnigam_87721/linking-anonymous-user-to-phone-authenticated-users-in-react-native-firebase-36376f200ea9) - Session transfer pattern
- [Creating Multi-Step Progress Component (Medium)](https://medium.com/@senalisa/creating-a-customizable-multi-step-progress-component-in-react-native-1678f4a0ae45) - Progress indicator patterns
- [React Native Common Mistakes (2026)](https://medium.com/@alisha00/%EF%B8%8F-stop-making-these-mistakes-in-react-native-save-hours-of-debugging-68532014d631) - Pitfalls and anti-patterns
- [10 Mistakes to Avoid in React Native Apps](https://www.f22labs.com/blogs/10-mistakes-to-avoid-when-developing-react-native-apps/) - Platform design, performance

### Tertiary (LOW confidence - marked for validation)

- WebSearch results on "React Native multi-step form navigation 2026" - Multiple libraries mentioned but need hands-on validation
- WebSearch results on "React Native internationalization 2026" - General patterns confirmed but specific implementation details need testing

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Verified with official docs and multiple sources, but library versions and ecosystem changes require validation during implementation
- Architecture: HIGH - Patterns sourced from official documentation (Stripe, Expo, React Navigation, React Hook Form) with code examples
- Pitfalls: MEDIUM - Based on community sources (Medium, blogs) and official security warnings, but real-world validation needed for project-specific edge cases
- IAP policy: LOW - Rapidly changing regulatory landscape (Epic ruling April 2025), regional differences unclear, requires legal review and App Store submission testing

**Research date:** 2026-01-25
**Valid until:** 2026-02-24 (30 days for stable libraries), 2026-02-07 (7 days for IAP policy - fast-moving regulatory landscape)

**Critical validation needed before implementation:**
1. Test App Store submission with Stripe to confirm acceptance in target market
2. Verify @quidone/react-native-wheel-picker UX matches design requirements
3. Validate SecureStore 2048-byte limit with actual JWT token sizes
4. Confirm Expo SDK 52+ New Architecture compatibility with chosen libraries
