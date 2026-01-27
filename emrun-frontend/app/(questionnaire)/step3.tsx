/**
 * Step 3: Reprendre la course - Pause duration
 * Converted from HTML design with wheel picker
 */

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ITEM_HEIGHT = 56;

export default function Step3Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [selectedNumber, setSelectedNumber] = useState(2);
  const [selectedUnit, setSelectedUnit] = useState('mois');
  const [records, setRecords] = useState(watch('records') || '');

  const numberScroll = useRef<ScrollView>(null);
  const unitScroll = useRef<ScrollView>(null);

  const numbers = [1, 2, 3, 4, 5, 6];
  const units = ['semaines', 'mois', 'années'];

  const handleContinue = () => {
    setValue('pause_duration_number', selectedNumber);
    setValue('pause_duration_unit', selectedUnit);
    setValue('records', records);
    router.push('/(questionnaire)/step4');
  };

  const renderNumberItem = (num: number, index: number) => {
    const isSelected = num === selectedNumber;
    return (
      <TouchableOpacity
        key={num}
        style={styles.pickerItem}
        onPress={() => {
          setSelectedNumber(num);
          numberScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
        }}
      >
        <Text style={[
          styles.pickerItemText,
          isSelected && styles.pickerItemTextSelected,
          !isSelected && styles.pickerItemTextUnselected
        ]}>
          {num}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUnitItem = (unit: string, index: number) => {
    const isSelected = unit === selectedUnit;
    return (
      <TouchableOpacity
        key={unit}
        style={styles.pickerItem}
        onPress={() => {
          setSelectedUnit(unit);
          unitScroll.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
        }}
      >
        <Text style={[
          styles.pickerItemTextUnit,
          isSelected && styles.pickerItemTextSelected,
          !isSelected && styles.pickerItemTextUnselected
        ]}>
          {unit}
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
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
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
          {/* Title */}
          <View style={styles.headlineContainer}>
            <Text style={styles.subtitle}>Reprendre la course</Text>
            <Text style={styles.headline}>
              Depuis combien de temps as-tu arrêté la course à pied ?
            </Text>
          </View>

          {/* Wheel Picker */}
          <View style={styles.wheelPickerContainer}>
            {/* Selection Highlight */}
            <View style={styles.selectionHighlight} />

            {/* Two Columns */}
            <View style={styles.wheelPickerRow}>
              {/* Numbers Column */}
              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={numberScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {numbers.map(renderNumberItem)}
                </ScrollView>
              </View>

              {/* Units Column */}
              <View style={styles.wheelColumn}>
                <ScrollView
                  ref={unitScroll}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {units.map(renderUnitItem)}
                </ScrollView>
              </View>
            </View>

            {/* Top/Bottom Fade */}
            <View style={styles.pickerFadeTop} pointerEvents="none" />
            <View style={styles.pickerFadeBottom} pointerEvents="none" />
          </View>

          {/* Optional Records Input */}
          <View style={styles.recordsSection}>
            <Text style={styles.recordsLabel}>
              Record(s) personnel(s) <Text style={styles.recordsOptional}>(Optionnel)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <MaterialCommunityIcons name="trophy" size={20} color="#64748b" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: 5km en 25min, Marathon en 4h..."
                placeholderTextColor="#64748b"
                value={records}
                onChangeText={setRecords}
              />
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
    backgroundColor: '#f6f7f8',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f6f7f8',
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
    backgroundColor: '#111921',
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#111921',
    textTransform: 'uppercase',
  },
  progressContainer: {
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#1d2936',
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
    paddingTop: 16,
  },
  headlineContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 36,
    color: '#111921',
    textAlign: 'center',
  },
  wheelPickerContainer: {
    height: 256,
    width: '100%',
    position: 'relative',
    marginBottom: 40,
  },
  selectionHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    transform: [{ translateY: -ITEM_HEIGHT / 2 }],
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.3)',
    borderRadius: 12,
    zIndex: 0,
  },
  wheelPickerRow: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 10,
  },
  wheelColumn: {
    flex: 1,
    overflow: 'hidden',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 32,
  },
  pickerItemText: {
    fontSize: 28,
    fontWeight: '600',
  },
  pickerItemTextUnit: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
    paddingLeft: 32,
  },
  pickerItemTextSelected: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111921',
  },
  pickerItemTextUnselected: {
    color: 'rgba(17, 25, 33, 0.3)',
  },
  pickerFadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'linear-gradient(to bottom, #f6f7f8, transparent)',
    zIndex: 20,
  },
  pickerFadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'linear-gradient(to top, #f6f7f8, transparent)',
    zIndex: 20,
  },
  recordsSection: {
    gap: 12,
  },
  recordsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111921',
  },
  recordsOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111921',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#f6f7f8',
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
