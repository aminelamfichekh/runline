/**
 * Step 5: Volume Hebdomadaire
 * Two wheel pickers for weekly running volume
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ITEM_HEIGHT = 56;

// Generate volume options: 0-30km every 5km, 30-150km every 10km, 150+ km
const generateVolumeOptions = () => {
  const options = [];

  // 0-30km every 5km
  for (let i = 0; i <= 30; i += 5) {
    options.push({ value: i, label: `${i} km` });
  }

  // 40-150km every 10km
  for (let i = 40; i <= 150; i += 10) {
    options.push({ value: i, label: `${i} km` });
  }

  // 150+ km
  options.push({ value: 160, label: '150+ km' });

  return options;
};

export default function Step5Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const volumeOptions = generateVolumeOptions();

  const [lastWeekVolume, setLastWeekVolume] = useState(20);
  const [typicalVolume, setTypicalVolume] = useState(30);

  const lastWeekScroll = useRef<ScrollView>(null);
  const typicalScroll = useRef<ScrollView>(null);

  // Scroll to selected items on mount
  useEffect(() => {
    const lastWeekIndex = volumeOptions.findIndex(opt => opt.value === lastWeekVolume);
    const typicalIndex = volumeOptions.findIndex(opt => opt.value === typicalVolume);

    if (lastWeekIndex >= 0 && lastWeekScroll.current) {
      lastWeekScroll.current.scrollTo({ y: lastWeekIndex * ITEM_HEIGHT, animated: false });
    }
    if (typicalIndex >= 0 && typicalScroll.current) {
      typicalScroll.current.scrollTo({ y: typicalIndex * ITEM_HEIGHT, animated: false });
    }
  }, []);

  const handleContinue = () => {
    // TODO: Add form schema fields for last_week_volume and typical_volume
    // setValue('last_week_volume', lastWeekVolume);
    // setValue('typical_volume', typicalVolume);
    router.push('/(questionnaire)/step6');
  };

  const renderVolumeItem = (option: typeof volumeOptions[0], index: number, isLastWeek: boolean) => {
    const isSelected = isLastWeek
      ? option.value === lastWeekVolume
      : option.value === typicalVolume;

    return (
      <TouchableOpacity
        key={option.value}
        style={styles.pickerItem}
        onPress={() => {
          if (isLastWeek) {
            setLastWeekVolume(option.value);
            lastWeekScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
          } else {
            setTypicalVolume(option.value);
            typicalScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
          }
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
            <Text style={styles.progressText}>Étape 5 sur 9</Text>
            <Text style={styles.progressPercent}>56%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '56%' }]} />
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
              Votre <Text style={styles.headlineHighlight}>volume hebdomadaire</Text>
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à adapter l'intensité de votre programme.
            </Text>
          </View>

          {/* First Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionLabel}>
              Combien de kilomètres as-tu fait la semaine dernière ?
            </Text>

            {/* Wheel Picker 1 */}
            <View style={styles.wheelPickerContainer}>
              <View style={styles.selectionHighlight} />
              <ScrollView
                ref={lastWeekScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
              >
                {volumeOptions.map((option, index) => renderVolumeItem(option, index, true))}
              </ScrollView>
              <View style={styles.pickerFadeTop} pointerEvents="none" />
              <View style={styles.pickerFadeBottom} pointerEvents="none" />
            </View>
          </View>

          {/* Second Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionLabel}>
              Quel est ton volume hebdomadaire classique ?
            </Text>

            {/* Wheel Picker 2 */}
            <View style={styles.wheelPickerContainer}>
              <View style={styles.selectionHighlight} />
              <ScrollView
                ref={typicalScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
              >
                {volumeOptions.map((option, index) => renderVolumeItem(option, index, false))}
              </ScrollView>
              <View style={styles.pickerFadeTop} pointerEvents="none" />
              <View style={styles.pickerFadeBottom} pointerEvents="none" />
            </View>
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
  wheelPickerContainer: {
    height: 192,
    width: '100%',
    backgroundColor: 'rgba(26, 38, 50, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
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
    fontSize: 20,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    fontSize: 28,
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
    height: 64,
    backgroundColor: 'transparent',
    zIndex: 20,
    pointerEvents: 'none',
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'transparent',
    zIndex: 20,
    pointerEvents: 'none',
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
