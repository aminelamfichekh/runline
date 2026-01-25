/**
 * Step 5: Running Experience
 * running_experience_period, running_experience_months, running_experience_years
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { OptionWheelPicker } from '@/components/forms/OptionWheelPicker';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

const EXPERIENCE_OPTIONS: { value: 'je_commence' | '1_11_mois' | '1_10_ans' | 'plus_10_ans'; label: string }[] = [
  { value: 'je_commence', label: 'Je commence' },
  { value: '1_11_mois', label: '1 mois à 11 mois' },
  { value: '1_10_ans', label: '1 an à 10 ans' },
  { value: 'plus_10_ans', label: '+ de 10 ans' },
];

// Generate month options (1-11)
const MONTH_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1} mois`,
}));

// Generate year options (1-10)
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1} an${i + 1 > 1 ? 's' : ''}`,
}));

export default function Step5Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;
  const experiencePeriod = watch('running_experience_period');
  const showMonthsPicker = experiencePeriod === '1_11_mois';
  const showYearsPicker = experiencePeriod === '1_10_ans';

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step6');
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
          <Text style={styles.title}>{t('onboarding.step5.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step5.description')}
          </Text>

          <SelectField
            label="Période d'expérience"
            value={watch('running_experience_period')}
            options={EXPERIENCE_OPTIONS}
            onSelect={(value) => {
              setValue('running_experience_period', value, { shouldValidate: true });
              // Reset specific values when changing period
              if (value !== '1_11_mois') setValue('running_experience_months', undefined);
              if (value !== '1_10_ans') setValue('running_experience_years', undefined);
            }}
            error={errors.running_experience_period?.message}
            required
          />

          {showMonthsPicker && (
            <OptionWheelPicker
              label={t('onboarding.step5.months')}
              value={watch('running_experience_months')}
              options={MONTH_OPTIONS}
              onSelect={(value) => setValue('running_experience_months', value, { shouldValidate: true })}
              error={errors.running_experience_months?.message}
              required
            />
          )}

          {showYearsPicker && (
            <OptionWheelPicker
              label={t('onboarding.step5.years')}
              value={watch('running_experience_years')}
              options={YEAR_OPTIONS}
              onSelect={(value) => setValue('running_experience_years', value, { shouldValidate: true })}
              error={errors.running_experience_years?.message}
              required
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
