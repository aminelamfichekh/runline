import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useStripe } from '@stripe/stripe-react-native';
import { paymentService } from '@/src/services/payment.service';
import { colors } from '@/constants/colors';

export default function CheckoutScreen() {
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

      // Create subscription on backend - get client secret
      const { clientSecret, ephemeralKey, customerId } =
        await paymentService.createSubscription('price_monthly');

      // Initialize PaymentSheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'RUNLINE',
        paymentIntentClientSecret: clientSecret,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customerId,
        defaultBillingDetails: {
          name: 'Runner',
        },
        style: 'alwaysDark', // Match app theme
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
      // Present PaymentSheet
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled - do nothing
        } else {
          Alert.alert(t('subscription.errors.paymentFailed'), error.message);
        }
      } else {
        // Payment successful - navigate to success
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>{t('subscription.checkout.initializing')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.checkout.title')}</Text>
          <Text style={styles.subtitle}>{t('subscription.checkout.securePayment')}</Text>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t('subscription.checkout.total')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryAmount}>9,99 €</Text>
            <Text style={styles.summaryPeriod}>{t('subscription.pricing.period')}</Text>
          </View>
          <Text style={styles.summaryNote}>{t('subscription.checkout.chargeToday')}</Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.payButtonText}>{t('subscription.checkout.pay')}</Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <Text style={styles.securityText}>{t('subscription.checkout.stripePowered')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
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
    color: colors.text.primary,
  },
  summaryPeriod: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  summaryNote: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  payButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  securityText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
