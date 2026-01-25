import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface NumberInputFieldProps {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
}

export const NumberInputField: React.FC<NumberInputFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
  step,
  unit,
  helperText,
}) => {
  const [localValue, setLocalValue] = React.useState<string>(value?.toString() || '');
  const [isFocused, setIsFocused] = React.useState(false);

  // Only sync with external value changes when input is not focused
  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value?.toString() || '');
    }
  }, [value, isFocused]);

  const handleChange = (text: string) => {
    setLocalValue(text);
  };

  const handleBlur = () => {
    const trimmedValue = localValue.trim();
    
    if (trimmedValue === '' || trimmedValue === '.' || trimmedValue === '-') {
      onChange(undefined);
      setLocalValue('');
      return;
    }

    const numValue = parseFloat(trimmedValue);
    if (!isNaN(numValue)) {
      let steppedValue = numValue;
      if (step !== undefined) {
        steppedValue = Math.round(numValue / step) * step;
        const decimals = step.toString().split('.')[1]?.length || 0;
        steppedValue = parseFloat(steppedValue.toFixed(decimals));
      }
      
      let finalValue = steppedValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;
      
      if (finalValue !== value) {
        onChange(finalValue);
      }
      
      const displayValue = step !== undefined && step < 1 
        ? finalValue.toFixed(2) 
        : finalValue.toString();
      setLocalValue(displayValue);
    } else {
      setLocalValue(value?.toString() || '');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
        {unit && <Text style={styles.unit}> ({unit})</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={localValue}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleBlur();
          }}
          keyboardType="decimal-pad"
          placeholderTextColor="#666"
          placeholder={min !== undefined && max !== undefined ? `${min}-${max}` : undefined}
        />
        {unit && (
          <Text style={styles.unitLabel}>{unit}</Text>
        )}
      </View>
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
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
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  required: {
    color: '#ff6b6b',
  },
  unit: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    minHeight: 56,
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1a0a0a',
  },
  unitLabel: {
    marginLeft: 14,
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    fontWeight: '400',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
});