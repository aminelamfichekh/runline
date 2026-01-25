/**
 * Step 2: Primary Goal
 * primary_goal, primary_goal_other (conditional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

const PRIMARY_GOAL_OPTIONS = [
  { value: 'me_lancer', label: 'Me lancer dans la course à pied' },
  { value: 'reprendre', label: 'Reprendre la course à pied' },
  { value: 'entretenir', label: 'Entretenir ma forme' },
  { value: 'ameliorer_condition', label: 'Améliorer ma condition physique générale' },
  { value: 'courir_race', label: 'Courir une course' },
  { value: 'ameliorer_chrono', label: 'Améliorer mon chrono' },
  { value: 'autre', label: 'Autre' },
];

const RACE_DISTANCE_OPTIONS = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: 'semi_marathon', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'autre', label: 'Autre' },
];

export default function Step2Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, handleFieldChange, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;
  const primaryGoal = watch('primary_goal');
  const showOtherField = primaryGoal === 'autre';
  const showRaceDistanceField = primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono';

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      // If race goal, go to step 3 (race details), otherwise skip to step 4
      if (primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono') {
        router.replace('/(questionnaire)/step3');
      } else {
        router.replace('/(questionnaire)/step4');
      }
    }
  };

  const handleBack = () => {
    prevStep();
    const previousRoute = getPreviousStepRoute();
    if (previousRoute) {
      router.replace(previousRoute);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.step2.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step2.description')}
          </Text>

          <SelectField
            label="Objectif principal"
            value={primaryGoal}
            options={PRIMARY_GOAL_OPTIONS}
            onSelect={(value) => handleFieldChange('primary_goal', value)}
            error={errors.primary_goal?.message}
            required
          />

          {showRaceDistanceField && (
            <SelectField
              label={t('onboarding.step2.raceDistance')}
              value={watch('race_distance')}
              options={RACE_DISTANCE_OPTIONS}
              onSelect={(value) => setValue('race_distance', value, { shouldValidate: true })}
              error={errors.race_distance?.message}
              required
            />
          )}

          {showOtherField && (
            <TextInputField
              label="Veuillez préciser votre objectif principal"
              value={watch('primary_goal_other')}
              onChangeText={(text) => setValue('primary_goal_other', text, { shouldValidate: true })}
              error={errors.primary_goal_other?.message}
              required
              multiline
              numberOfLines={3}
              placeholder={t('onboarding.step2.otherPlaceholder')}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.continue')}
          onPress={onSubmit}
          disabled={!isStepValid(currentStep)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: '#0a0a0a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#999',
    marginBottom: 40,
    fontWeight: '400',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
});

