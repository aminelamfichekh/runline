/**
 * Step 6: Problem to Solve
 * problem_to_solve, problem_to_solve_other (conditional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

const PROBLEM_OPTIONS = [
  { value: 'structure', label: 'Besoin de structure' },
  { value: 'blessure', label: 'Retour de blessure' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'autre', label: 'Autre' },
];

export default function Step6Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, handleFieldChange, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;
  const problemToSolve = watch('problem_to_solve');
  const showOtherField = problemToSolve === 'autre';

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step7');
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
        <Text style={styles.title}>Problème à résoudre</Text>
        <Text style={styles.subtitle}>
          Quel défi cherchez-vous à surmonter ? (Optionnel)
        </Text>

        <SelectField
          label="Problème à résoudre"
          value={problemToSolve}
          options={PROBLEM_OPTIONS}
          onSelect={(value) => handleFieldChange('problem_to_solve', value)}
          error={errors.problem_to_solve?.message}
        />

        {showOtherField && (
          <TextInputField
            label="Veuillez préciser"
            value={watch('problem_to_solve_other')}
            onChangeText={(text) => setValue('problem_to_solve_other', text, { shouldValidate: true })}
            error={errors.problem_to_solve_other?.message}
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


