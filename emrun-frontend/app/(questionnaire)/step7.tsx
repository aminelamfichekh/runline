/**
 * Step 7: Jours disponibles
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

type DayValue = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DayOption {
  value: DayValue;
  label: string;
}

const DAYS: DayOption[] = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' },
];

interface DayCardProps {
  day: DayOption;
  isSelected: boolean;
  onToggle: (value: DayValue) => void;
  index: number;
}

function DayCard({ day, isSelected, onToggle, index }: DayCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(day.value);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.dayCard, isSelected && styles.dayCardSelected]}
      >
        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.label}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <MaterialCommunityIcons name="check" size={14} color={colors.text.primary} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step7Screen() {
  const router = useRouter();
  const { form, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step7', primaryGoal);

  const [selectedDays, setSelectedDays] = useState<DayValue[]>(
    (watch('available_days') as DayValue[]) || []
  );

  const toggleDay = (day: DayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleContinue = async () => {
    setValue('available_days', selectedDays);
    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step8');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step6"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Vos <Text style={styles.headlineHighlight}>jours disponibles</Text>
            </Text>
            <Text style={styles.subheadline}>
              Sélectionnez tous les jours où vous pouvez vous entraîner.
            </Text>
          </View>

          <View style={styles.daysContainer}>
            {DAYS.map((day, index) => (
              <DayCard
                key={day.value}
                day={day}
                isSelected={selectedDays.includes(day.value)}
                onToggle={toggleDay}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {selectedDays.length === 0 && (
          <Text style={styles.validationMessage}>Sélectionnez au moins 1 jour</Text>
        )}
        <ContinueButton
          onPress={handleContinue}
          disabled={selectedDays.length === 0}
        />
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
  daysContainer: {
    gap: questionnaireTokens.spacing.md,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
  },
  dayCardSelected: {
    borderColor: colors.accent.blue,
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: colors.accent.blue,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: colors.accent.blue,
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
  validationMessage: {
    fontSize: 14,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: questionnaireTokens.spacing.sm,
  },
});
