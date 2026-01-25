import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const variantStyle = variant === 'text' ? styles.textVariant : styles[variant];
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: colors.accent.blue,
    shadowColor: colors.accent.blue,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
  },
  textVariant: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  textText: {
    color: colors.text.primary,
  },
});