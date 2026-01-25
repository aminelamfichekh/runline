/**
 * Step 7: Training Locations
 * training_locations, training_location_other (conditional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MultiSelectField } from '@/components/forms/MultiSelectField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import type { TrainingLocation } from '@/types/profile';

const TRAINING_LOCATION_OPTIONS: { value: TrainingLocation; label: string }[] = [
  { value: 'route', label: 'Route' },
  { value: 'chemins', label: 'Chemins' },
  { value: 'piste', label: 'Piste' },
  { value: 'tapis', label: 'Tapis' },
  { value: 'autre', label: 'Autre' },
];

export default function Step7Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, handleFieldChange, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;
  const trainingLocations = watch('training_locations') || [];
  const showOtherField = trainingLocations.includes('autre');

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step8');
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
          <Text style={styles.title}>{t('onboarding.step7.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step7.description')}
          </Text>

          <MultiSelectField
            label="Lieux d'entraînement disponibles"
            values={trainingLocations}
            options={TRAINING_LOCATION_OPTIONS as any}
            onChange={(values) => handleFieldChange('training_locations', values)}
            error={errors.training_locations?.message}
            required
            minSelections={1}
          />

          {showOtherField && (
            <TextInputField
              label="Veuillez préciser le lieu d'entraînement"
              value={watch('training_location_other')}
              onChangeText={(text) => setValue('training_location_other', text, { shouldValidate: true })}
              error={errors.training_location_other?.message}
              required
              placeholder={t('onboarding.step7.otherPlaceholder')}
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
