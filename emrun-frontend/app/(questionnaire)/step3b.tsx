/**
 * Step 3b: Préparer une course - Objectives + records (CONDITIONAL)
 * Polished UI with shared components and correct progress tracking
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

export default function Step3bScreen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  // Use 'courir_race' path for correct progress calculation
  const { currentStep, totalSteps } = getStepProgress('step3b', 'courir_race');

  const [objectives, setObjectives] = useState(watch('objectives') || '');
  const [records, setRecords] = useState(watch('records') || '');

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
    setValue('objectives', objectives);
    setValue('records', records);
    router.push('/(questionnaire)/step4');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step3b-goal"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.preLabel}>PRÉPARER</Text>
            <Text style={styles.headline}>
              Vos <Text style={styles.headlineHighlight}>objectifs de course</Text>
            </Text>
            <Text style={styles.subheadline}>
              Partagez-nous vos objectifs pour créer un plan adapté.
            </Text>
          </View>

          {/* Objectives Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Objectif(s) intermédiaire(s){' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>Distance(s) et date(s) à préciser</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 10km en mars, Semi-marathon en mai..."
              placeholderTextColor={colors.text.tertiary}
              value={objectives}
              onChangeText={setObjectives}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              underlineColorAndroid="transparent"
            />
          </View>

          {/* Records Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Record(s) personnel(s){' '}
              <Text style={styles.inputOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.inputSubtitle}>Préciser la distance</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 5km en 25min, 10km en 55min, Semi en 2h..."
              placeholderTextColor={colors.text.tertiary}
              value={records}
              onChangeText={setRecords}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              underlineColorAndroid="transparent"
            />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} />
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
  preLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.blue,
    letterSpacing: 1,
    marginBottom: questionnaireTokens.spacing.xs,
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
