/**
 * Step 3a: Reprendre la course - Pause duration + records (CONDITIONAL)
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
import { WheelPicker } from '@/components/ui/WheelPicker';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

const generatePauseOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let i = 1; i <= 4; i++) {
    options.push({ value: `${i}w`, label: `${i} semaine${i > 1 ? 's' : ''}` });
  }
  for (let i = 1; i <= 11; i++) {
    options.push({ value: `${i}m`, label: `${i} mois` });
  }
  for (let i = 1; i <= 10; i++) {
    options.push({ value: `${i}y`, label: `${i} an${i > 1 ? 's' : ''}` });
  }
  options.push({ value: '10+y', label: '+ de 10 ans' });
  return options;
};

const pauseOptions = generatePauseOptions();
const defaultPauseIndex = 8; // Default to "2 mois"

export default function Step3aScreen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  // Use 'reprendre' path for correct progress calculation
  const { currentStep, totalSteps } = getStepProgress('step3a', 'reprendre');

  const existingPause = watch('pause_duration') as string | undefined;
  const initialPauseIndex = existingPause
    ? pauseOptions.findIndex((o) => o.value === existingPause)
    : defaultPauseIndex;

  const [selectedPauseDuration, setSelectedPauseDuration] = useState(
    existingPause || (pauseOptions[defaultPauseIndex]?.value ?? '2m')
  );
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

  const handleContinue = async () => {
    setValue('pause_duration', selectedPauseDuration);
    setValue('records', records);
    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step4');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step3"
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
            <Text style={styles.headline}>
              Depuis combien de temps{'\n'}
              <Text style={styles.headlineHighlight}>avez-vous arrêté</Text> ?
            </Text>
            <Text style={styles.subheadline}>
              Cela nous aide à adapter votre reprise en douceur.
            </Text>
          </View>

          {/* Pause Duration Picker */}
          <View style={styles.pickerSection}>
            <WheelPicker
              data={pauseOptions}
              onValueChange={setSelectedPauseDuration}
              itemHeight={52}
              wheelHeight={260}
              fontSize={20}
              highlightColor={colors.accent.blue}
              initialIndex={Math.max(0, initialPauseIndex)}
            />
          </View>

          {/* Records Input */}
          <View style={styles.recordsSection}>
            <Text style={styles.recordsLabel}>
              Record(s) personnel(s){' '}
              <Text style={styles.recordsOptional}>(Optionnel)</Text>
            </Text>
            <Text style={styles.recordsSubtitle}>
              Ex: 5km en 25min, 10km en 55min, Semi en 2h...
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Vos meilleurs temps..."
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
  },
  pickerSection: {
    marginBottom: questionnaireTokens.spacing.xxxl,
  },
  recordsSection: {
    gap: questionnaireTokens.spacing.sm,
  },
  recordsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordsOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.secondary,
  },
  recordsSubtitle: {
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
