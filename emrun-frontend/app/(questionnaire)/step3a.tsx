/**
 * Step 3a: Reprendre la course - Pause duration + records (CONDITIONAL)
 * Uses FlatList fake wheel for pause duration.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WheelPicker } from '@/components/ui/WheelPicker';

const generatePauseOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let i = 1; i <= 4; i++) {
    options.push({ value: `${i}w`, label: `${i} semaine${i > 1 ? 's' : ''}` });
  }
  for (let i = 1; i <= 11; i++) {
    options.push({ value: `${i}m`, label: `${i} mois` });
  }
  for (let i = 1; i <= 10; i++) {
    options.push({ value: `${i}y`, label: `${i} an${i > 1 ? 's' : ''}` });
  }
  options.push({ value: '10+y', label: '+ de 10 ans' });
  return options;
};

const pauseOptions = generatePauseOptions();
const defaultPause = pauseOptions[8]?.value ?? '2m';

export default function Step3aScreen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedPauseDuration, setSelectedPauseDuration] = useState(watch('pause_duration') || defaultPause);
  const [records, setRecords] = useState(watch('records') || '');

  const handleContinue = () => {
    setValue('pause_duration', selectedPauseDuration);
    setValue('records', records);
    router.push('/(questionnaire)/step4');
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
            <View style={[styles.progressFill, { width: '15%' }]} />
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
                Depuis combien de temps as-tu{'\n'}
                <Text style={styles.headlineHighlight}>arrêté la course</Text> ?
              </Text>
              <Text style={styles.subheadline}>
                Cela nous aide à adapter votre reprise en douceur.
              </Text>
            </View>

            {/* FlatList fake wheel – pause duration */}
            <View style={styles.pickerTriggerWrap}>
              <WheelPicker
                data={pauseOptions}
                onValueChange={setSelectedPauseDuration}
                itemHeight={44}
                wheelHeight={308}
                fontSize={17}
                highlightColor="#328ce7"
              />
            </View>

            {/* Optional Records */}
            <View style={styles.recordsSection}>
              <Text style={styles.recordsLabel}>
                Record(s) personnel(s) <Text style={styles.recordsOptional}>(Optionnel)</Text>
              </Text>
              <Text style={styles.recordsSubtitle}>
                Ex: 5km en 25min, 10km en 55min, Semi en 2h...
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Vos meilleurs temps..."
                placeholderTextColor="#5a7690"
                value={records}
                onChangeText={setRecords}
                multiline
                numberOfLines={3}
                selectionColor="#328ce7"
                cursorColor="#328ce7"
                underlineColorAndroid="transparent"
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
  pickerTriggerWrap: {
    marginBottom: 32,
  },
  recordsSection: {
    gap: 12,
  },
  recordsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  recordsOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#93adc8',
  },
  recordsSubtitle: {
    fontSize: 14,
    color: '#93adc8',
    marginTop: -8,
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
