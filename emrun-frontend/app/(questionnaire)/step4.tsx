/**
 * Step 4: Nombre de sorties actuelles par semaine
 * Converted from HTML design with radio selection
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FrequencyOption = 'none' | 'little' | 'much' | 'passionate' | 'crazy';

export default function Step4Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(
    watch('training_frequency') || null
  );

  const handleContinue = () => {
    setValue('training_frequency', selectedFrequency);
    router.push('/(questionnaire)/step5');
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
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

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
            <Text style={styles.progressText}>Étape 4 sur 9</Text>
            <Text style={styles.progressPercent}>44%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '44%' }]} />
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
              Nombre actuel de{'\n'}
              <Text style={styles.headlineHighlight}>sorties par semaine</Text>
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à calibrer votre plan d'entraînement initial.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {renderOption('none', 'Pas du tout', '0')}
            {renderOption('little', 'Un peu', '1/2')}
            {renderOption('much', 'Beaucoup', '3/4')}
            {renderOption('passionate', 'Passionnément', '5/6')}
            {renderOption('crazy', 'A la folie', '7 ou +')}
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
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
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
    backgroundColor: '#1a2632',
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#93adc8',
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressPercent: {
    fontSize: 12,
    color: '#93adc8',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#344d65',
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
    paddingTop: 8,
  },
  headlineContainer: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    color: '#ffffff',
    marginBottom: 8,
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#93adc8',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344d65',
    backgroundColor: '#1a2632',
    padding: 16,
  },
  optionCardSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#93adc8',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5a7690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
  },
  radioCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#328ce7',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
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
    gap: 8,
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
