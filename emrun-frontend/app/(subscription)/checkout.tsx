/**
 * Checkout screen – in Expo Go we never load Stripe (avoids OnrampSdk error).
 * In dev/production builds we load the real Stripe checkout.
 */

import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const SUBSCRIPTION_BG = '#111921';
const ACCENT = '#328ce7';

// In Expo Go, Stripe native module (OnrampSdk) is not available – never import it.
// Load fallback so @stripe/stripe-react-native is never required.
const isExpoGo = Constants.appOwnership === 'expo';

const LazyCheckout = React.lazy(() =>
  isExpoGo ? import('./checkout-fallback') : import('./checkout-content')
);

function CheckoutLoadingFallback() {
  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <LazyCheckout />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUBSCRIPTION_BG,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
