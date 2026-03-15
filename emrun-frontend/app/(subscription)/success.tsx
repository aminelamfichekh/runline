import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentService } from '@/src/services/payment.service';
import {
  QUESTIONNAIRE_SESSION_UUID,
  QUESTIONNAIRE_PENDING_ATTACH,
  QUESTIONNAIRE_DRAFT,
  QUESTIONNAIRE_EMAIL,
} from '@/lib/storage/keys';

const BG = '#0a101f';
const SURFACE = 'rgba(255, 255, 255, 0.08)';
const BORDER = 'rgba(255, 255, 255, 0.1)';
const ACCENT = '#318ce7';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#94a3b8';
const TEXT_MUTED = '#64748b';

type ConfirmState = 'polling' | 'confirmed' | 'timeout';

export default function SuccessScreen() {
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<ConfirmState>('polling');

  // Clear temporary questionnaire/signup data
  useEffect(() => {
    const clearTemporaryData = async () => {
      try {
        await AsyncStorage.multiRemove([
          QUESTIONNAIRE_SESSION_UUID,
          QUESTIONNAIRE_PENDING_ATTACH,
          QUESTIONNAIRE_DRAFT,
          QUESTIONNAIRE_EMAIL,
        ]);
      } catch {
        // Non-critical
      }
    };
    clearTemporaryData();
  }, []);

  // Poll backend to confirm subscription is actually active
  useEffect(() => {
    let cancelled = false;
    const maxAttempts = 10;
    const interval = 3000;

    const pollStatus = async () => {
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;
        try {
          const data = await paymentService.getSubscriptionStatus();
          const status = data?.status;
          if (status === 'active' || status === 'trialing') {
            if (!cancelled) setConfirmState('confirmed');
            return;
          }
        } catch {
          // Continue polling
        }
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
      // After all attempts, show confirmed anyway (webhook may still be in transit)
      // Better UX than showing an error after the user already paid
      if (!cancelled) setConfirmState('confirmed');
    };

    pollStatus();
    return () => { cancelled = true; };
  }, []);

  const isReady = confirmState === 'confirmed';

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.bgGlow} />

      <View style={styles.content}>
        {/* Logo */}
        <Text style={styles.logo}>RUNLINE</Text>

        {/* Check icon */}
        <View style={styles.iconArea}>
          <View style={styles.iconGlow} />
          <View style={styles.iconRing}>
            <View style={styles.iconCircle}>
              {isReady ? (
                <MaterialCommunityIcons name="check" size={36} color={TEXT_PRIMARY} />
              ) : (
                <ActivityIndicator size="large" color={TEXT_PRIMARY} />
              )}
            </View>
          </View>
        </View>

        {/* Title & subtitle */}
        <Text style={styles.title}>
          {isReady ? 'Félicitations !' : 'Confirmation...'}
        </Text>
        <Text style={styles.subtitle}>
          {isReady
            ? 'Votre abonnement est désormais actif.'
            : 'Vérification de votre paiement en cours...'}
        </Text>

        {/* Info card - only show when confirmed */}
        {isReady && (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={ACCENT} style={styles.cardIcon} />
              <Text style={styles.cardText}>
                Consultez votre plan d'entraînement personnalisé dans l'onglet Plans.
              </Text>
            </View>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="account-edit-outline" size={22} color={ACCENT} style={styles.cardIcon} />
              <Text style={styles.cardText}>
                Modifiez votre profil à tout moment dans l'onglet Profil.
              </Text>
            </View>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="chart-line" size={22} color={ACCENT} style={styles.cardIcon} />
              <Text style={styles.cardText}>
                Suivez votre progression dans l'onglet Accueil.
              </Text>
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons - only when confirmed */}
        {isReady && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(tabs)/plans')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Accéder à mon plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Aller à l'accueil</Text>
            </TouchableOpacity>

            <Text style={styles.footerBadge}>Runline Premium</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  bgGlow: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '120%',
    height: '60%',
    backgroundColor: 'rgba(30, 58, 95, 0.3)',
    borderRadius: 9999,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    alignItems: 'center',
  },
  logo: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(49, 140, 231, 0.15)',
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(30, 58, 95, 0.8)',
    backgroundColor: '#0f1c30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 24,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardIcon: {
    marginTop: 1,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 21,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: ACCENT,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  footerBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
  },
});
