# Stack Research

**Domain:** AI-powered fitness/running training mobile app
**Researched:** 2026-01-25
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React Native | 0.77+ | Cross-platform mobile framework | Industry standard for iOS+Android apps, strong ecosystem, native performance. Already in use. |
| Expo | SDK 52+ | React Native development framework | Standardizes dev environment, removes setup friction, provides excellent developer experience with managed workflow. Already in use. |
| Expo Router | 4.x | File-based navigation | Built on React Navigation, provides automatic deep linking, type safety, and is now default for new Expo projects. Recommended over React Navigation for new features. |
| React Native Reanimated | 4.x | Animations and gestures | Runs animations on UI thread at 120 fps, essential for smooth wheel pickers and transitions. Version 4 is the latest (2026). |
| React Native Gesture Handler | 2.x | Touch gesture handling | Deep integration with Reanimated, required for swipe gestures and interactive UI elements. |
| TypeScript | 5.x | Type-safe JavaScript | Prevents runtime errors, provides IDE autocomplete, essential for maintainable codebase at scale. |

### UI & Styling

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| NativeWind | 4.x | Tailwind CSS for React Native | Modern utility-first styling with dark mode support. Compiles at build time for zero runtime cost. Perfect for dark theme (#318ce7 blue). |
| @shopify/flash-list | 3.x | High-performance lists | Replace FlatList for plan/dashboard views. 30x better performance, handles complex lists at 60 FPS on low-end devices. |
| @quidone/react-native-wheel-picker | Latest | iOS/Android wheel pickers | Pure JavaScript implementation, works with Expo, no native code needed. Best for onboarding questionnaire. |
| react-native-reanimated-carousel | 3.x | Carousel component | Smooth carousel animations for plan previews, powered by Reanimated for native performance. |
| Lottie (lottie-react-native) | 7.x | Animation files | Add micro-interactions and loading animations for polished UX matching Runna-level quality. |

### State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.x | Client state management | Lightweight (3KB), minimal boilerplate, excellent TypeScript support. Recommended for global app state (user profile, subscription status). |
| TanStack Query | 5.x | Server state management | Handle API calls to Laravel backend, automatic caching, background refetching. Perfect for AI plan data and subscription sync. |
| MMKV (react-native-mmkv) | 4.x | Local storage | 30x faster than AsyncStorage, synchronous API. Use for persisting user preferences and offline plan data. Now a Nitro Module. |

### Forms & Validation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.x | Form state management | Minimal re-renders, excellent performance. Use for onboarding questionnaire forms. |
| Zod | 3.x | Schema validation | TypeScript-first validation, works seamlessly with React Hook Form. Use for form validation and API response validation. |

### Payments & Monetization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @stripe/stripe-react-native | 0.41+ | Stripe SDK | Official Stripe React Native SDK with PaymentSheet for cards, Apple Pay, Google Pay. CRITICAL: For digital subscriptions (AI plans), you MUST use Apple/Google in-app purchases per app store policies. Use Stripe only for physical goods or services. |
| react-native-iap | 12.x | In-app purchases | Required for subscription payments on iOS/Android. Apple and Google mandate using their payment systems for digital content subscriptions. |

### Internationalization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | 15.x | i18n framework | Industry standard for React Native, supports French locale, dynamic language switching, pluralization. Use with i18next for French market. |
| react-native-localize | 3.x | Device locale detection | Detects user's device language/region settings automatically. |

### Testing

| Tool | Purpose | Notes |
|------|---------|-------|
| Jest | Unit & integration testing | Default testing framework in React Native, excellent for testing business logic and components. |
| React Native Testing Library | Component testing | Modern replacement for Enzyme, focuses on testing user behavior not implementation details. |
| Detox | End-to-end testing | Gray-box E2E testing, fully compatible with React Native's New Architecture (v0.77+). Jest integration out of the box. Industry standard for RN E2E. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| EAS Build | Cloud builds | Expo Application Services for building iOS/Android apps in the cloud. No need for local Xcode/Android Studio. |
| EAS Submit | App store deployment | Automate App Store and Google Play submissions. |
| Expo Dev Client | Custom dev builds | Test native code and third-party libraries in development. |
| react-native-bootsplash | Splash screen | CLI generates all required assets for iOS/Android, integrates with native splash screen APIs. |

## Installation

```bash
# Core navigation & routing (if not already installed)
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Animations & gestures
npx expo install react-native-reanimated react-native-gesture-handler

# UI components
npm install nativewind
npm install tailwindcss@3.3.2
npm install @shopify/flash-list
npm install @quidone/react-native-wheel-picker
npm install react-native-reanimated-carousel
npm install lottie-react-native

# State management
npm install zustand
npm install @tanstack/react-query
npm install react-native-mmkv

# Forms & validation
npm install react-hook-form zod
npm install @hookform/resolvers

# Payments
npm install @stripe/stripe-react-native
npm install react-native-iap

# Internationalization
npm install react-i18next i18next
npm install react-native-localize

# Development tools
npm install --save-dev @react-native/babel-preset
npm install --save-dev babel-plugin-transform-remove-console
npm install react-native-bootsplash

# Testing
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev detox detox-cli
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Expo Router | React Navigation | If you need maximum flexibility and don't want file-based routing. However, Expo Router is built on React Navigation and is recommended for new projects. |
| NativeWind | Tamagui | If you need optimizing compiler for extreme performance or comprehensive UI component library. Tamagui has more overhead but provides advanced theming. |
| Zustand | Redux Toolkit | If you have complex state requirements with time-travel debugging or need Redux DevTools. Zustand is simpler for most use cases. |
| TanStack Query | RTK Query | If you're already using Redux Toolkit. TanStack Query is more flexible and framework-agnostic. |
| @quidone/react-native-wheel-picker | react-native-infinite-wheel-picker | If you need infinite scrolling wheel pickers. @quidone is more straightforward for standard use cases. |
| Detox | Appium | If you need cross-platform mobile testing beyond React Native. Detox is optimized specifically for React Native apps. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-native-i18n | Deprecated and unmaintained | react-i18next + react-native-localize |
| deprecated-react-native-listview | Officially deprecated by Facebook | @shopify/flash-list or FlatList |
| deprecated-react-native-prop-types | Removed from React Native core | TypeScript for type checking |
| AsyncStorage (@react-native-async-storage/async-storage) | 30x slower than MMKV, async overhead | react-native-mmkv |
| React Native Animated API without useNativeDriver | Runs on JS thread, causes jank | react-native-reanimated (runs on UI thread) |
| Formik | Heavy re-renders, slower performance | react-hook-form (better performance) |
| react-native-splash-screen (crazycodeboy) | Outdated, poor maintenance | react-native-bootsplash (actively maintained) |
| Stripe for digital subscriptions | Violates Apple/Google app store policies | react-native-iap (Apple/Google in-app purchases) |

## Stack Patterns by Variant

**For Onboarding Flow:**
- Use Expo Router for navigation with modal presentation
- Use @quidone/react-native-wheel-picker for age/weight/height selection
- Use React Hook Form + Zod for form validation
- Use Reanimated for smooth page transitions
- Pattern: Multi-step form with progress indicator

**For AI Plan Generation/Display:**
- Use TanStack Query to fetch plans from Laravel backend
- Use MMKV to cache plans offline
- Use @shopify/flash-list for training schedule lists
- Use Reanimated for smooth scroll animations
- Pattern: Optimistic updates with background sync

**For Subscription Flow:**
- Use react-native-iap for Apple/Google subscriptions (primary)
- Use @stripe/stripe-react-native ONLY if offering non-digital products
- Use TanStack Query mutations for subscription state sync with Laravel
- Pattern: App store purchase → verify receipt on Laravel backend → activate subscription

**For Dark Theme:**
- Use NativeWind with dark mode configuration
- Define color scheme with #318ce7 blue as primary
- Use useColorScheme hook for theme detection
- Pattern: CSS variables for theme tokens, automatic dark mode switching

**For French Localization:**
- Use react-i18next with French translation files
- Use react-native-localize to detect device language
- Store translations in JSON files organized by feature
- Pattern: Lazy-load translations, fall back to French as default

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React Native 0.77+ | Expo SDK 52+ | Always match Expo SDK with RN version |
| Expo Router 4.x | Expo SDK 52+ | File-based routing requires latest Expo |
| Reanimated 4.x | React Native 0.77+ | Supports New Architecture |
| Detox (latest) | React Native 0.77-0.83 | Compatible with New Architecture |
| @stripe/stripe-react-native | Expo SDK 52+ | Requires expo-dev-client for testing |
| react-native-mmkv 4.x | React Native 0.74+ | Nitro Module requires RN 0.74+ |
| @shopify/flash-list 3.x | React Native 0.65+ | Works with Expo without config plugins |
| NativeWind 4.x | React Native 0.72+ | Requires Tailwind CSS 3.3+ |

## Critical Considerations for RUNLINE

### App Store Subscription Requirements
**CRITICAL**: Since RUNLINE sells digital subscriptions (AI-generated training plans), you MUST use Apple's In-App Purchase (IAP) and Google Play Billing. Stripe cannot be used for subscription payments as this violates app store policies. Use `react-native-iap` for all subscription flows.

Architecture:
1. User purchases subscription via Apple/Google IAP
2. App receives receipt/token
3. Send receipt to Laravel backend for verification
4. Laravel verifies with Apple/Google servers
5. Laravel activates subscription in database
6. Return confirmation to app

### Performance Targets
- Target 60 FPS minimum for all animations
- Use FlashList for any list with 20+ items
- Enable Hermes JavaScript engine (default in React Native 0.70+)
- Use Reanimated for all gesture-based interactions
- Remove console.log statements in production builds
- Use requestAnimationFrame for expensive operations triggered by touch

### French Market Specifics
- Set French as default language in i18next config
- Use European date formats (DD/MM/YYYY)
- Use metric units (km, kg) throughout
- Consider GDPR compliance for data storage
- Ensure MMKV encryption for sensitive user data

### Dark Theme Implementation
- Use NativeWind's dark mode with `colorScheme` prop
- Define theme colors in tailwind.config.js with #318ce7 as primary
- Use semantic color names (bg-primary, text-primary) not hex codes directly
- Test all screens in both light and dark modes
- Ensure sufficient contrast ratios for accessibility

### Offline-First Considerations
- Use MMKV to store training plans locally
- Use TanStack Query's offline mode for API calls
- Implement optimistic updates for user actions
- Sync data when network reconnects
- Show offline indicator in UI

## Sources

### Official Documentation (HIGH Confidence)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/) — File-based routing features
- [React Native Performance](https://reactnative.dev/docs/performance) — Official optimization guidelines
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — Animation library documentation
- [Stripe React Native SDK](https://docs.stripe.com/sdks/react-native) — Official Stripe integration
- [Stripe Subscriptions Warning](https://docs.stripe.com/billing/subscriptions/build-subscriptions?platform=react-native) — App store policy restrictions

### Libraries & Tools (HIGH Confidence)
- [@quidone/react-native-wheel-picker on npm](https://www.npmjs.com/package/@quidone/react-native-wheel-picker)
- [@stripe/stripe-react-native on npm](https://www.npmjs.com/package/@stripe/stripe-react-native)
- [react-hook-form GitHub](https://github.com/react-hook-form/react-hook-form)
- [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv)
- [FlashList GitHub](https://github.com/Shopify/flash-list)
- [react-native-bootsplash GitHub](https://github.com/zoontek/react-native-bootsplash)
- [Detox GitHub](https://github.com/wix/Detox)
- [react-i18next Documentation](https://react.i18next.com/)

### Web Search Findings (MEDIUM-HIGH Confidence)
- [Top React Native Wheel Pickers for 2026](https://dev.to/eira-wexford/top-react-native-wheel-pickers-for-date-color-selection-2026-1oap)
- [React Native State Management 2026](https://medium.com/@syedaliqasim18/integrating-expo-with-advanced-state-management-libraries-like-zustand-or-mobx-c8ebcb3a9180)
- [FlashList vs FlatList Performance](https://medium.com/whitespectre/flashlist-vs-flatlist-understanding-the-key-differences-for-react-native-performance-15f59236a39c)
- [React Native Performance Optimization 2026](https://tech-stack.com/blog/improving-react-native-app-performance-practical-tactics-and-case-studies/)
- [Detox Setup Guide 2026](https://medium.com/@svbala99/simple-step-by-step-setup-detox-for-react-native-android-e2e-testing-2026-ed497fd9d301)
- [React Native Deprecated Libraries](https://github.com/facebook/react-native/wiki/Deprecations)
- [React Native Reanimated 3 Guide 2025](https://dev.to/erenelagz/react-native-reanimated-3-the-ultimate-guide-to-high-performance-animations-in-2025-4ae4)
- [Expo Router vs React Navigation 2026](https://viewlytics.ai/blog/react-navigation-7-vs-expo-router)
- [React Hook Form in React Native](https://dev.to/ajmal_hasan/building-forms-in-react-native-with-react-hook-form-and-yup-1i1l)
- [NativeWind Dark Mode Implementation](https://medium.com/@domwozniak/implementing-dark-theme-with-nativewind-in-react-native-c9f47eb81f5b)
- [React Native i18n 2026](https://dev.to/medaimane/localization-and-internationalization-in-react-native-reaching-global-audiences-3acj)
- [MMKV vs AsyncStorage Performance](https://github.com/mrousavy/react-native-mmkv)

---
*Stack research for: RUNLINE - AI Running Coach App*
*Researched: 2026-01-25*
*Confidence: HIGH (verified with official docs and recent 2025-2026 sources)*
