/**
 * ContinueButton - Animated primary action button for questionnaire
 * Features:
 * - Scale animation on press
 * - Haptic feedback
 * - Disabled state styling
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { questionnaireTokens } from './questionnaireStyles';

interface ContinueButtonProps {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  icon?: string;
  showArrow?: boolean;
  style?: ViewStyle;
}

export function ContinueButton({
  onPress,
  disabled = false,
  label = 'Continuer',
  icon,
  showArrow = true,
  style,
}: ContinueButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.buttonText,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {label}
        </Text>
        {(showArrow || icon) && (
          <MaterialCommunityIcons
            name={(icon || 'arrow-right') as any}
            size={20}
            color={disabled ? 'rgba(255, 255, 255, 0.4)' : colors.text.primary}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: colors.accent.blue,
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.xxl,
    borderRadius: questionnaireTokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: questionnaireTokens.spacing.sm,
    ...questionnaireTokens.shadows.button,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(50, 140, 231, 0.35)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    ...questionnaireTokens.typography.button,
    color: colors.text.primary,
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ContinueButton;
