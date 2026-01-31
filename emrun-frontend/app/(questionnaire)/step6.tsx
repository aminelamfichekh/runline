/**
 * Step 6: Expérience de Course
 * Uses FlatList fake wheel for experience.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WheelPicker } from '@/components/ui/WheelPicker';

const generateExperienceOptions = () => {
  const options: { value: string; label: string }[] = [{ value: 'beginner', label: 'Je commence' }];
  for (let i = 1; i <= 11; i++) options.push({ value: `${i}m`, label: `${i} mois` });
  for (let i = 1; i <= 10; i++) options.push({ value: `${i}y`, label: `${i} an${i > 1 ? 's' : ''}` });
  options.push({ value: '10+y', label: '+ de 10 ans' });
  return options;
};

const experienceOptions = generateExperienceOptions();

export default function Step6Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const period = watch('running_experience_period') as
    | 'je_commence'
    | '1_11_mois'
    | '1_10_ans'
    | 'plus_10_ans'
    | undefined;
  const months = watch('running_experience_months') as string | undefined;
  const years = watch('running_experience_years') as string | undefined;

  const deriveInitialExperience = (): string => {
    if (period === 'je_commence') return 'beginner';
    if (period === '1_11_mois' && months) return months;
    if (period === '1_10_ans' && years) return years;
    if (period === 'plus_10_ans') return '10+y';
    return experienceOptions[0].value;
  };

  const [selectedExperience, setSelectedExperience] = useState(deriveInitialExperience());

  const handleContinue = () => {
    // Map selectedExperience to backend running_experience_* fields
    if (selectedExperience === 'beginner') {
      setValue('running_experience_period', 'je_commence');
      setValue('running_experience_months', undefined);
      setValue('running_experience_years', undefined);
    } else if (selectedExperience.endsWith('m')) {
      // 1-11 mois
      setValue('running_experience_period', '1_11_mois');
      setValue('running_experience_months', selectedExperience);
      setValue('running_experience_years', undefined);
    } else if (selectedExperience === '10+y') {
      setValue('running_experience_period', 'plus_10_ans');
      setValue('running_experience_months', undefined);
      setValue('running_experience_years', undefined);
    } else if (selectedExperience.endsWith('y')) {
      // 1-10 ans
      setValue('running_experience_period', '1_10_ans');
      setValue('running_experience_years', selectedExperience);
      setValue('running_experience_months', undefined);
    }
    router.push('/(questionnaire)/step7');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step5')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '67%' }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            {/* Question */}
            <View style={styles.headlineContainer}>
              <Text style={styles.headline}>
                Depuis combien de temps{'\n'}
                <Text style={styles.headlineHighlight}>cours-tu de manière régulière</Text> ?
              </Text>
              <Text style={styles.subheadline}>
                Cela nous aide à adapter la progression de votre programme.
              </Text>
            </View>

            {/* FlatList fake wheel – expérience */}
            <View style={styles.pickerTriggerWrap}>
              <WheelPicker
                data={experienceOptions}
                onValueChange={setSelectedExperience}
                itemHeight={44}
                wheelHeight={308}
                fontSize={17}
                highlightColor="#328ce7"
              />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2632',
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#93adc8',
    textAlign: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressPercent: {
    fontSize: 12,
    color: '#93adc8',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#344d65',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328ce7',
    borderRadius: 9999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContentWrapper: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headlineContainer: {
    paddingVertical: 24,
    marginBottom: 16,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    color: '#ffffff',
    marginBottom: 8,
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#93adc8',
  },
  pickerTriggerWrap: {
    marginBottom: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#328ce7',
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
