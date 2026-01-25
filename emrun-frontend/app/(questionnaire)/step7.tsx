/**
 * Step 7: Training Locations
 * training_locations, training_location_other (conditional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MultiSelectField } from '@/components/forms/MultiSelectField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <ProgressBar current={currentStep} total={totalSteps} />
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lieux d'entraînement</Text>
        <Text style={styles.subtitle}>
          Où préférez-vous vous entraîner ?
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
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continuer"
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
});


