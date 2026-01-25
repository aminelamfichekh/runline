/**
 * WheelPicker Component
 * Composant de roulette (wheel picker) pour les valeurs numériques
 * Utilisé pour: âge, poids, taille, volume hebdomadaire, expérience, dates
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface WheelPickerProps {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const WINDOW_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const WheelPicker: React.FC<WheelPickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
  step = 1,
  unit,
  formatValue,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Générer les valeurs possibles
  const values: number[] = [];
  for (let i = min; i <= max; i += step) {
    values.push(i);
  }

  // Trouver l'index initial basé sur la valeur
  useEffect(() => {
    if (value !== undefined) {
      const index = values.findIndex((v) => v === value);
      if (index !== -1) {
        setSelectedIndex(index);
        // Scroll vers la position initiale
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
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onChange(values[clampedIndex]);
    }
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const handleScrollEndDrag = () => {
    setIsScrolling(false);
    snapToNearest();
  };

  const handleMomentumScrollEnd = () => {
    setIsScrolling(false);
    snapToNearest();
  };

  const snapToNearest = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  const formatDisplayValue = (val: number): string => {
    if (formatValue) {
      return formatValue(val);
    }
    return unit ? `${val} ${unit}` : `${val}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[styles.pickerContainer, error && styles.pickerContainerError]}>
        {/* Gradient overlays pour l'effet de roulette */}
        <View style={styles.gradientTop} pointerEvents="none" />
        <View style={styles.gradientBottom} pointerEvents="none" />
        
        {/* Ligne de sélection */}
        <View style={styles.selectionLine} pointerEvents="none" />
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
        >
          {/* Padding top pour centrer la première valeur */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          
          {values.map((val, index) => {
            const isSelected = index === selectedIndex && !isScrolling;
            return (
              <View
                key={val}
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
                  {formatDisplayValue(val)}
                </Text>
              </View>
            );
          })}
          
          {/* Padding bottom pour centrer la dernière valeur */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
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
    // Style pour l'item sélectionné
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



