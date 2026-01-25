/**
 * Step 3: Race Goal Details (CONDITIONAL)
 * Only shown if primary_goal is 'courir_race' or 'ameliorer_chrono'
 * race_distance, target_race_date, intermediate_objectives, current_race_times
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { SelectField } from '@/components/forms/SelectField';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import type { RaceDistance, CurrentRaceTime } from '@/types/profile';

const RACE_DISTANCE_OPTIONS: { value: RaceDistance; label: string }[] = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: 'semi_marathon', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
];

export default function Step3Screen() {
  const router = useRouter();
  const { t } = useTranslation();
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
          <Text style={styles.title}>{t('onboarding.step3.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step3.description')}
          </Text>

          <SelectField<RaceDistance>
            label={t('onboarding.step2.raceDistance')}
            value={watch('race_distance')}
            options={RACE_DISTANCE_OPTIONS}
            onSelect={(value) => setValue('race_distance', value as RaceDistance, { shouldValidate: true })}
            error={errors.race_distance?.message}
            required
          />

          <DatePickerField
            label={t('onboarding.step3.raceDate')}
            value={watch('target_race_date')}
            onChange={(date) => setValue('target_race_date', date, { shouldValidate: true })}
            error={errors.target_race_date?.message}
            required
            minimumDate={today}
          />

          <TextInputField
            label={t('onboarding.step3.intermediateGoals')}
            value={watch('intermediate_objectives')}
            onChangeText={(text) => setValue('intermediate_objectives', text)}
            error={errors.intermediate_objectives?.message}
            multiline
            numberOfLines={4}
            placeholder={t('onboarding.step3.intermediateGoalsPlaceholder')}
          />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('onboarding.step8.personalRecords')}</Text>
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
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
});

