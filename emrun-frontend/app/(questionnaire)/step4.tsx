/**
 * Step 4: Fréquence de course
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

type FrequencyOption = 'none' | 'little' | 'much' | 'passionate' | 'crazy';

interface FrequencyCardProps {
  value: FrequencyOption;
  icon: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  onSelect: (value: FrequencyOption) => void;
  index: number;
}

function FrequencyCard({
  value,
  icon,
  title,
  subtitle,
  isSelected,
  onSelect,
  index,
}: FrequencyCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
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
              outputRange: [15, 0],
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
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View
              style={[
                styles.optionIconContainer,
                isSelected && styles.optionIconContainerSelected,
              ]}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={22}
                color={isSelected ? colors.accent.blue : colors.text.secondary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {title}
              </Text>
              <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
            {isSelected && (
              <MaterialCommunityIcons name="check" size={14} color={colors.text.primary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step4Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step4', primaryGoal);

  const currentRunsPerWeek = watch('current_runs_per_week') as
    | '0'
    | '1_2'
    | '3_4'
    | '5_6'
    | '7_plus'
    | undefined;

  const mapBackendToFrequency = (value?: typeof currentRunsPerWeek): FrequencyOption | null => {
    switch (value) {
      case '0':
        return 'none';
      case '1_2':
        return 'little';
      case '3_4':
        return 'much';
      case '5_6':
        return 'passionate';
      case '7_plus':
        return 'crazy';
      default:
        return null;
    }
  };

  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(
    mapBackendToFrequency(currentRunsPerWeek)
  );

  const handleContinue = () => {
    let backendValue: '0' | '1_2' | '3_4' | '5_6' | '7_plus' | undefined;
    switch (selectedFrequency) {
      case 'none':
        backendValue = '0';
        break;
      case 'little':
        backendValue = '1_2';
        break;
      case 'much':
        backendValue = '3_4';
        break;
      case 'passionate':
        backendValue = '5_6';
        break;
      case 'crazy':
        backendValue = '7_plus';
        break;
      default:
        backendValue = undefined;
    }

    if (backendValue) {
      setValue('current_runs_per_week', backendValue);
    }
    router.push('/(questionnaire)/step5');
  };

  const options: Array<{
    value: FrequencyOption;
    icon: string;
    title: string;
    subtitle: string;
  }> = [
    { value: 'little', icon: 'emoticon-happy-outline', title: 'Un peu', subtitle: '1-2 fois par semaine' },
    { value: 'much', icon: 'run-fast', title: 'Beaucoup', subtitle: '3-4 fois par semaine' },
    { value: 'passionate', icon: 'speedometer', title: 'Passionnément', subtitle: '5-6 fois par semaine' },
    { value: 'crazy', icon: 'fire', title: 'À la folie', subtitle: '7+ fois par semaine' },
    { value: 'none', icon: 'close-circle-outline', title: 'Pas du tout', subtitle: '0 - Je débute' },
  ];

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
      >
        <View style={styles.mainContent}>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>
              Votre <Text style={styles.headlineHighlight}>fréquence</Text> de course
            </Text>
            <Text style={styles.subheadline}>
              Combien de fois courez-vous par semaine ? Ces informations nous aident à adapter votre programme.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <FrequencyCard
                key={option.value}
                value={option.value}
                icon={option.icon}
                title={option.title}
                subtitle={option.subtitle}
                isSelected={selectedFrequency === option.value}
                onSelect={setSelectedFrequency}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} disabled={!selectedFrequency} />
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
  optionsContainer: {
    gap: questionnaireTokens.spacing.md,
  },
  optionCard: {
    borderRadius: questionnaireTokens.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    paddingVertical: questionnaireTokens.spacing.lg,
    paddingHorizontal: questionnaireTokens.spacing.lg,
  },
  optionCardSelected: {
    borderColor: colors.accent.blue,
    borderWidth: 1.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: questionnaireTokens.spacing.md,
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconContainerSelected: {
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionTitleSelected: {
    color: colors.accent.blue,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
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
