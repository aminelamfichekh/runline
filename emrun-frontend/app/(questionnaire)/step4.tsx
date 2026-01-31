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

  // Map existing backend value to local frequency option if present
  const currentRunsPerWeek = watch('current_runs_per_week') as
    | '0'
    | '1_2'
    | '3_4'
    | '5_6'
    | '7_plus'
    | undefined;

  const mapBackendToFrequency = (value?: typeof currentRunsPerWeek): FrequencyOption | null => {
    switch (value) {
      case '0':
        return 'none';
      case '1_2':
        return 'little';
      case '3_4':
        return 'much';
      case '5_6':
        return 'passionate';
      case '7_plus':
        return 'crazy';
      default:
        return null;
    }
  };

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(
    mapBackendToFrequency(currentRunsPerWeek)
  );

  const handleContinue = () => {
    // Map UI choice to backend current_runs_per_week enum
    let backendValue: '0' | '1_2' | '3_4' | '5_6' | '7_plus' | undefined;
    switch (selectedFrequency) {
      case 'none':
        backendValue = '0';
        break;
      case 'little':
        backendValue = '1_2';
        break;
      case 'much':
        backendValue = '3_4';
        break;
      case 'passionate':
        backendValue = '5_6';
        break;
      case 'crazy':
        backendValue = '7_plus';
        break;
      default:
        backendValue = undefined;
    }

    if (backendValue) {
      setValue('current_runs_per_week', backendValue);
    }
    router.push('/(questionnaire)/step5');
  };

  const renderOption = (
    value: FrequencyOption,
    icon: string,
    title: string,
    subtitle: string
  ) => {
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
          {/* Left: icon + texts */}
          <View style={styles.optionLeft}>
            <View
              style={[
                styles.optionIconContainer,
                isSelected && styles.optionIconContainerSelected,
              ]}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={22}
                color={isSelected ? '#328ce7' : '#93adc8'}
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.optionTitle,
                  isSelected && styles.optionTitleSelected,
                ]}
              >
                {title}
              </Text>
              <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* Right: circular check indicator */}
          <View
            style={[
              styles.checkCircle,
              isSelected && styles.checkCircleSelected,
            ]}
          >
            {isSelected && (
              <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
            )}
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
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step3')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
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
              Votre <Text style={styles.headlineHighlight}>fréquence</Text> de course
            </Text>
            <Text style={styles.subheadline}>
              Combien de fois courez-vous par semaine ? Ces informations nous aident à adapter votre programme.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {renderOption('little', 'emoji-people', 'Un peu', '1-2 fois par semaine')}
            {renderOption('much', 'run-fast', 'Beaucoup', '3-4 fois par semaine')}
            {renderOption('passionate', 'speedometer', 'Passionnément', '5-6 fois par semaine')}
            {renderOption('crazy', 'fire', 'A la folie', '7+ fois par semaine')}
            {renderOption('none', 'block-helper', 'Pas du tout', '0 - Je débute')}
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
    bottom: 0,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#344d65',
    backgroundColor: 'rgba(26, 35, 45, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionCardSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    shadowColor: '#328ce7',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#111a22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconContainerSelected: {
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  optionTitleSelected: {
    color: '#328ce7',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#93adc8',
    marginTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5a7690',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    borderColor: '#328ce7',
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
