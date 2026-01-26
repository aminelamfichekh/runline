/**
 * Step 1: Objectif principal
 * Includes conditional fields for race preparation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { TextInputField } from '@/components/forms/TextInputField';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

const GOAL_OPTIONS = [
  { value: 'commencer', label: 'Commencer la course à pied' },
  { value: 'reprendre', label: 'Reprendre la course à pied' },
  { value: 'preparer_course', label: 'Me préparer à une/des course(s)' },
  { value: 'autre', label: 'Autre' },
];

const DISTANCE_OPTIONS = [
  { value: '5km', label: '5 km' },
  { value: '10km', label: '10 km' },
  { value: 'semi', label: 'Semi-marathon' },
  { value: 'marathon', label: 'Marathon' },
  { value: 'autre', label: 'Autre' },
];

export default function Step1Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primary_goal = watch('primary_goal');
  const showRaceFields = primary_goal === 'preparer_course';
  const showOtherField = primary_goal === 'autre';
  const showRecordsField = primary_goal === 'reprendre' || primary_goal === 'preparer_course';

  const handleContinue = () => {
    router.push('/(questionnaire)/step2');
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>1/10</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
          <Text style={styles.required}>({t('onboarding.step1.required')})</Text>

          {/* Goal Selection */}
          <View style={styles.optionsContainer}>
            {GOAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  primary_goal === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setValue('primary_goal', option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    primary_goal === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditional: Autre text field */}
          {showOtherField && (
            <TextInputField
              label={t('onboarding.step1.autreLabel')}
              value={watch('primary_goal_other')}
              onChangeText={(text) => setValue('primary_goal_other', text)}
              placeholder={t('onboarding.step1.autrePlaceholder')}
              multiline
            />
          )}

          {/* Conditional: Race distance */}
          {showRaceFields && (
            <>
              <Text style={styles.sectionLabel}>{t('onboarding.step1.distanceLabel')}</Text>
              <View style={styles.optionsContainer}>
                {DISTANCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      watch('race_distance') === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setValue('race_distance', option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        watch('race_distance') === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Race date */}
              <DatePickerField
                label={t('onboarding.step1.dateLabel')}
                value={watch('race_date')}
                onChange={(date) => setValue('race_date', date)}
                placeholder={t('onboarding.step1.datePlaceholder')}
              />

              {/* Intermediate goals */}
              <TextInputField
                label={t('onboarding.step1.objectifsIntermediairesLabel')}
                value={watch('objectifs_intermediaires')}
                onChangeText={(text) => setValue('objectifs_intermediaires', text)}
                placeholder={t('onboarding.step1.objectifsIntermediairesPlaceholder')}
                multiline
                optional
              />
            </>
          )}

          {/* Conditional: Personal records */}
          {showRecordsField && (
            <TextInputField
              label={t('onboarding.step1.recordsLabel')}
              value={watch('records')}
              onChangeText={(text) => setValue('records', text)}
              placeholder={t('onboarding.step1.recordsPlaceholder')}
              multiline
              optional
            />
          )}

          {/* Email */}
          <TextInputField
            label={t('onboarding.step1.emailLabel')}
            value={watch('email')}
            onChangeText={(text) => setValue('email', text)}
            placeholder={t('onboarding.step1.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.continue')}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary.medium,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '300',
  },
  stepIndicator: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text.secondary,
    fontSize: 28,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.accent.blue,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  required: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  optionButtonSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: `${colors.accent.blue}15`,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.accent.blue,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
    backgroundColor: colors.primary.dark,
  },
});
