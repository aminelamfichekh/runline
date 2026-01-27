/**
 * Step 6: Fréquence d'Entraînement
 * Converted from HTML design with radio selection
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FrequencyOption = 'little' | 'much' | 'passionate' | 'crazy' | 'none';

export default function Step6Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(
    watch('training_frequency') || null
  );

  const handleContinue = () => {
    setValue('training_frequency', selectedFrequency);
    router.push('/(questionnaire)/step7');
  };

  const renderOption = (value: FrequencyOption, title: string, subtitle: string) => {
    const isSelected = selectedFrequency === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() => setSelectedFrequency(value)}
        activeOpacity={0.7}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected
        ]}
      >
        <View style={styles.optionContent}>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          </View>
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <View style={styles.radioCircleInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Étape 4</Text>
            <Text style={styles.progressPercent}>4/10</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
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
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Nombre actuel de sorties par semaine
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à calibrer votre plan d'entraînement initial.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {renderOption('little', 'Un peu', '1 ou 2 fois')}
            {renderOption('much', 'Beaucoup', '3 ou 4 fois')}
            {renderOption('passionate', 'Passionnément', '5 ou 6 fois')}
            {renderOption('crazy', 'A la folie', '7 fois ou plus')}
            {renderOption('none', 'Pas du tout', '0 fois (Débutant)')}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={!selectedFrequency}
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
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111921',
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#111921',
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111921',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#1d2936',
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
  },
  headlineContainer: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: '#111921',
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
    fontWeight: '300',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1d2936',
    backgroundColor: 'rgba(29, 41, 54, 0.3)',
    padding: 20,
  },
  optionCardSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111921',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#328ce7',
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#328ce7',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    shadowColor: 'rgba(50, 140, 231, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
