/**
 * Checkout screen content – loaded only when user navigates to checkout.
 * Keeps @stripe/stripe-react-native (and OnrampSdk) out of the main bundle
 * so questionnaire/age picker don't trigger the missing native module error.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { paymentService } from '@/src/services/payment.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SUBSCRIPTION_BG = '#111921';
const CARD_BG = '#1a2632';
const BORDER = '#344d65';
const ACCENT = '#328ce7';
const TEXT_SECONDARY = '#93adc8';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function CheckoutContentWrapper() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.runline.app"
    >
      <CheckoutContent />
    </StripeProvider>
  );
}

function CheckoutContent() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setInitializing(true);

      const priceId = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || 'price_monthly';
      const { clientSecret, ephemeralKey, customerId } =
        await paymentService.createSubscription(priceId);

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'RUNLINE',
        paymentIntentClientSecret: clientSecret,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customerId,
        defaultBillingDetails: { name: 'Runner' },
        style: 'alwaysDark',
        returnURL: 'emrun://subscription/success',
      });

      if (error) {
        Alert.alert(t('subscription.errors.initFailed'), error.message);
        router.back();
      }
    } catch (error: any) {
      Alert.alert(t('subscription.errors.error'), error.message);
      router.back();
    } finally {
      setInitializing(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert(t('subscription.errors.paymentFailed'), error.message);
        }
      } else {
        router.replace('/(subscription)/success');
      }
    } catch (error: any) {
      Alert.alert(t('subscription.errors.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>{t('subscription.checkout.initializing')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressLabel}>Étape 2 · Paiement</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Finalisez votre <Text style={styles.headlineHighlight}>paiement</Text>
          </Text>
          <Text style={styles.subtitle}>{t('subscription.checkout.securePayment')}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('subscription.checkout.total')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryAmount}>19,99 $</Text>
            <Text style={styles.summaryPeriod}>{t('subscription.pricing.period')}</Text>
          </View>
          <Text style={styles.summaryNote}>{t('subscription.checkout.chargeToday')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>{t('subscription.checkout.pay')}</Text>
              <MaterialCommunityIcons name="lock" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.securityText}>{t('subscription.checkout.stripePowered')}</Text>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(subscription)/success')}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Passer (test)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUBSCRIPTION_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#ffffff',
    textAlign: 'center',
  },
  progressWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: BORDER,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 9999,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headlineContainer: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headlineHighlight: {
    color: ACCENT,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: ACCENT,
  },
  summaryPeriod: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginLeft: 8,
  },
  summaryNote: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  payButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  securityText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
  },
  skipButtonText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});
