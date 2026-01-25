/**
 * Step 4: Current Running Status
 * current_weekly_volume_km, current_runs_per_week
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { NumberInputField } from '@/components/forms/NumberInputField';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import type { CurrentRunsPerWeek } from '@/types/profile';

const RUNS_PER_WEEK_OPTIONS: { value: CurrentRunsPerWeek; label: string }[] = [
  { value: '0', label: 'Pas du tout (0)' },
  { value: '1_2', label: 'Un peu (1/2)' },
  { value: '3_4', label: 'Beaucoup (3/4)' },
  { value: '5_6', label: 'Passionnément (5/6)' },
  { value: '7_plus', label: 'A la folie (7 ou +)' },
];

export default function Step4Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step4a');
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
          <Text style={styles.title}>{t('onboarding.step4.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step4.description')}
          </Text>

          <NumberInputField
            label={t('onboarding.step4.weeklyVolume')}
            value={watch('current_weekly_volume_km')}
            onChange={(value) => setValue('current_weekly_volume_km', value ?? 0, { shouldValidate: true })}
            error={errors.current_weekly_volume_km?.message}
            required
            min={0}
            max={100}
            step={5}
            unit="km/sem"
            helperText="Doit être un multiple de 5 (0-100km)"
          />

          <SelectField
            label={t('onboarding.step4.runsPerWeek')}
            value={watch('current_runs_per_week')}
            options={RUNS_PER_WEEK_OPTIONS}
            onSelect={(value) => setValue('current_runs_per_week', value, { shouldValidate: true })}
            error={errors.current_runs_per_week?.message}
            required
          />
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
