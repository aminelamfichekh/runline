/**
 * Step 3: Poids / Taille
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

const weightOptions = Array.from({ length: 151 }, (_, i) => 30 + i).map((v) => ({
  value: v,
  label: `${v}`,
}));
const heightOptions = Array.from({ length: 121 }, (_, i) => 130 + i).map((v) => ({
  value: v,
  label: `${v}`,
}));

const DEFAULT_WEIGHT = 70;
const DEFAULT_HEIGHT = 170;

export default function Step3Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step3', primaryGoal);

  const watchedWeightKg = watch('weight_kg') as number | undefined;
  const watchedLegacyWeight = watch('weight') as number | undefined;
  const watchedHeightMeters = watch('height_cm') as number | undefined;
  const watchedLegacyHeight = watch('height') as number | undefined;

  const initialWeight = watchedWeightKg ?? watchedLegacyWeight ?? DEFAULT_WEIGHT;
  const initialHeightCm =
    (typeof watchedHeightMeters === 'number' && watchedHeightMeters > 0
      ? Math.round(watchedHeightMeters * 100)
      : undefined) ?? watchedLegacyHeight ?? DEFAULT_HEIGHT;

  const [selectedWeight, setSelectedWeight] = useState(initialWeight);
  const [selectedHeight, setSelectedHeight] = useState(initialHeightCm);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    // Map to backend physical fields
    setValue('weight_kg', selectedWeight);
    // profileSchema.height_cm actually expects meters between 0.5 and 2.5
    setValue('height_cm', selectedHeight / 100);

    // Conditional routing based on primary_goal from step1
    if (primaryGoal === 'reprendre') {
      router.push('/(questionnaire)/step3a'); // Reprendre - pause + records
    } else if (primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono') {
      router.push('/(questionnaire)/step3b-goal'); // Préparer course - d'abord détails objectif (distance + date)
    } else {
      router.push('/(questionnaire)/step4'); // Normal flow
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step2"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Votre <Text style={styles.headlineHighlight}>morphologie</Text>
            </Text>
            <Text style={styles.subheadline}>
              Ces informations nous aident à personnaliser votre plan d'entraînement.
            </Text>
          </View>

          {/* Weight & Height Pickers */}
          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>POIDS (KG)</Text>
              <WheelPicker
                data={weightOptions}
                onValueChange={setSelectedWeight}
                itemHeight={52}
                wheelHeight={260}
                fontSize={22}
                highlightColor={colors.accent.blue}
                initialIndex={initialWeight - 30}
              />
            </View>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>TAILLE (CM)</Text>
              <WheelPicker
                data={heightOptions}
                onValueChange={setSelectedHeight}
                itemHeight={52}
                wheelHeight={260}
                fontSize={22}
                highlightColor={colors.accent.blue}
                initialIndex={initialHeightCm - 130}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  mainContent: {
    paddingHorizontal: questionnaireTokens.spacing.xxl,
  },
  headlineContainer: {
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: questionnaireTokens.spacing.xxxl,
    alignItems: 'center',
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: questionnaireTokens.spacing.sm,
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    ...questionnaireTokens.typography.subheadline,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: questionnaireTokens.spacing.lg,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: questionnaireTokens.spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: questionnaireTokens.spacing.xxl,
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    backgroundColor: colors.primary.dark,
  },
});
