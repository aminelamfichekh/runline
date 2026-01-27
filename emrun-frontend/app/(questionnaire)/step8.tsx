/**
 * Step 8: Expérience de Course
 * Converted from HTML design with quick options
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ExperienceOption = 'beginner' | 'few_months' | 'few_years' | 'experienced';

export default function Step8Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedExperience, setSelectedExperience] = useState<ExperienceOption | null>(
    watch('experience_level') || null
  );

  const handleContinue = () => {
    setValue('experience_level', selectedExperience);
    router.push('/(questionnaire)/preview');
  };

  const renderQuickOption = (
    value: ExperienceOption,
    icon: string,
    title: string,
    subtitle: string
  ) => {
    const isSelected = selectedExperience === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() => setSelectedExperience(value)}
        activeOpacity={0.7}
        style={[
          styles.quickOption,
          isSelected && styles.quickOptionSelected
        ]}
      >
        <View style={styles.quickOptionIcon}>
          <MaterialCommunityIcons name={icon as any} size={40} color="#328ce7" />
        </View>
        <Text style={styles.quickOptionTitle}>{title}</Text>
        <Text style={styles.quickOptionSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Étape 6</Text>
            <Text style={styles.progressPercent}>75%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Question */}
          <Text style={styles.headline}>
            Depuis combien de temps cours-tu de manière régulière ?
          </Text>

          {/* Quick Options Grid */}
          <View style={styles.quickOptionsGrid}>
            {renderQuickOption(
              'beginner',
              'run',
              'Je commence',
              'Nouveau coureur'
            )}
            {renderQuickOption(
              'few_months',
              'calendar-month',
              'Quelques mois',
              '3-6 mois'
            )}
            {renderQuickOption(
              'few_years',
              'calendar-range',
              'Quelques années',
              '1-3 ans'
            )}
            {renderQuickOption(
              'experienced',
              'star',
              'Expérimenté',
              '3+ ans'
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={!selectedExperience}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#328ce7',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111921',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#cbd5e1',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328ce7',
    borderRadius: 9999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 38,
    color: '#111921',
    textAlign: 'center',
    marginBottom: 32,
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickOption: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quickOptionSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
    borderWidth: 2,
  },
  quickOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111921',
    textAlign: 'center',
  },
  quickOptionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#f6f7f8',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
