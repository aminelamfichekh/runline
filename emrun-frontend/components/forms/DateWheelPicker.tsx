/**
 * DateWheelPicker Component
 * Composant de roulette pour sélectionner une date (année, mois, jour)
 * Utilisé pour: date de naissance, date de course
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface DateWheelPickerProps {
  label: string;
  value?: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const WINDOW_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const DateWheelPicker: React.FC<DateWheelPickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  minimumDate,
  maximumDate,
}) => {
  const today = new Date();
  const minYear = minimumDate?.getFullYear() || 1900;
  const maxYear = maximumDate?.getFullYear() || today.getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Initialize from value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedDay(date.getDate());
    }
  }, [value]);

  // Update value when selections change
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const day = Math.min(selectedDay, daysInMonth);
    
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Generate arrays
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatValue = (val: number, type: 'year' | 'month' | 'day'): string => {
    if (type === 'year') return `${val}`;
    if (type === 'month') return String(val).padStart(2, '0');
    return String(val).padStart(2, '0');
  };

  const WheelColumn = ({ 
    values, 
    selected, 
    onSelect, 
    format 
  }: { 
    values: number[]; 
    selected: number; 
    onSelect: (val: number) => void;
    format: (val: number) => string;
  }) => {
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
      const index = values.findIndex((v) => v === selected);
      if (index !== -1 && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }, 100);
      }
    }, []);

    const handleScroll = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      
      if (values[clampedIndex] !== selected) {
        onSelect(values[clampedIndex]);
      }
    };

    const snapToNearest = () => {
      const index = values.findIndex((v) => v === selected);
      if (index !== -1 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
      }
    };

    return (
      <View style={styles.wheelColumn}>
        <View style={styles.gradientTop} pointerEvents="none" />
        <View style={styles.gradientBottom} pointerEvents="none" />
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
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          {values.map((val, index) => {
            const isSelected = val === selected && !isScrolling;
            return (
              <View key={val} style={[styles.item, isSelected && styles.itemSelected]}>
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                  {format(val)}
                </Text>
              </View>
            );
          })}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[styles.pickerContainer, error && styles.pickerContainerError]}>
        <WheelColumn
          values={years}
          selected={selectedYear}
          onSelect={setSelectedYear}
          format={(val) => formatValue(val, 'year')}
        />
        <WheelColumn
          values={months}
          selected={selectedMonth}
          onSelect={setSelectedMonth}
          format={(val) => formatValue(val, 'month')}
        />
        <WheelColumn
          values={days}
          selected={selectedDay}
          onSelect={setSelectedDay}
          format={(val) => formatValue(val, 'day')}
        />
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

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
    flexDirection: 'row',
  },
  pickerContainerError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1a0a0a',
  },
  wheelColumn: {
    flex: 1,
    height: WINDOW_HEIGHT,
    position: 'relative',
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
  itemSelected: {},
  itemText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '400',
  },
  itemTextSelected: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 22,
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
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
});



