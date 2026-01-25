/**
 * Step 1: Basic Information
 * first_name, last_name, birth_date, gender, height_cm, weight_kg
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { TextInputField } from '@/components/forms/TextInputField';
import { NumberInputField } from '@/components/forms/NumberInputField';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

export default function Step1Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid } = useQuestionnaireForm();

  const { formState: { errors }, setValue, watch } = form;

  const gender = watch('gender');

  // Max date: today (can't be born in the future)
  const maxDate = new Date();

  // Min date: 120 years ago (reasonable maximum age)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step2');
    }
  };

  const handleBack = () => {
    prevStep();
    router.replace('/');
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
          <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step1.description')}
          </Text>

          <TextInputField
            label={t('onboarding.step1.firstName')}
            value={watch('first_name')}
            onChangeText={(text) => setValue('first_name', text, { shouldValidate: true })}
            error={errors.first_name?.message}
            required
            autoCapitalize="words"
            placeholder="Entrez votre prénom"
          />

          <TextInputField
            label={t('onboarding.step1.lastName')}
            value={watch('last_name')}
            onChangeText={(text) => setValue('last_name', text, { shouldValidate: true })}
            error={errors.last_name?.message}
            required
            autoCapitalize="words"
            placeholder="Entrez votre nom"
          />

          <DatePickerField
            label={t('onboarding.step1.birthDate')}
            value={watch('birth_date')}
            onChange={(date) => setValue('birth_date', date, { shouldValidate: true })}
            error={errors.birth_date?.message}
            required
            minimumDate={minDate}
            maximumDate={maxDate}
          />

          <SelectField
            label={t('onboarding.step1.gender')}
            value={gender}
            options={[
              { value: 'male', label: t('onboarding.step1.male') },
              { value: 'female', label: t('onboarding.step1.female') },
              { value: 'other', label: t('onboarding.step1.other') },
            ]}
            onSelect={(value) => setValue('gender', value, { shouldValidate: true })}
            error={errors.gender?.message}
            required
          />

          <NumberInputField
            label={t('onboarding.step1.height')}
            value={watch('height_cm')}
            onChange={(value) => setValue('height_cm', value ?? 0, { shouldValidate: true })}
            error={errors.height_cm?.message}
            required
            min={0.5}
            max={2.5}
            step={0.01}
            unit="m"
          />

          <NumberInputField
            label={t('onboarding.step1.weight')}
            value={watch('weight_kg')}
            onChange={(value) => setValue('weight_kg', value ?? 0, { shouldValidate: true })}
            error={errors.weight_kg?.message}
            required
            min={20}
            max={300}
            unit="kg"
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
