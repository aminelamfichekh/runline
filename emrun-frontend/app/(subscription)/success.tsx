import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QUESTIONNAIRE_SESSION_UUID,
  QUESTIONNAIRE_PENDING_ATTACH,
  QUESTIONNAIRE_DRAFT,
  QUESTIONNAIRE_EMAIL,
} from '@/lib/storage/keys';

const SUBSCRIPTION_BG = '#111921';
const CARD_BG = '#1a2632';
const BORDER = '#344d65';
const ACCENT = '#328ce7';
const TEXT_SECONDARY = '#93adc8';

export default function SuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Clear all temporary questionnaire/signup data on success
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
        // Non-critical: stale data will be ignored on next session
      }
    };
    clearTemporaryData();
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressLabel}>Terminé</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-circle" size={72} color={ACCENT} />
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.title}>{t('subscription.success.title')}</Text>
          <Text style={styles.message}>{t('subscription.success.message')}</Text>
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>{t('subscription.success.nextSteps')}</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>{t('subscription.success.step1')}</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>{t('subscription.success.step2')}</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>{t('subscription.success.step3')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {t('subscription.success.continue')}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
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
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 9999,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ACCENT,
  },
  messageContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextStepsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 14,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    paddingTop: 6,
  },
  continueButton: {
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
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
