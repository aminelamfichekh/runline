/**
 * Step 9: Summary/Confirmation
 * Review all entered information before proceeding to preview
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { colors } from '@/constants/colors';

export default function Step9Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form, currentStep, totalSteps, prevStep, isComplete } = useQuestionnaireForm();

  const values = form.getValues();

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const handleContinue = () => {
    if (isComplete) {
      router.push('/(questionnaire)/preview');
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
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
          <Text style={styles.title}>{t('onboarding.step9.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.step9.description')}
          </Text>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.personalInfo')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom:</Text>
              <Text style={styles.infoValue}>{values.first_name} {values.last_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date de naissance:</Text>
              <Text style={styles.infoValue}>{formatDate(values.birth_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Taille / Poids:</Text>
              <Text style={styles.infoValue}>{values.height_cm} cm / {values.weight_kg} kg</Text>
            </View>
          </View>

          {/* Goal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.goal')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Objectif:</Text>
              <Text style={styles.infoValue}>{values.primary_goal || '-'}</Text>
            </View>
            {values.race_distance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distance:</Text>
                <Text style={styles.infoValue}>{values.race_distance}</Text>
              </View>
            )}
            {values.target_race_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date de course:</Text>
                <Text style={styles.infoValue}>{formatDate(values.target_race_date)}</Text>
              </View>
            )}
          </View>

          {/* Current Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.currentActivity')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Volume hebdomadaire:</Text>
              <Text style={styles.infoValue}>{values.current_weekly_volume_km || 0} km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sorties par semaine:</Text>
              <Text style={styles.infoValue}>{values.current_runs_per_week || '-'}</Text>
            </View>
          </View>

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.experience')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expérience:</Text>
              <Text style={styles.infoValue}>{values.running_experience_period || '-'}</Text>
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.availability')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jours disponibles:</Text>
              <Text style={styles.infoValue}>
                {values.available_days?.join(', ') || '-'}
              </Text>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.step9.preferences')}</Text>
            {values.training_locations && values.training_locations.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lieux d'entraînement:</Text>
                <Text style={styles.infoValue}>{values.training_locations.join(', ')}</Text>
              </View>
            )}
            {values.problem_to_solve && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Problème à résoudre:</Text>
                <Text style={styles.infoValue}>{values.problem_to_solve}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.continue')}
          onPress={handleContinue}
          disabled={!isComplete}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: colors.primary.dark,
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary.medium,
  },
  closeButtonText: {
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.text.secondary,
    marginBottom: 40,
    fontWeight: '400',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.primary.medium,
    backgroundColor: colors.primary.dark,
  },
});
