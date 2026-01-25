import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SelectFieldProps<T extends string> {
  label: string;
  value?: T;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  error?: string;
  required?: boolean;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onSelect,
  error,
  required = false,
}: SelectFieldProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  optionsContainer: {
    gap: 10,
  },
  option: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  optionSelected: {
    backgroundColor: '#2a2a2a',
    borderColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#fff',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
});
