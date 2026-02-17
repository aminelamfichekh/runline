/**
 * Subscription Management Screen
 * Shows subscription details and allows cancellation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/contexts/NotificationContext';
import { colors } from '@/constants/colors';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isCancelling, setIsCancelling] = useState(false);

  // Mock subscription data - in production, fetch from API
  const subscription = {
    plan: 'Premium',
    price: '9.99',
    currency: '€',
    interval: 'mois',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    features: [
      'Plans d\'entraînement personnalisés',
      'Suivi de progression illimité',
      'Accès à tous les exercices',
      'Support prioritaire',
      'Pas de publicités',
    ],
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler votre abonnement ?\n\nVous conserverez l\'accès Premium jusqu\'à la fin de votre période de facturation actuelle.',
      [
        {
          text: 'Non, garder',
          style: 'cancel',
        },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              // TODO: Call API to cancel subscription
              // await subscriptionApi.cancel();

              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1500));

              showNotification('Abonnement annulé. Vous conservez l\'accès jusqu\'au ' + formatDate(subscription.currentPeriodEnd), 'success');
              router.back();
            } catch (error) {
              showNotification('Erreur lors de l\'annulation', 'error');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon abonnement</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planCardGlow} />

          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Ionicons name="star" size={16} color={colors.accent.blue} />
              <Text style={styles.planBadgeText}>PLAN ACTUEL</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Actif</Text>
            </View>
          </View>

          <Text style={styles.planName}>{subscription.plan}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              {subscription.price}
              <Text style={styles.priceCurrency}>{subscription.currency}</Text>
            </Text>
            <Text style={styles.priceInterval}>/ {subscription.interval}</Text>
          </View>

          <View style={styles.renewalInfo}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.renewalText}>
              Prochain renouvellement le {formatDate(subscription.currentPeriodEnd)}
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inclus dans votre abonnement</Text>
          <View style={styles.featuresCard}>
            {subscription.features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureRow,
                  index < subscription.features.length - 1 && styles.featureRowBorder,
                ]}
              >
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={16} color={colors.accent.blue} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moyen de paiement</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <View style={styles.cardIcon}>
                <Ionicons name="card" size={24} color={colors.text.primary} />
              </View>
              <View>
                <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
                <Text style={styles.cardExpiry}>Expire 12/26</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editPaymentButton}>
              <Text style={styles.editPaymentText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cancel Section */}
        <View style={styles.cancelSection}>
          <Text style={styles.cancelTitle}>Vous souhaitez partir ?</Text>
          <Text style={styles.cancelDescription}>
            Si vous annulez, vous conserverez l'accès Premium jusqu'à la fin de votre période de facturation actuelle.
          </Text>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={isCancelling}
            activeOpacity={0.7}
          >
            {isCancelling ? (
              <ActivityIndicator color={colors.status.error} size="small" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color={colors.status.error} />
                <Text style={styles.cancelButtonText}>Annuler mon abonnement</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Ionicons name="help-circle-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.helpText}>
            Des questions ? Contactez notre support à support@runline.app
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Plan Card
  planCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.accent.blue,
    overflow: 'hidden',
  },
  planCardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent.blue,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  planName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent.blue,
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '500',
  },
  priceInterval: {
    fontSize: 16,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  renewalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  renewalText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },

  // Features
  featuresCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
  },

  // Payment
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardExpiry: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  editPaymentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editPaymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
  },

  // Cancel Section
  cancelSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cancelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  cancelDescription: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.error,
  },

  // Help
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  helpText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
