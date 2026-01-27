/**
 * Step 2a: Reprendre la course - Pause duration + records (CONDITIONAL)
 * Shows only if user selects "Reprendre la course à pied"
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ITEM_HEIGHT = 56;

// Generate pause duration options
const generatePauseOptions = () => {
  const options = [];

  // 1-4 semaines
  for (let i = 1; i <= 4; i++) {
    options.push({ value: `${i}w`, label: `${i} semaine${i > 1 ? 's' : ''}` });
  }

  // 1-11 mois
  for (let i = 1; i <= 11; i++) {
    options.push({ value: `${i}m`, label: `${i} mois` });
  }

  // 1-10 ans
  for (let i = 1; i <= 10; i++) {
    options.push({ value: `${i}y`, label: `${i} an${i > 1 ? 's' : ''}` });
  }

  // + de 10 ans
  options.push({ value: '10+y', label: '+ de 10 ans' });

  return options;
};

export default function Step2aScreen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const pauseOptions = generatePauseOptions();
  const [selectedPauseDuration, setSelectedPauseDuration] = useState(watch('pause_duration') || pauseOptions[8].value); // Default to 2 mois
  const [records, setRecords] = useState(watch('records') || '');

  const pickerScroll = useRef<ScrollView>(null);

  // Scroll to selected item on mount
  useEffect(() => {
    const index = pauseOptions.findIndex(opt => opt.value === selectedPauseDuration);
    if (index >= 0 && pickerScroll.current) {
      pickerScroll.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleContinue = () => {
    setValue('pause_duration', selectedPauseDuration);
    setValue('records', records);
    router.push('/(questionnaire)/step2');
  };

  const renderPickerItem = (option: typeof pauseOptions[0], index: number) => {
    const isSelected = option.value === selectedPauseDuration;

    return (
      <TouchableOpacity
        key={option.value}
        style={styles.pickerItem}
        onPress={() => {
          setSelectedPauseDuration(option.value);
          pickerScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
        }}
      >
        <Text style={[
          styles.pickerItemText,
          isSelected && styles.pickerItemTextSelected,
          !isSelected && styles.pickerItemTextUnselected
        ]}>
          {option.label}
        </Text>
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
            <Text style={styles.progressText}>Reprise</Text>
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

          {/* Wheel Picker */}
          <View style={styles.wheelPickerContainer}>
            <View style={styles.selectionHighlight} />
            <ScrollView
              ref={pickerScroll}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            >
              {pauseOptions.map((option, index) => renderPickerItem(option, index))}
            </ScrollView>
            <View style={styles.pickerFadeTop} pointerEvents="none" />
            <View style={styles.pickerFadeBottom} pointerEvents="none" />
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
  wheelPickerContainer: {
    height: 256,
    width: '100%',
    backgroundColor: 'rgba(26, 38, 50, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 32,
  },
  selectionHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    transform: [{ translateY: -ITEM_HEIGHT / 2 }],
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.2)',
    zIndex: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    fontSize: 24,
    fontWeight: '700',
    color: '#328ce7',
  },
  pickerItemTextUnselected: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  pickerFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'transparent',
    zIndex: 20,
    pointerEvents: 'none',
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'transparent',
    zIndex: 20,
    pointerEvents: 'none',
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
