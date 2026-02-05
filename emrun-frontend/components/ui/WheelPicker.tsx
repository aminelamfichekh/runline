/**
 * WheelPicker - Professional native-style wheel picker
 * Features:
 * - Highlighted selection row with rounded background
 * - Smooth opacity/scale transitions
 * - Haptic feedback on selection
 * - Fade overlays for depth (no external dependencies)
 * - Proper container styling
 */

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
  Platform,
} from 'react-native';
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
  /** Optional. Defaults to 0. Picker starts at this index on mount. */
  initialIndex?: number;
  /** Show container border */
  showBorder?: boolean;
}

const DEFAULT_ITEM_HEIGHT = 50;
const DEFAULT_VISIBLE_ROWS = 5;
const DEFAULT_FONT_SIZE = 20;
const DEFAULT_HIGHLIGHT = '#328ce7';
const CONTAINER_BG = 'rgba(26, 38, 50, 0.8)';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';
const FADE_BG = '#111921';

function getOpacity(distance: number): number {
  if (distance === 0) return 1;
  if (distance === 1) return 0.5;
  if (distance === 2) return 0.3;
  return 0.15;
}

function getScale(distance: number): number {
  if (distance === 0) return 1;
  if (distance === 1) return 0.95;
  if (distance === 2) return 0.9;
  return 0.85;
}

export function WheelPicker<T = string | number>({
  data,
  onValueChange,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  wheelHeight,
  fontSize = DEFAULT_FONT_SIZE,
  highlightColor = DEFAULT_HIGHLIGHT,
  unitLabel,
  style,
  initialIndex = 0,
  showBorder = true,
}: WheelPickerProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastReportedIndexRef = useRef<number>(-1);
  const isScrollingRef = useRef(false);
  const hapticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if user has interacted - prevents onValueChange firing on mount
  const hasUserInteractedRef = useRef(false);

  const visibleRows = wheelHeight ? Math.round(wheelHeight / itemHeight) : DEFAULT_VISIBLE_ROWS;
  const height = wheelHeight ?? visibleRows * itemHeight;
  const paddingY = ((visibleRows - 1) / 2) * itemHeight;

  const startIndex = Math.max(0, Math.min(initialIndex, data.length > 0 ? data.length - 1 : 0));
  const snapOffsets = useMemo(
    () => data.map((_, i) => i * itemHeight),
    [data.length, itemHeight]
  );

  // Initialize position - scroll to initial index without firing onValueChange
  // This prevents overwriting previously saved values on mount
  useEffect(() => {
    if (data.length === 0) return;
    const y = startIndex * itemHeight;
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
      setScrollY(y);
      lastReportedIndexRef.current = startIndex;
      // DO NOT call onValueChange on mount - only on user interaction
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  // Trigger haptic feedback with debounce
  const triggerHaptic = useCallback(() => {
    if (Platform.OS === 'web') return;

    if (hapticTimeoutRef.current) {
      clearTimeout(hapticTimeoutRef.current);
    }
    hapticTimeoutRef.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 10);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setScrollY(y);

    const currentIndex = Math.round(y / itemHeight);
    const clampedIndex = Math.max(0, Math.min(currentIndex, data.length - 1));

    if (isScrollingRef.current && clampedIndex !== lastReportedIndexRef.current) {
      triggerHaptic();
    }
  };

  const handleScrollBegin = () => {
    isScrollingRef.current = true;
    hasUserInteractedRef.current = true;
  };

  const snapToNearest = useCallback((y: number) => {
    let idx = Math.round(y / itemHeight);
    idx = Math.max(0, Math.min(idx, data.length - 1));
    const targetY = idx * itemHeight;

    if (Math.abs(y - targetY) > 0.5) {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }

    // Only fire onValueChange if user has interacted AND value changed
    if (hasUserInteractedRef.current && idx !== lastReportedIndexRef.current) {
      lastReportedIndexRef.current = idx;
      onValueChange(data[idx].value);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    isScrollingRef.current = false;
  }, [data, itemHeight, onValueChange]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  if (data.length === 0) return null;

  const centerIndex = Math.round(scrollY / itemHeight);
  const clampedCenterIndex = Math.max(0, Math.min(centerIndex, data.length - 1));

  return (
    <View
      style={[
        styles.container,
        showBorder && styles.containerBorder,
        { height },
        style,
      ]}
    >
      {/* Selection highlight row */}
      <View
        style={[
          styles.highlightRow,
          {
            top: paddingY,
            height: itemHeight,
            backgroundColor: `${highlightColor}18`,
            borderColor: `${highlightColor}50`,
          },
        ]}
        pointerEvents="none"
      />

      {/* Top fade overlay - multiple layers for smooth gradient effect */}
      <View style={[styles.fadeOverlay, styles.fadeTop, { height: paddingY }]} pointerEvents="none">
        <View style={[styles.fadeLayer, { opacity: 0.95, height: '30%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.8, height: '25%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.5, height: '25%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.2, height: '20%' }]} />
      </View>

      {/* Bottom fade overlay */}
      <View style={[styles.fadeOverlay, styles.fadeBottom, { height: paddingY }]} pointerEvents="none">
        <View style={[styles.fadeLayer, { opacity: 0.2, height: '20%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.5, height: '25%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.8, height: '25%' }]} />
        <View style={[styles.fadeLayer, { opacity: 0.95, height: '30%' }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingVertical: paddingY }}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets.length > 0 ? snapOffsets : undefined}
        snapToInterval={snapOffsets.length === 0 ? itemHeight : undefined}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled
        bounces={true}
        overScrollMode="never"
      >
        {data.map((item, index) => {
          const distance = Math.abs(index - clampedCenterIndex);
          const isCenter = distance === 0;
          const opacity = getOpacity(distance);
          const scale = getScale(distance);

          return (
            <View
              key={String(item.value)}
              style={[
                styles.item,
                {
                  height: itemHeight,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    fontSize: isCenter ? fontSize + 6 : fontSize,
                    fontWeight: isCenter ? '700' : '400',
                    color: isCenter ? '#ffffff' : 'rgba(147, 173, 200, 0.6)',
                  },
                ]}
              >
                {item.label}
                {unitLabel && isCenter ? ` ${unitLabel}` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  highlightRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1,
  },
  fadeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
  fadeLayer: {
    width: '100%',
    backgroundColor: FADE_BG,
  },
});

export default WheelPicker;
