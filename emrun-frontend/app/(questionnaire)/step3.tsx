/**
 * Step 3: Race Goal Details (CONDITIONAL)
 * Only shown if primary_goal is 'courir_race' or 'ameliorer_chrono'
 * race_distance, target_race_date, intermediate_objectives, current_race_times
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { RaceDistance, CurrentRaceTime } from '@/types/profile';

const RACE_DISTANCE_OPTIONS: { value: RaceDistance; label: string }[] = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: 'semi_marathon', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
];

export default function Step3Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, nextStep, prevStep, isStepValid, primaryGoal, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors } } = form;
  const [raceTimes, setRaceTimes] = useState<CurrentRaceTime[]>(watch('current_race_times') || []);

  // If not a race goal, redirect
  if (primaryGoal !== 'courir_race' && primaryGoal !== 'ameliorer_chrono') {
    router.replace('/(questionnaire)/step4');
    return null;
  }

  const addRaceTime = () => {
    const newTime: CurrentRaceTime = { distance: '', time: '' };
    const updated = [...raceTimes, newTime];
    setRaceTimes(updated);
    setValue('current_race_times', updated);
  };

  const updateRaceTime = (index: number, field: 'distance' | 'time', value: string) => {
    const updated = [...raceTimes];
    updated[index] = { ...updated[index], [field]: value };
    setRaceTimes(updated);
    setValue('current_race_times', updated);
  };

  const removeRaceTime = (index: number) => {
    const updated = raceTimes.filter((_, i) => i !== index);
    setRaceTimes(updated);
    setValue('current_race_times', updated.length > 0 ? updated : undefined);
  };

  const onSubmit = () => {
    if (isStepValid(currentStep)) {
      nextStep();
      router.replace('/(questionnaire)/step4');
    }
  };

  const handleBack = () => {
    prevStep();
    const previousRoute = getPreviousStepRoute();
    if (previousRoute) {
      router.replace(previousRoute);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
        <Text style={styles.title}>Détails de la course</Text>
        <Text style={styles.subtitle}>
          Parlez-nous de votre objectif de course pour créer un plan d'entraînement ciblé.
        </Text>

        <SelectField<RaceDistance>
          label="Distance de la course"
          value={watch('race_distance')}
          options={RACE_DISTANCE_OPTIONS}
          onSelect={(value) => setValue('race_distance', value as RaceDistance, { shouldValidate: true })}
          error={errors.race_distance?.message}
          required
        />

        <DatePickerField
          label="Date de l'objectif"
          value={watch('target_race_date')}
          onChange={(date) => setValue('target_race_date', date, { shouldValidate: true })}
          error={errors.target_race_date?.message}
          required
          minimumDate={today}
        />

        <TextInputField
          label="Objectif(s) intermédiaire(s) (Optionnel)"
          value={watch('intermediate_objectives')}
          onChangeText={(text) => setValue('intermediate_objectives', text)}
          error={errors.intermediate_objectives?.message}
          multiline
          numberOfLines={4}
          placeholder="ex: Courir 5km sans m'arrêter"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record(s) personnel(s) (Optionnel)</Text>
          <Text style={styles.sectionSubtitle}>
            Ajoutez vos meilleurs temps actuels pour nous aider à suivre votre progression.
          </Text>

          {raceTimes.map((raceTime, index) => (
            <View key={index} style={styles.raceTimeContainer}>
              <View style={styles.raceTimeRow}>
                <View style={styles.raceTimeInputHalf}>
                  <TextInputField
                    label="Distance"
                    value={raceTime.distance}
                    onChangeText={(text) => updateRaceTime(index, 'distance', text)}
                    placeholder="ex: 5km"
                  />
                </View>
                <View style={styles.raceTimeInputHalf}>
                  <TextInputField
                    label="Temps"
                    value={raceTime.time}
                    onChangeText={(text) => updateRaceTime(index, 'time', text)}
                    placeholder="ex: 25:00"
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeRaceTime(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Button
            title="Ajouter un temps"
            onPress={addRaceTime}
            variant="secondary"
            style={styles.addButton}
          />
        </View>
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
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  raceTimeContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  raceTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  raceTimeInputHalf: {
    flex: 1,
  },
  removeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  addButton: {
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
});

