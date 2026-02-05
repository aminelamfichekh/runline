/**
 * Step 9: Blessures et Contraintes
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

export default function Step9Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step9', primaryGoal);

  const watchedInjuries = watch('injuries') as string[] | undefined;
  const watchedConstraints = watch('personal_constraints') as string | undefined;

  const [injuries, setInjuries] = useState(
    watchedInjuries && watchedInjuries.length > 0 ? watchedInjuries.join('\n') : ''
  );
  const [constraints, setConstraints] = useState(watchedConstraints || '');

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = () => {
    // Map multi-line injuries text to string[] for backend
    const lines = injuries
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0) {
      setValue('injuries', lines);
    } else {
      setValue('injuries', undefined);
    }

    // Personal constraints map directly
    if (constraints.trim().length > 0) {
      setValue('personal_constraints', constraints.trim());
    } else {
      setValue('personal_constraints', undefined);
    }
    router.push('/(questionnaire)/preview');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step8"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Informations{'\n'}
              <Text style={styles.headlineHighlight}>complémentaires</Text>
            </Text>
            <Text style={styles.subheadline}>
              Ces informations facultatives nous aident à personnaliser davantage votre programme.
            </Text>
          </View>

          {/* Injuries Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Blessure(s) passée(s) ou limitation(s) physique(s){' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Tendinite d'Achille, douleur au genou..."
              placeholderTextColor={colors.text.tertiary}
              value={injuries}
              onChangeText={setInjuries}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              underlineColorAndroid="transparent"
            />
          </View>

          {/* Constraints Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Contraintes personnelles / professionnelles{' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>Ex : travail de nuit, garde d'enfants…</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Partagez vos contraintes pour un plan adapté..."
              placeholderTextColor={colors.text.tertiary}
              value={constraints}
              onChangeText={setConstraints}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              underlineColorAndroid="transparent"
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} label="Terminer" icon="check" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  mainContent: {
    paddingHorizontal: questionnaireTokens.spacing.xxl,
  },
  headlineContainer: {
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: questionnaireTokens.spacing.xxl,
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    marginBottom: questionnaireTokens.spacing.sm,
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    ...questionnaireTokens.typography.subheadline,
    color: colors.text.secondary,
  },
  inputSection: {
    marginBottom: questionnaireTokens.spacing.xxl,
    gap: questionnaireTokens.spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  inputOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  inputSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  textInput: {
    width: '100%',
    backgroundColor: colors.primary.medium,
    color: colors.text.primary,
    fontSize: 15,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: questionnaireTokens.spacing.xxl,
    paddingTop: questionnaireTokens.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
    backgroundColor: colors.primary.dark,
  },
});
