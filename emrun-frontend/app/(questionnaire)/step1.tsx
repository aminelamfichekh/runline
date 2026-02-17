/**
 * Step 1: Objectif principal
 * Polished UI with shared components and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  questionnaireStyles,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

type GoalOption = 'start' | 'restart' | 'race' | 'other';

interface OptionCardProps {
  value: GoalOption;
  icon: string;
  title: string;
  isSelected: boolean;
  onSelect: (value: GoalOption) => void;
  hasInput?: boolean;
  inputValue?: string;
  onInputChange?: (text: string) => void;
  index: number;
}

function OptionCard({
  value,
  icon,
  title,
  isSelected,
  onSelect,
  hasInput,
  inputValue,
  onInputChange,
  index,
}: OptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    onSelect(value);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
        ]}
      >
        <View style={styles.optionContent}>
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <View style={styles.radioCircleInner} />}
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
              {title}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={icon as any}
            size={22}
            color={isSelected ? colors.accent.blue : 'rgba(255, 255, 255, 0.2)'}
          />
        </View>

        {hasInput && isSelected && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Précisez votre objectif..."
              placeholderTextColor={colors.text.tertiary}
              value={inputValue}
              onChangeText={onInputChange}
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              underlineColorAndroid="transparent"
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step1Screen() {
  const router = useRouter();
  const { form, handleFieldChange, saveNow } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;

  const mapPrimaryToGoal = (value?: string): GoalOption | null => {
    switch (value) {
      case 'me_lancer':
      case 'entretenir':
      case 'ameliorer_condition':
        return 'start';
      case 'reprendre':
        return 'restart';
      case 'courir_race':
      case 'ameliorer_chrono':
        return 'race';
      case 'autre':
        return 'other';
      default:
        return null;
    }
  };

  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(mapPrimaryToGoal(primaryGoal));
  const [otherText, setOtherText] = useState(watch('primary_goal_other') || '');

  const { currentStep, totalSteps } = getStepProgress('step1', primaryGoal);

  const handleGoalSelect = (goal: GoalOption) => {
    setSelectedGoal(goal);
    let primary_goal: string | undefined;
    switch (goal) {
      case 'start':
        primary_goal = 'me_lancer';
        break;
      case 'restart':
        primary_goal = 'reprendre';
        break;
      case 'race':
        primary_goal = 'courir_race';
        break;
      case 'other':
        primary_goal = 'autre';
        break;
      default:
        primary_goal = undefined;
    }

    if (primary_goal) {
      handleFieldChange('primary_goal', primary_goal as any);
    }
  };

  const handleContinue = async () => {
    if (selectedGoal === 'other') {
      setValue('primary_goal_other', otherText);
    }
    // Save data immediately before navigation to ensure it's persisted
    await saveNow();
    router.push('/(questionnaire)/step2');
  };

  const options: Array<{ value: GoalOption; icon: string; title: string; hasInput?: boolean }> = [
    { value: 'start', icon: 'run-fast', title: 'Commencer la course' },
    { value: 'restart', icon: 'reload', title: 'Reprendre la course' },
    { value: 'race', icon: 'trophy', title: 'Préparer une course' },
    { value: 'other', icon: 'note-edit', title: 'Autre', hasInput: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContent}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Quel est votre{'\n'}
              <Text style={styles.headlineHighlight}>objectif principal</Text> ?
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <OptionCard
                key={option.value}
                value={option.value}
                icon={option.icon}
                title={option.title}
                isSelected={selectedGoal === option.value}
                onSelect={handleGoalSelect}
                hasInput={option.hasInput}
                inputValue={otherText}
                onInputChange={setOtherText}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton
          onPress={handleContinue}
          disabled={!selectedGoal || (selectedGoal === 'other' && !otherText.trim())}
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
    ...questionnaireStyles.backgroundGradient,
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
    paddingBottom: questionnaireTokens.spacing.xxxl,
    alignItems: 'center',
  },
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    textAlign: 'center',
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  optionsContainer: {
    gap: questionnaireTokens.spacing.md,
  },
  optionCard: {
    borderRadius: questionnaireTokens.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: questionnaireTokens.spacing.xl,
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },
  optionCardSelected: {
    borderColor: colors.accent.blue,
    borderWidth: 1.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  textContainer: {
    flex: 1,
    marginLeft: questionnaireTokens.spacing.md,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionTitleSelected: {
    color: colors.text.primary,
  },
  inputContainer: {
    marginTop: questionnaireTokens.spacing.md,
    paddingLeft: 34,
  },
  textInput: {
    width: '100%',
    backgroundColor: colors.primary.dark,
    color: colors.text.primary,
    fontSize: 14,
    borderRadius: questionnaireTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingVertical: questionnaireTokens.spacing.md,
    paddingHorizontal: questionnaireTokens.spacing.lg,
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
