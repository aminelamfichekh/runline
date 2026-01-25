import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { format } from 'date-fns';

// Import DateTimePicker - will be null on web
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface DatePickerFieldProps {
  label: string;
  value?: string; // ISO date string
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  minimumDate,
  maximumDate,
  mode = 'date',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const initialDate = value ? new Date(value) : (maximumDate || new Date());
  const [tempDate, setTempDate] = useState(initialDate);
  const date = value ? new Date(value) : initialDate;
  
  // Update tempDate when value changes externally
  useEffect(() => {
    if (value) {
      setTempDate(new Date(value));
    }
  }, [value]);

  // Web fallback: use HTML5 date input
  if (Platform.OS === 'web') {
    const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        onChange(e.target.value);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <input
          type="date"
          value={value ? value : ''}
          onChange={handleWebDateChange}
          min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
          max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1.5px solid #2a2a2a',
            borderRadius: '14px',
            padding: '18px 20px',
            fontSize: '16px',
            color: '#fff',
            minHeight: '56px',
            width: '100%',
            ...(error && {
              borderColor: '#ff6b6b',
              backgroundColor: '#1a0a0a',
            }),
          }}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  // Native platforms - use DateTimePicker
  if (!DateTimePicker) {
    // Fallback if DateTimePicker is not available
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[styles.input, error && styles.inputError]}
          onPress={() => {
            // Simple fallback - just set today's date
            onChange(new Date().toISOString().split('T')[0]);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.inputText}>
            {value ? format(new Date(value), 'MMM dd, yyyy') : 'Select date'}
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  const displayValue = value ? format(new Date(value), 'MMM dd, yyyy') : 'Select date';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayValue}
        </Text>
      </TouchableOpacity>
      {showPicker && Platform.OS === 'android' && DateTimePicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
      {showPicker && Platform.OS === 'ios' && DateTimePicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.iosPickerButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onChange(tempDate.toISOString().split('T')[0]);
                setShowPicker(false);
              }}
            >
              <Text style={styles.iosPickerButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={(event: any, selectedDate?: Date) => {
              if (selectedDate) {
                setTempDate(selectedDate);
              }
            }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.iosPicker}
          />
        </View>
      )}
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
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 56,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1a0a0a',
  },
  inputText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  placeholder: {
    color: '#666',
    fontWeight: '400',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  iosPickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    marginTop: 8,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iosPickerButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});
