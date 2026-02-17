/**
 * Step 6: Expérience de Course
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

const generateExperienceOptions = () => {
  const options: { value: string; label: string }[] = [
    { value: 'beginner', label: 'Je commence' },
    { value: 'returning', label: 'Je reprends' },
  ];
  // Add weeks: 1-4 semaines
  for (let i = 1; i <= 4; i++) options.push({ value: `${i}w`, label: `${i} semaine${i > 1 ? 's' : ''}` });
  // Add months: 1-11 mois
  for (let i = 1; i <= 11; i++) options.push({ value: `${i}m`, label: `${i} mois` });
  // Add years: 1-10 ans
  for (let i = 1; i <= 10; i++) options.push({ value: `${i}y`, label: `${i} an${i > 1 ? 's' : ''}` });
  options.push({ value: '10+y', label: '+ de 10 ans' });
  return options;
};

const experienceOptions = generateExperienceOptions();

export default function Step6Screen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step6', primaryGoal);

  const period = watch('running_experience_period') as
    | 'je_commence'
    | 'je_reprends'
    | '1_4_semaines'
    | '1_11_mois'
    | '1_10_ans'
    | 'plus_10_ans'
    | undefined;
  const weeks = watch('running_experience_weeks') as string | undefined;
  const months = watch('running_experience_months') as string | undefined;
  const years = watch('running_experience_years') as string | undefined;

  const deriveInitialExperience = (): string => {
    if (period === 'je_commence') return 'beginner';
    if (period === 'je_reprends') return 'returning';
    if (period === '1_4_semaines' && weeks) return weeks;
    if (period === '1_11_mois' && months) return months;
    if (period === '1_10_ans' && years) return years;
    if (period === 'plus_10_ans') return '10+y';
    return experienceOptions[0].value;
  };

  const initialExperience = deriveInitialExperience();
  const [selectedExperience, setSelectedExperience] = useState(initialExperience);

  // Calculate initial index based on saved value
  const experienceInitialIndex = experienceOptions.findIndex(o => o.value === initialExperience);

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
    // Clear all running experience fields first
    setValue('running_experience_weeks', undefined);
    setValue('running_experience_months', undefined);
    setValue('running_experience_years', undefined);

    if (selectedExperience === 'beginner') {
      setValue('running_experience_period', 'je_commence');
    } else if (selectedExperience === 'returning') {
      setValue('running_experience_period', 'je_reprends');
    } else if (selectedExperience.endsWith('w')) {
      setValue('running_experience_period', '1_4_semaines');
      setValue('running_experience_weeks', selectedExperience);
    } else if (selectedExperience.endsWith('m')) {
      setValue('running_experience_period', '1_11_mois');
      setValue('running_experience_months', selectedExperience);
    } else if (selectedExperience === '10+y') {
      setValue('running_experience_period', 'plus_10_ans');
    } else if (selectedExperience.endsWith('y')) {
      setValue('running_experience_period', '1_10_ans');
      setValue('running_experience_years', selectedExperience);
    }

    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step7');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step5"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Depuis combien de temps{'\n'}
              <Text style={styles.headlineHighlight}>courez-vous régulièrement</Text> ?
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à adapter la progression de votre programme.
            </Text>
          </View>

          <View style={styles.pickerSection}>
            <WheelPicker
              data={experienceOptions}
              onValueChange={setSelectedExperience}
              itemHeight={52}
              wheelHeight={260}
              fontSize={20}
              highlightColor={colors.accent.blue}
              initialIndex={experienceInitialIndex >= 0 ? experienceInitialIndex : 0}
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
  },
  pickerSection: {
    marginBottom: questionnaireTokens.spacing.xxxl,
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
