/**
 * Step 4: Current Running Status
 * current_weekly_volume_km, current_runs_per_week
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { NumberInputField } from '@/components/forms/NumberInputField';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
        <Text style={styles.title}>Statut actuel de course</Text>
        <Text style={styles.subtitle}>
          Aidez-nous à comprendre votre routine de course actuelle.
        </Text>

        <NumberInputField
          label="Volume hebdomadaire actuel"
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
          label="Nombre de sorties par semaine"
          value={watch('current_runs_per_week')}
          options={RUNS_PER_WEEK_OPTIONS}
          onSelect={(value) => setValue('current_runs_per_week', value, { shouldValidate: true })}
          error={errors.current_runs_per_week?.message}
          required
        />
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


