/**
 * OptionWheelPicker Component
 * Scroll wheel picker for selecting from a list of string options
 * Used for: experience months, experience years, or any list-based selection
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface OptionWheelPickerProps<T extends string> {
  label: string;
  value?: T;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  error?: string;
  required?: boolean;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const WINDOW_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function OptionWheelPicker<T extends string>({
  label,
  value,
  options,
  onSelect,
  error,
  required = false,
}: OptionWheelPickerProps<T>) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const index = options.findIndex((opt) => opt.value === value);
      if (index !== -1) {
        setSelectedIndex(index);
        // Scroll to initial position
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }, 100);
      }
    }
  }, []);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onSelect(options[clampedIndex].value);
    }
  };

  const snapToNearest = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[styles.pickerContainer, error && styles.pickerContainerError]}>
        {/* Gradient overlays for wheel effect */}
        <View style={styles.gradientTop} pointerEvents="none" />
        <View style={styles.gradientBottom} pointerEvents="none" />

        {/* Selection line */}
        <View style={styles.selectionLine} pointerEvents="none" />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => {
            setIsScrolling(false);
            snapToNearest();
          }}
          onMomentumScrollEnd={() => {
            setIsScrolling(false);
            snapToNearest();
          }}
          scrollEventThrottle={16}
        >
          {/* Padding top to center the first value */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />

          {options.map((option, index) => {
            const isSelected = index === selectedIndex && !isScrolling;
            return (
              <View
                key={option.value}
                style={[
                  styles.item,
                  isSelected && styles.itemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            );
          })}

          {/* Padding bottom to center the last value */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  required: {
    color: '#ff6b6b',
  },
  pickerContainer: {
    height: WINDOW_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    position: 'relative',
  },
  pickerContainerError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSelected: {
    // Style for selected item
  },
  itemText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '400',
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 24,
  },
  selectionLine: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    opacity: 0.3,
    pointerEvents: 'none',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: '#1a1a1a',
    opacity: 0.9,
    pointerEvents: 'none',
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: '#1a1a1a',
    opacity: 0.9,
    pointerEvents: 'none',
    zIndex: 1,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
});
