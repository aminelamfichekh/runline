/**
 * Step 4: Jours disponibles (multiple selection)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

const DAYS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
];

export default function Step4Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const available_days = watch('available_days') || [];

  const toggleDay = (day: string) => {
    const current = available_days as string[];
    if (current.includes(day)) {
      setValue('available_days', current.filter(d => d !== day));
    } else {
      setValue('available_days', [...current, day]);
    }
  };

  const handleContinue = () => {
    router.push('/(questionnaire)/step5');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>4/10</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.title}>{t('onboarding.step4.title')}</Text>
          <Text style={styles.required}>({t('onboarding.step4.required')})</Text>
          <Text style={styles.subtitle}>{t('onboarding.step4.subtitle')}</Text>

          <View style={styles.optionsContainer}>
            {DAYS.map((day) => {
              const isSelected = available_days.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => toggleDay(day.value)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('onboarding.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.dark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.primary.medium },
  backButtonText: { color: colors.text.primary, fontSize: 24, fontWeight: '300' },
  stepIndicator: { fontSize: 15, fontWeight: '600', color: colors.text.secondary },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { color: colors.text.secondary, fontSize: 28, fontWeight: '300' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  stepNumber: { fontSize: 48, fontWeight: '800', color: colors.accent.blue, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  required: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.text.secondary, marginBottom: 24 },
  optionsContainer: { gap: 12 },
  dayButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.background.card, borderWidth: 2, borderColor: colors.border.medium },
  dayButtonSelected: { borderColor: colors.accent.blue, backgroundColor: `${colors.accent.blue}15` },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border.medium, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: colors.accent.blue, borderColor: colors.accent.blue },
  checkmark: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  dayText: { fontSize: 16, fontWeight: '500', color: colors.text.primary },
  dayTextSelected: { color: colors.accent.blue, fontWeight: '600' },
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border.medium, backgroundColor: colors.primary.dark },
});
