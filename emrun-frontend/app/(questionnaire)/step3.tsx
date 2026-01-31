/**
 * Step 3: Poids / Taille
 * Uses unified WheelPicker for weight and height.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WheelPicker } from '@/components/ui/WheelPicker';

const weightOptions = Array.from({ length: 151 }, (_, i) => 30 + i).map((v) => ({
  value: v,
  label: `${v} kg`,
}));
const heightOptions = Array.from({ length: 121 }, (_, i) => 130 + i).map((v) => ({
  value: v,
  label: `${v} cm`,
}));

export default function Step3Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const watchedWeightKg = watch('weight_kg') as number | undefined;
  const watchedLegacyWeight = watch('weight') as number | undefined;
  const watchedHeightMeters = watch('height_cm') as number | undefined;
  const watchedLegacyHeight = watch('height') as number | undefined;

  const initialWeight = watchedWeightKg ?? watchedLegacyWeight ?? 70;
  const initialHeightCm =
    (typeof watchedHeightMeters === 'number' && watchedHeightMeters > 0
      ? Math.round(watchedHeightMeters * 100)
      : undefined) ?? watchedLegacyHeight ?? 170;

  const [selectedWeight, setSelectedWeight] = useState(initialWeight);
  const [selectedHeight, setSelectedHeight] = useState(initialHeightCm);

  const handleContinue = () => {
    // Map to backend physical fields
    setValue('weight_kg', selectedWeight);
    // profileSchema.height_cm actually expects meters between 0.5 and 2.5
    setValue('height_cm', selectedHeight / 100);

    // Conditional routing based on primary_goal from step1
    const primaryGoal = watch('primary_goal') as string | undefined;
    if (primaryGoal === 'reprendre') {
      router.push('/(questionnaire)/step3a'); // Reprendre - pause + records
    } else if (primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono') {
      router.push('/(questionnaire)/step3b'); // Préparer course - objectives + records
    } else {
      router.push('/(questionnaire)/step4'); // Normal flow
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step2')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
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
          {/* Question */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Votre <Text style={styles.headlineHighlight}>morphologie</Text>
            </Text>
            <Text style={styles.subheadline}>
              Ces informations nous aident à personnaliser votre plan d&apos;entraînement.
            </Text>
          </View>

          {/* FlatList fake wheels – Poids & Taille */}
          <View style={styles.pickerRow}>
            <View style={styles.pickerHalf}>
              <Text style={styles.pickerTriggerLabel}>Poids (kg)</Text>
              <WheelPicker
                data={weightOptions}
                onValueChange={setSelectedWeight}
                itemHeight={40}
                wheelHeight={200}
                fontSize={15}
                highlightColor="#328ce7"
              />
            </View>
            <View style={styles.pickerHalf}>
              <Text style={styles.pickerTriggerLabel}>Taille (cm)</Text>
              <WheelPicker
                data={heightOptions}
                onValueChange={setSelectedHeight}
                itemHeight={40}
                wheelHeight={200}
                fontSize={15}
                highlightColor="#328ce7"
              />
            </View>
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
    alignItems: 'center',
  },
  headline: {
    fontSize: 30,
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
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  pickerHalf: {
    flex: 1,
    gap: 8,
  },
  pickerTriggerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase' as any,
    color: '#587a9a',
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
