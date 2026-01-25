/**
 * Step 2: Primary Goal
 * primary_goal, primary_goal_other (conditional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
        <Text style={styles.title}>Quel est votre objectif principal ?</Text>
        <Text style={styles.subtitle}>
          Cela nous aide à créer un plan d'entraînement adapté à vos objectifs.
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
            label="Quelle distance ?"
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

