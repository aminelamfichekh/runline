/**
 * Shared design tokens and styles for the questionnaire
 * Ensures visual consistency across all steps
 */

import { StyleSheet, Platform } from 'react-native';
import { colors } from '@/constants/colors';

// ============================================
// DESIGN TOKENS
// ============================================

export const questionnaireTokens = {
  // Typography
  typography: {
    headline: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
  },

  // Spacing scale (4px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Shadows
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardSelected: {
      shadowColor: colors.accent.blue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    button: {
      shadowColor: colors.accent.blue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// ============================================
// SHARED STYLES
// ============================================

export const questionnaireStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },

  // Background gradient overlay
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },

  // Main content area
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  mainContent: {
    paddingHorizontal: questionnaireTokens.spacing.xxl,
  },

  // Headline section
  headlineContainer: {
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: questionnaireTokens.spacing.xxl,
    alignItems: 'center',
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: questionnaireTokens.spacing.sm,
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    ...questionnaireTokens.typography.subheadline,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },

  // Options container
  optionsContainer: {
    gap: questionnaireTokens.spacing.md,
  },

  // Option card base
  optionCard: {
    borderRadius: questionnaireTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.6)',
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
    ...questionnaireTokens.shadows.card,
  },
  optionCardSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    ...questionnaireTokens.shadows.cardSelected,
  },

  // Radio button
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
  },
  radioCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },

  // Checkbox indicator
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blue,
  },

  // Text input
  textInput: {
    width: '100%',
    backgroundColor: colors.primary.medium,
    color: colors.text.primary,
    ...questionnaireTokens.typography.body,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },
  textInputFocused: {
    borderColor: colors.accent.blue,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: questionnaireTokens.spacing.xxl,
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    // Gradient fade effect
    backgroundColor: colors.primary.dark,
  },

  // Primary button
  continueButton: {
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
  continueButtonDisabled: {
    backgroundColor: 'rgba(50, 140, 231, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    ...questionnaireTokens.typography.button,
    color: colors.text.primary,
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Field group
  fieldGroup: {
    gap: questionnaireTokens.spacing.sm,
  },
  fieldLabel: {
    ...questionnaireTokens.typography.label,
    color: colors.text.primary,
    marginLeft: questionnaireTokens.spacing.xs,
  },

  // Picker label
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as any,
    color: colors.text.tertiary,
    marginBottom: questionnaireTokens.spacing.sm,
  },
});

// Helper to get progress percentage for each step
export const getStepProgress = (
  stepName: string,
  primaryGoal?: string
): { currentStep: number; totalSteps: number } => {
  // Define step orders for different flows
  const baseSteps = ['step1', 'step2', 'step3'];
  const commonEndSteps = ['step4', 'step5', 'step6', 'step7', 'step8', 'step9', 'preview'];

  // Conditional steps based on primary_goal
  const restartPath = ['step3a']; // reprendre
  const racePath = ['step3b-goal', 'step3b']; // courir_race

  let stepOrder: string[];

  if (primaryGoal === 'reprendre') {
    stepOrder = [...baseSteps, ...restartPath, ...commonEndSteps];
  } else if (primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono') {
    stepOrder = [...baseSteps, ...racePath, ...commonEndSteps];
  } else {
    stepOrder = [...baseSteps, ...commonEndSteps];
  }

  const currentStep = stepOrder.indexOf(stepName) + 1;
  const totalSteps = stepOrder.length;

  return {
    currentStep: Math.max(1, currentStep),
    totalSteps,
  };
};
