import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    // Navigate to main app (tabs)
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={64} color={colors.accent.blue} />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>{t('subscription.success.title')}</Text>
          <Text style={styles.message}>{t('subscription.success.message')}</Text>
        </View>

        {/* What Happens Next */}
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

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {t('subscription.success.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent.blue,
  },
  messageContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextStepsCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    gap: 16,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
    paddingTop: 6,
  },
  continueButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
