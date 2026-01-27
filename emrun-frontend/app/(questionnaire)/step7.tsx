/**
 * Step 7: Volume Hebdomadaire
 * Converted from HTML design with two wheel pickers
 */

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ITEM_HEIGHT = 56;

export default function Step7Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [lastWeekVolume, setLastWeekVolume] = useState(25);
  const [typicalVolume, setTypicalVolume] = useState(40);

  const lastWeekScroll = useRef<ScrollView>(null);
  const typicalScroll = useRef<ScrollView>(null);

  // Last week volumes: 15, 20, 25, 30, 40 km
  const lastWeekVolumes = [15, 20, 25, 30, 40];

  // Typical volumes: 25, 30, 40, 50, 60 km (jumps by 10 after 30)
  const typicalVolumes = [25, 30, 40, 50, 60];

  const handleContinue = () => {
    setValue('last_week_volume', lastWeekVolume);
    setValue('typical_volume', typicalVolume);
    router.push('/(questionnaire)/step8');
  };

  const renderVolumeItem = (vol: number, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={vol}
      style={styles.pickerItem}
      onPress={onPress}
    >
      <Text style={[
        styles.pickerItemText,
        isSelected && styles.pickerItemTextSelected,
        !isSelected && styles.pickerItemTextUnselected
      ]}>
        {vol} km
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
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
          {/* First Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionText}>
              Combien de kilomètres as-tu fait la semaine dernière ?
            </Text>

            {/* Wheel Picker 1 */}
            <View style={styles.wheelPickerContainer}>
              <View style={styles.selectionHighlight} />
              <View style={styles.wheelPickerContent}>
                <ScrollView
                  ref={lastWeekScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {lastWeekVolumes.map((vol, index) =>
                    renderVolumeItem(
                      vol,
                      vol === lastWeekVolume,
                      () => {
                        setLastWeekVolume(vol);
                        lastWeekScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
                      }
                    )
                  )}
                </ScrollView>
              </View>
              <View style={styles.pickerFadeTop} pointerEvents="none" />
              <View style={styles.pickerFadeBottom} pointerEvents="none" />
              {/* Tactile Indicator */}
              <View style={styles.tactileIndicator}>
                <View style={styles.tactileDot} />
                <View style={styles.tactileDot} />
                <View style={styles.tactileDot} />
              </View>
            </View>
          </View>

          {/* Second Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionText}>
              Quel est ton volume hebdomadaire classique ?
            </Text>

            {/* Wheel Picker 2 */}
            <View style={styles.wheelPickerContainer}>
              <View style={styles.selectionHighlight} />
              <View style={styles.wheelPickerContent}>
                <ScrollView
                  ref={typicalScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {typicalVolumes.map((vol, index) =>
                    renderVolumeItem(
                      vol,
                      vol === typicalVolume,
                      () => {
                        setTypicalVolume(vol);
                        typicalScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
                      }
                    )
                  )}
                </ScrollView>
              </View>
              <View style={styles.pickerFadeTop} pointerEvents="none" />
              <View style={styles.pickerFadeBottom} pointerEvents="none" />
              {/* Tactile Indicator */}
              <View style={styles.tactileIndicator}>
                <View style={styles.tactileDot} />
                <View style={styles.tactileDot} />
                <View style={styles.tactileDot} />
              </View>
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
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
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
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#ffffff',
  },
  progressContainer: {
    paddingHorizontal: 0,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328ce7',
    borderRadius: 9999,
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 32,
  },
  questionSection: {
    gap: 24,
    paddingTop: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 8,
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
  wheelPickerContent: {
    flex: 1,
    zIndex: 10,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 28,
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    fontSize: 32,
    fontWeight: '700',
    color: '#328ce7',
    transform: [{ scale: 1.05 }],
  },
  pickerItemTextUnselected: {
    color: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 0.9 }],
  },
  pickerFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  tactileIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    gap: 4,
    opacity: 0.2,
    zIndex: 20,
  },
  tactileDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(17, 25, 33, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
    shadowOpacity: 0.39,
    shadowRadius: 14,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
