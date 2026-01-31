import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from 'react-native';

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
}

const DEFAULT_ITEM_HEIGHT = 44;
const DEFAULT_VISIBLE_ROWS = 7;
const DEFAULT_FONT_SIZE = 18;
const DEFAULT_HIGHLIGHT = '#328ce7';
const TEXT_SELECTED = '#ffffff';
const TEXT_FADED = 'rgba(147, 173, 200, 0.6)';

function getOpacity(distance: number): number {
  if (distance === 0) return 1;
  if (distance === 1) return 0.85;
  if (distance === 2) return 0.6;
  if (distance === 3) return 0.35;
  return Math.max(0.12, 0.5 - distance * 0.1);
}

function getScale(distance: number): number {
  if (distance === 0) return 1;
  if (distance === 1) return 0.94;
  if (distance === 2) return 0.88;
  if (distance === 3) return 0.82;
  return Math.max(0.75, 1 - distance * 0.05);
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
}: WheelPickerProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastReportedIndexRef = useRef<number>(-1);

  const visibleRows = wheelHeight ? Math.round(wheelHeight / itemHeight) : DEFAULT_VISIBLE_ROWS;
  const height = wheelHeight ?? visibleRows * itemHeight;
  const paddingY = ((visibleRows - 1) / 2) * itemHeight;

  const startIndex = Math.max(0, Math.min(initialIndex, data.length > 0 ? data.length - 1 : 0));
  const snapOffsets = useMemo(
    () => data.map((_, i) => i * itemHeight),
    [data.length, itemHeight]
  );

  useEffect(() => {
    if (data.length === 0) return;
    const y = startIndex * itemHeight;
    scrollRef.current?.scrollTo({ y, animated: false });
    setScrollY(y);
    lastReportedIndexRef.current = startIndex;
    onValueChange(data[startIndex].value);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(e.nativeEvent.contentOffset.y);
  };

  const snapToNearest = (y: number) => {
    let idx = Math.round(y / itemHeight);
    idx = Math.max(0, Math.min(idx, data.length - 1));
    const targetY = idx * itemHeight;
    if (Math.abs(y - targetY) > 0.5) {
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
      setScrollY(targetY);
    }
    if (idx !== lastReportedIndexRef.current) {
      lastReportedIndexRef.current = idx;
      onValueChange(data[idx].value);
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  if (data.length === 0) return null;

  const centerIndex = Math.round(scrollY / itemHeight);
  const clampedCenterIndex = Math.max(0, Math.min(centerIndex, data.length - 1));
  const centerFontSize = fontSize + 4;

  return (
    <View style={[styles.window, { height }, style]}>
      <View
        style={[styles.centerLines, { top: paddingY, height: itemHeight }]}
        pointerEvents="none"
      >
        <View style={[styles.centerLine, { backgroundColor: highlightColor }]} />
        <View style={[styles.centerLine, styles.centerLineBottom, { backgroundColor: highlightColor }]} />
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={{ paddingVertical: paddingY }}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapOffsets.length > 0 ? snapOffsets : undefined}
        snapToInterval={snapOffsets.length === 0 ? itemHeight : undefined}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        nestedScrollEnabled
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
                { height: itemHeight, opacity, transform: [{ scale }] },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    fontSize: isCenter ? centerFontSize : fontSize,
                    fontWeight: isCenter ? '700' : '500',
                    color: isCenter ? highlightColor : TEXT_FADED,
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
  window: { overflow: 'hidden' },
  list: { flex: 1, backgroundColor: 'transparent' },
  item: { justifyContent: 'center', alignItems: 'center' },
  itemText: { color: TEXT_SELECTED },
  centerLines: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 2,
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
  },
  centerLineBottom: {
    top: undefined,
    bottom: 0,
  },
});
