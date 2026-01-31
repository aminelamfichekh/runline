/**
 * Step 1: Objectif principal
 * Converted from HTML design with NativeWind styling
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type GoalOption = 'start' | 'restart' | 'race' | 'other';

export default function Step1Screen() {
  const router = useRouter();
  const { form, handleFieldChange } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const mapPrimaryToGoal = (value?: string): GoalOption | null => {
    switch (value) {
      case 'me_lancer':
      case 'entretenir':
      case 'ameliorer_condition':
        return 'start';
      case 'reprendre':
        return 'restart';
      case 'courir_race':
      case 'ameliorer_chrono':
        return 'race';
      case 'autre':
        return 'other';
      default:
        return null;
    }
  };

  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(mapPrimaryToGoal(primaryGoal));
  const [otherText, setOtherText] = useState(watch('primary_goal_other') || '');

  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
    // Map UI goal to backend primary_goal enum
    let primary_goal: string | undefined;
    switch (goal) {
      case 'start':
        primary_goal = 'me_lancer';
        break;
      case 'restart':
        primary_goal = 'reprendre';
        break;
      case 'race':
        primary_goal = 'courir_race';
        break;
      case 'other':
        primary_goal = 'autre';
        break;
      default:
        primary_goal = undefined;
    }

    if (primary_goal) {
      handleFieldChange('primary_goal', primary_goal as any);
    }
  };

  const handleContinue = () => {
    if (selectedGoal === 'other') {
      setValue('primary_goal_other', otherText);
    }

    // Everyone goes to step2 first (Email, Name, Sex, Age)
    // Conditional routing happens after step3 (Poids, Taille)
    router.push('/(questionnaire)/step2');
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
          {/* Custom radio indicator on the left */}
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <View style={styles.radioCircleInner} />}
          </View>

          {/* Label */}
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
          </View>

          {/* Trailing icon */}
          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={isSelected ? '#328ce7' : 'rgba(255, 255, 255, 0.2)'}
            style={styles.trailingIcon}
          />
        </View>
        {hasInput && isSelected && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Précisez votre objectif..."
              placeholderTextColor="#5a7690"
              value={otherText}
              onChangeText={setOtherText}
              selectionColor="#328ce7"
              cursorColor="#328ce7"
              underlineColorAndroid="transparent"
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
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          {/* Spacer for symmetry */}
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
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
    paddingVertical: 32,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
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
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  optionCardSelected: {
    borderColor: '#328ce7',
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
    shadowColor: '#328ce7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  trailingIcon: {
    marginLeft: 12,
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
