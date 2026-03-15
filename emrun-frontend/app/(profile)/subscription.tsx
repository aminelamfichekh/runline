/**
 * Subscription Management Screen – lazy loads Stripe to avoid Expo Go crash.
 * Same pattern as (subscription)/checkout.tsx.
 */

import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { colors } from '@/constants/colors';

const isExpoGo = Constants.appOwnership === 'expo';

const LazySubscription = React.lazy(() =>
  isExpoGo ? import('./subscription-fallback') : import('./subscription-content')
);

function LoadingFallback() {
  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent.blue} />
      </View>
    </View>
  );
}

export default function SubscriptionScreen() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazySubscription />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
