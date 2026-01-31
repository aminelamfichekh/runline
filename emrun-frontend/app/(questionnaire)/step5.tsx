/**
 * Step 5: Volume Hebdomadaire
 * Uses FlatList fake wheels for weekly volume.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WheelPicker } from '@/components/ui/WheelPicker';

const generateVolumeOptions = () => {
  const options: { value: number; label: string }[] = [];
  for (let i = 0; i <= 30; i += 5) options.push({ value: i, label: `${i} km` });
  for (let i = 40; i <= 150; i += 10) options.push({ value: i, label: `${i} km` });
  options.push({ value: 160, label: '150+ km' });
  return options;
};

const volumeOptions = generateVolumeOptions();

export default function Step5Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const watchedCurrentVolume = watch('current_weekly_volume_km') as number | undefined;
  const [lastWeekVolume, setLastWeekVolume] = useState(20);
  const [typicalVolume, setTypicalVolume] = useState(
    typeof watchedCurrentVolume === 'number' ? watchedCurrentVolume : 30
  );

  const handleContinue = () => {
    // Optional additional fields for personalization
    setValue('last_week_volume', lastWeekVolume);
    setValue('typical_volume', typicalVolume);

    // Map "typical" volume to backend current_weekly_volume_km
    let backendVolume = typicalVolume;
    if (backendVolume > 100) {
      backendVolume = 100; // schema caps at 100
    }
    setValue('current_weekly_volume_km', backendVolume);
    router.push('/(questionnaire)/step6');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step4')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '56%' }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            {/* Headline */}
            <View style={styles.headlineContainer}>
              <Text style={styles.headline}>
                Votre <Text style={styles.headlineHighlight}>volume hebdomadaire</Text>
              </Text>
              <Text style={styles.subheadline}>
                Cela nous aide à adapter l'intensité de votre programme.
              </Text>
            </View>

            {/* First Question – FlatList fake wheel */}
            <View style={styles.questionSection}>
              <Text style={styles.questionLabel}>
                Combien de kilomètres as-tu fait la semaine dernière ?
              </Text>
              <WheelPicker
                data={volumeOptions}
                selectedValue={lastWeekVolume}
                onValueChange={setLastWeekVolume}
                itemHeight={44}
                wheelHeight={308}
                fontSize={17}
                highlightColor="#328ce7"
              />
            </View>

            {/* Second Question – FlatList fake wheel */}
            <View style={styles.questionSection}>
              <Text style={styles.questionLabel}>
                Quel est ton volume hebdomadaire classique ?
              </Text>
              <WheelPicker
                data={volumeOptions}
                onValueChange={setTypicalVolume}
                itemHeight={44}
                wheelHeight={308}
                fontSize={17}
                highlightColor="#328ce7"
              />
            </View>
          </View>
        </ScrollView>
      </View>

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
  mainContentWrapper: {
    flex: 1,
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
  questionSection: {
    marginBottom: 32,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
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
