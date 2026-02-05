/**
 * QuestionnaireHeader - Shared header component for all questionnaire steps
 * Features:
 * - Animated progress bar with smooth fill transitions
 * - Dynamic progress calculation based on current step
 * - Back button with consistent styling
 * - Logo branding
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

interface QuestionnaireHeaderProps {
  /** Current step number (1-based) */
  currentStep: number;
  /** Total number of steps in the user's journey */
  totalSteps: number;
  /** Route to navigate back to (optional - uses router.back() if not provided) */
  backRoute?: string;
  /** Whether to show back button (defaults to true) */
  showBackButton?: boolean;
  /** Callback when back button is pressed (optional) */
  onBackPress?: () => void;
}

export function QuestionnaireHeader({
  currentStep,
  totalSteps,
  backRoute,
  showBackButton = true,
  onBackPress,
}: QuestionnaireHeaderProps) {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const prevProgressRef = useRef(0);

  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  useEffect(() => {
    // Animate progress bar smoothly
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      friction: 12,
      tension: 50,
    }).start();

    // Trigger subtle haptic when progress increases
    if (progress > prevProgressRef.current && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    prevProgressRef.current = progress;
  }, [progress]);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onBackPress) {
      onBackPress();
    } else if (backRoute) {
      router.push(backRoute as any);
    } else {
      router.back();
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.header}>
      <View style={styles.topBar}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
            ]}
          />
          {/* Glow effect at the end of progress */}
          <Animated.View
            style={[
              styles.progressGlow,
              { width: progressWidth },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.medium,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'relative',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: colors.primary.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: 2,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    height: 8,
    backgroundColor: 'transparent',
    borderRadius: 4,
    // Glow effect using shadow
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 0, // No elevation on Android for this effect
  },
});

export default QuestionnaireHeader;
