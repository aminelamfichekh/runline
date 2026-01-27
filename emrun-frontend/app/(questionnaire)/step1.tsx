/**
 * Step 1: Objectif principal
 * Converted from HTML design with NativeWind styling
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type GoalOption = 'start' | 'restart' | 'race' | 'other';

export default function Step1Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(watch('goal') || null);
  const [otherText, setOtherText] = useState(watch('goal_other') || '');

  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
    setValue('goal', goal);
  };

  const handleContinue = () => {
    if (selectedGoal === 'other') {
      setValue('goal_other', otherText);
    }

    // Conditional navigation based on goal
    if (selectedGoal === 'restart') {
      router.push('/(questionnaire)/step2a'); // Pause + records
    } else if (selectedGoal === 'race') {
      router.push('/(questionnaire)/step2b'); // Objectives + records
    } else {
      router.push('/(questionnaire)/step2'); // Normal flow
    }
  };

  const renderOption = (
    value: GoalOption,
    icon: string,
    title: string,
    subtitle: string,
    hasInput = false
  ) => {
    const isSelected = selectedGoal === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() => handleGoalSelect(value)}
        activeOpacity={0.7}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected
        ]}
      >
        <View style={styles.optionContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon as any} size={24} color="#328ce7" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          </View>
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <View style={styles.radioCircleInner} />}
          </View>
        </View>
        {hasInput && isSelected && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Précisez votre objectif..."
              placeholderTextColor="#5a7690"
              value={otherText}
              onChangeText={setOtherText}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Étape 1 sur 9</Text>
            <Text style={styles.progressPercent}>11%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '11%' }]} />
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
              Quel est votre {'\n'}
              <Text style={styles.headlineHighlight}>objectif principal</Text> ?
            </Text>
            <Text style={styles.subheadline}>
              Nous adapterons votre programme d'entraînement en fonction de votre choix.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {renderOption('start', 'run-fast', 'Commencer la course', 'Pour les débutants')}
            {renderOption('restart', 'reload', 'Reprendre la course', 'Après une pause')}
            {renderOption('race', 'trophy', 'Préparer une course', '10k, Semi, Marathon...')}
            {renderOption('other', 'note-edit', 'Autre', '', true)}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={!selectedGoal}
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
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#93adc8',
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#243442',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  inputContainer: {
    marginTop: 12,
    paddingLeft: 56,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#111921',
    color: '#ffffff',
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#344d65',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
