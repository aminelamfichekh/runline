/**
 * Subscription Management Fallback for Expo Go
 * Shows subscription info without Stripe (no payment method update).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useSubscription } from '@/hooks/useSubscription';
import { BottomNav } from '@/components/ui/BottomNav';

export default function SubscriptionFallback() {
  const router = useRouter();
  const sub = useSubscription();

  const subscription = {
    plan: sub.isActive ? 'Premium' : sub.status === 'incomplete' ? 'En cours...' : sub.status === 'canceled' ? 'Annulé' : 'Standard',
    price: '19.99',
    currency: '€',
    interval: 'mois',
    features: [
      'Plans d\'entraînement personnalisés',
      'Planification optimisée',
      'Suivi de progression illimité',
      'Support 24/7',
      'Accès premium',
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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
        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planCardGlow} />
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Ionicons name="star" size={16} color={colors.accent.blue} />
              <Text style={styles.planBadgeText}>PLAN ACTUEL</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, !sub.isActive && styles.statusDotInactive]} />
              <Text style={[styles.statusText, !sub.isActive && styles.statusTextInactive]}>
                {sub.isActive ? 'Actif' : sub.status === 'incomplete' ? 'En attente' : sub.status === 'past_due' ? 'Paiement requis' : sub.status === 'canceled' ? 'Annulé' : 'Inactif'}
              </Text>
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
        </View>

        {/* Features */}
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

        {/* Expo Go notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.accent.blue} />
          <Text style={styles.noticeText}>
            La gestion du moyen de paiement n'est pas disponible dans Expo Go. Utilisez un build de production pour modifier votre carte.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
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
  statusDotInactive: {
    backgroundColor: '#94a3b8',
  },
  statusTextInactive: {
    color: '#94a3b8',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.2)',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
