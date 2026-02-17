/**
 * Step 5: Volume Hebdomadaire
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
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

const generateVolumeOptions = () => {
  const options: { value: number; label: string }[] = [];
  for (let i = 0; i <= 30; i += 5) options.push({ value: i, label: `${i} km` });
  for (let i = 40; i <= 150; i += 10) options.push({ value: i, label: `${i} km` });
  options.push({ value: 160, label: '150+ km' });
  return options;
};

const volumeOptions = generateVolumeOptions();
const DEFAULT_VOLUME_INDEX = 4; // 20km

export default function Step5Screen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step5', primaryGoal);

  // Get saved values from form state
  const savedLastWeekVolume = watch('last_week_volume') as number | undefined;
  const savedTypicalVolume = watch('typical_volume') as number | undefined;
  const watchedCurrentVolume = watch('current_weekly_volume_km') as number | undefined;

  // Initialize state from saved values or defaults
  const initialLastWeek = typeof savedLastWeekVolume === 'number' ? savedLastWeekVolume : 20;
  const initialTypical = typeof savedTypicalVolume === 'number'
    ? savedTypicalVolume
    : (typeof watchedCurrentVolume === 'number' ? watchedCurrentVolume : 30);

  const [lastWeekVolume, setLastWeekVolume] = useState(initialLastWeek);
  const [typicalVolume, setTypicalVolume] = useState(initialTypical);

  // Calculate initial indices based on saved values
  const lastWeekInitialIndex = volumeOptions.findIndex(o => o.value === initialLastWeek);
  const typicalInitialIndex = volumeOptions.findIndex(o => o.value === initialTypical);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = async () => {
    setValue('last_week_volume', lastWeekVolume);
    setValue('typical_volume', typicalVolume);

    let backendVolume = typicalVolume;
    if (backendVolume > 100) {
      backendVolume = 100;
    }
    setValue('current_weekly_volume_km', backendVolume);

    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step6');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step4"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Votre <Text style={styles.headlineHighlight}>volume hebdomadaire</Text>
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à adapter l'intensité de votre programme.
            </Text>
          </View>

          <View style={styles.questionSection}>
            <Text style={styles.questionLabel}>
              Combien de kilomètres avez-vous fait la semaine dernière ?
            </Text>
            <WheelPicker
              data={volumeOptions}
              onValueChange={setLastWeekVolume}
              itemHeight={48}
              wheelHeight={264}
              fontSize={18}
              highlightColor={colors.accent.blue}
              initialIndex={lastWeekInitialIndex >= 0 ? lastWeekInitialIndex : DEFAULT_VOLUME_INDEX}
            />
          </View>

          <View style={styles.questionSection}>
            <Text style={styles.questionLabel}>
              Quel est votre volume hebdomadaire classique ?
            </Text>
            <WheelPicker
              data={volumeOptions}
              onValueChange={setTypicalVolume}
              itemHeight={48}
              wheelHeight={264}
              fontSize={18}
              highlightColor={colors.accent.blue}
              initialIndex={typicalInitialIndex >= 0 ? typicalInitialIndex : DEFAULT_VOLUME_INDEX + 2}
            />
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
    paddingBottom: questionnaireTokens.spacing.xxl,
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    marginBottom: questionnaireTokens.spacing.sm,
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    ...questionnaireTokens.typography.subheadline,
    color: colors.text.secondary,
  },
  questionSection: {
    marginBottom: questionnaireTokens.spacing.xxxl,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: questionnaireTokens.spacing.lg,
    textAlign: 'center',
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
