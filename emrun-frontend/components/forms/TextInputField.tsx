import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface TextInputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  required = false,
  helperText,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#666"
        {...textInputProps}
      />
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
  input: {
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
