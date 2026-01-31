/**
 * Step 9: Blessures et Contraintes
 * Optional text areas for injuries and constraints
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Step9Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const watchedInjuries = watch('injuries') as string[] | undefined;
  const watchedConstraints = watch('personal_constraints') as string | undefined;

  const [injuries, setInjuries] = useState(
    watchedInjuries && watchedInjuries.length > 0 ? watchedInjuries.join('\n') : ''
  );
  const [constraints, setConstraints] = useState(watchedConstraints || '');

  const handleContinue = () => {
    // Map multi-line injuries text to string[] for backend
    const lines = injuries
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0) {
      setValue('injuries', lines);
    } else {
      setValue('injuries', undefined);
    }

    // Personal constraints map directly
    if (constraints.trim().length > 0) {
      setValue('personal_constraints', constraints.trim());
    } else {
      setValue('personal_constraints', undefined);
    }
    router.push('/(questionnaire)/preview');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step8')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
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
              Informations{'\n'}
              <Text style={styles.headlineHighlight}>complémentaires</Text>
            </Text>
            <Text style={styles.subheadline}>
              Ces informations facultatives nous aident à personnaliser davantage votre programme.
            </Text>
          </View>

          {/* Injuries Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Blessure(s) passée(s) ou limitation(s) physique(s){' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Tendinite d'Achille, douleur au genou..."
              placeholderTextColor="#5a7690"
              value={injuries}
              onChangeText={setInjuries}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Constraints Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Contraintes personnelles / professionnelles{' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>
              Ex : travail de nuit, garde d'enfants…
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Partagez vos contraintes pour un plan adapté..."
              placeholderTextColor="#5a7690"
              value={constraints}
              onChangeText={setConstraints}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor="#328ce7"
              cursorColor="#328ce7"
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Terminer</Text>
          <MaterialCommunityIcons name="check" size={20} color="#ffffff" />
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
    marginBottom: 16,
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
  inputSection: {
    marginBottom: 24,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#93adc8',
  },
  inputSubtitle: {
    fontSize: 14,
    color: '#93adc8',
    marginTop: -4,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#1a2632',
    color: '#ffffff',
    fontSize: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344d65',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 120,
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
