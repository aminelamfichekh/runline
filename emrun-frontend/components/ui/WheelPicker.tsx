/**
 * Reusable WheelPicker component with dark theme styling
 * Wraps @quidone/react-native-wheel-picker for consistent UI
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import WheelPicker_Base from '@quidone/react-native-wheel-picker';
import { colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export interface WheelPickerOption {
  label: string;
  value: string | number;
}

export interface WheelPickerProps {
  options: WheelPickerOption[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  label?: string;
}

export function WheelPicker({ options, selectedValue, onValueChange, label }: WheelPickerProps) {
  const handleValueChange = (value: string | number) => {
    // Haptic feedback on selection (graceful fallback if not available)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignore haptics errors
      }
    }
    onValueChange(value);
  };

  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerContainer}>
        <WheelPicker_Base
          data={options}
          value={selectedValue}
          onValueChange={({ item }: { item: WheelPickerOption }) => handleValueChange(item.value)}
          itemHeight={50}
          itemTextStyle={styles.itemText}
          selectedItemTextStyle={styles.selectedItemText}
          containerStyle={styles.wheelContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pickerContainer: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  wheelContainer: {
    height: 200,
  },
  itemText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  selectedItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent.blue,
  },
});
