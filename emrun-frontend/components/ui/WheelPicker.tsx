/**
 * WheelPicker - Uses @quidone/react-native-wheel-picker for proper scroll handling
 * Simple bold text for selected value
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import NativeWheelPicker from '@quidone/react-native-wheel-picker';
import * as Haptics from 'expo-haptics';

export interface WheelPickerOption<T = string | number> {
  value: T;
  label: string;
}

export interface WheelPickerProps<T = string | number> {
  data: WheelPickerOption<T>[];
  onValueChange: (value: T) => void;
  itemHeight?: number;
  wheelHeight?: number;
  fontSize?: number;
  highlightColor?: string;
  unitLabel?: string;
  style?: ViewStyle;
  initialIndex?: number;
  showBorder?: boolean;
}

const DEFAULT_ITEM_HEIGHT = 50;
const DEFAULT_VISIBLE_ROWS = 5;
const DEFAULT_FONT_SIZE = 18;
const CONTAINER_BG = 'rgba(26, 38, 50, 0.8)';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

export function WheelPicker<T = string | number>({
  data,
  onValueChange,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  wheelHeight,
  fontSize = DEFAULT_FONT_SIZE,
  unitLabel,
  style,
  initialIndex = 0,
  showBorder = true,
}: WheelPickerProps<T>) {
  const hasInteractedRef = useRef(false);
  const initialCallbackFired = useRef(false);
  const startIndex = Math.max(0, Math.min(initialIndex, data.length > 0 ? data.length - 1 : 0));

  // Controlled value state
  const [selectedValue, setSelectedValue] = useState<T>(
    data.length > 0 ? data[startIndex].value : ('' as unknown as T)
  );

  // WheelPicker requires visibleItemCount to be an odd number
  const calculatedRows = wheelHeight ? Math.round(wheelHeight / itemHeight) : DEFAULT_VISIBLE_ROWS;
  const visibleRows = calculatedRows % 2 === 0 ? calculatedRows + 1 : calculatedRows;
  const height = wheelHeight ?? visibleRows * itemHeight;

  // Fire initial callback to ensure value is stored
  useEffect(() => {
    if (data.length > 0 && startIndex < data.length && !initialCallbackFired.current) {
      initialCallbackFired.current = true;
      const initialValue = data[startIndex].value;
      setSelectedValue(initialValue);
      onValueChange(initialValue);
    }
  }, [data, startIndex, onValueChange]);

  const handleValueChanged = useCallback(({ item }: { item: { value: T; label: string } }) => {
    setSelectedValue(item.value);
    hasInteractedRef.current = true;
    onValueChange(item.value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [onValueChange]);

  const handleValueChanging = useCallback(() => {
    hasInteractedRef.current = true;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  if (data.length === 0) return null;

  // Convert data to format expected by native picker
  const pickerData = data.map(item => ({
    value: item.value,
    label: unitLabel ? `${item.label} ${unitLabel}` : item.label,
  }));

  return (
    <View
      style={[
        styles.container,
        showBorder && styles.containerBorder,
        { height },
        style,
      ]}
    >
      <NativeWheelPicker
        data={pickerData}
        value={selectedValue}
        onValueChanged={handleValueChanged}
        onValueChanging={handleValueChanging}
        itemHeight={itemHeight}
        visibleItemCount={visibleRows}
        width="100%"
        itemTextStyle={{
          fontSize: fontSize,
          color: 'rgba(150, 170, 190, 0.5)',
          fontWeight: '400',
        }}
        overlayItemStyle={{
          fontSize: fontSize + 4,
          color: '#ffffff',
          fontWeight: '800',
        } as any}
        style={styles.picker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 16,
    backgroundColor: CONTAINER_BG,
  },
  containerBorder: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  picker: {
    flex: 1,
  },
});

export default WheelPicker;
