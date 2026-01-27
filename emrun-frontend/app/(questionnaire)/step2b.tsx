/**
 * Step 2b: Préparer une course - Objectives + records (CONDITIONAL)
 * Shows only if user selects "Me préparer à une/des course(s)"
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Step2bScreen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [objectives, setObjectives] = useState(watch('objectives') || '');
  const [records, setRecords] = useState(watch('records') || '');

  const handleContinue = () => {
    setValue('objectives', objectives);
    setValue('records', records);
    router.push('/(questionnaire)/step2');
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
            <Text style={styles.progressText}>Préparation</Text>
            <Text style={styles.progressPercent}>Info supplémentaire</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '15%' }]} />
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
              Vos <Text style={styles.headlineHighlight}>objectifs de course</Text>
            </Text>
            <Text style={styles.subheadline}>
              Partagez-nous vos objectifs pour créer un plan adapté.
            </Text>
          </View>

          {/* Objectives Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Objectif(s) intermédiaire(s) <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>
              Distance(s) et date(s) à préciser
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 10km en mars, Semi-marathon en mai..."
              placeholderTextColor="#5a7690"
              value={objectives}
              onChangeText={setObjectives}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Records Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Record(s) personnel(s) <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>
              Préciser la distance
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 5km en 25min, 10km en 55min, Semi en 2h..."
              placeholderTextColor="#5a7690"
              value={records}
              onChangeText={setRecords}
              multiline
              numberOfLines={3}
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
    minHeight: 100,
    textAlignVertical: 'top',
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
