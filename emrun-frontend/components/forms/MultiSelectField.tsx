import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MultiSelectFieldProps<T extends string> {
  label: string;
  values: T[];
  options: { value: T; label: string }[];
  onChange: (values: T[]) => void;
  error?: string;
  required?: boolean;
  minSelections?: number;
}

export function MultiSelectField<T extends string>({
  label,
  values,
  options,
  onChange,
  error,
  required = false,
  minSelections = 1,
}: MultiSelectFieldProps<T>) {
  const toggleSelection = (value: T) => {
    if (values.includes(value)) {
      // Don't allow deselecting if we're at minimum
      if (values.length > minSelections) {
        onChange(values.filter((v) => v !== value));
      }
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
        {minSelections > 1 && (
          <Text style={styles.hint}> (Select at least {minSelections})</Text>
        )}
      </Text>
      {options.map((option) => {
        const isSelected = values.includes(option.value);
        const isDisabled = isSelected && values.length === minSelections;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              isDisabled && styles.optionDisabled,
            ]}
            onPress={() => toggleSelection(option.value)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  required: {
    color: '#ff4444',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  option: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  optionSelected: {
    backgroundColor: '#3a3a3a',
    borderColor: '#fff',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
});


