/**
 * Step 2: Informations personnelles
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { QUESTIONNAIRE_EMAIL } from '@/lib/storage/keys';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { colors } from '@/constants/colors';
import {
  QuestionnaireHeader,
  ContinueButton,
  questionnaireTokens,
  getStepProgress,
} from '@/components/questionnaire';

const MIN_AGE = 18;
const MAX_AGE = 90;
const DEFAULT_AGE = 18;
const ageOptions = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map((v) => ({
  value: v,
  label: String(v),
}));

interface GenderButtonProps {
  value: string;
  icon: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

function GenderButton({ value, icon, label, isSelected, onSelect }: GenderButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
    <Animated.View style={[styles.genderButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.genderOption, isSelected && styles.genderOptionSelected]}
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={isSelected ? colors.text.primary : colors.text.secondary}
        />
        <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step2Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const primaryGoal = watch('primary_goal') as string | undefined;
  const { currentStep, totalSteps } = getStepProgress('step2', primaryGoal);

  // Reconstruct full name from first_name / last_name if present
  const firstName = watch('first_name') as string | undefined;
  const lastName = watch('last_name') as string | undefined;
  const initialName =
    firstName || lastName ? `${firstName || ''}${lastName ? ` ${lastName}` : ''}`.trim() : '';

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(watch('email') || '');

  // Map backend gender to local sex value
  const backendGender = watch('gender') as 'male' | 'female' | 'other' | undefined;
  const initialSex =
    backendGender === 'male'
      ? 'homme'
      : backendGender === 'female'
      ? 'femme'
      : backendGender === 'other'
      ? 'autre'
      : '';
  const [sex, setSex] = useState(initialSex);

  // Approximate age from birth_date if present
  const birthDate = watch('birth_date') as string | undefined;
  let initialAge = '';
  if (birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    let ageYears = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      ageYears--;
    }
    if (!isNaN(ageYears) && ageYears > 0) {
      initialAge = String(ageYears);
    }
  }
  const initialAgeNum = initialAge ? parseInt(initialAge, 10) : DEFAULT_AGE;
  const clampedAge = isNaN(initialAgeNum) ? DEFAULT_AGE : Math.max(MIN_AGE, Math.min(MAX_AGE, initialAgeNum));
  const [age, setAge] = useState(String(clampedAge));

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
    // Email maps directly
    setValue('email', email);

    // Persist email so we can reuse it on the "Créer un compte" screen
    if (email) {
      AsyncStorage.setItem(QUESTIONNAIRE_EMAIL, email).catch(() => {
        // Non-blocking: ignore storage errors
      });
    }

    // Split "Nom & Prénom" into first_name / last_name
    const trimmedName = name.trim();
    if (trimmedName) {
      const parts = trimmedName.split(/\s+/);
      const first = parts[0];
      const last = parts.slice(1).join(' ') || parts[0];
      setValue('first_name', first);
      setValue('last_name', last);
    }

    // Map local sex selection to backend gender enum
    let gender: 'male' | 'female' | 'other' | undefined;
    if (sex === 'homme') gender = 'male';
    else if (sex === 'femme') gender = 'female';
    else if (sex === 'autre') gender = 'other';
    if (gender) {
      setValue('gender', gender);
    }

    // Approximate birth_date from selected age (YYYY-01-01)
    const ageNumber = parseInt(age, 10);
    if (!isNaN(ageNumber) && ageNumber > 0) {
      const now = new Date();
      const birthYear = now.getFullYear() - ageNumber;
      const birthDateStr = `${birthYear}-01-01`;
      setValue('birth_date', birthDateStr);
    }
    router.push('/(questionnaire)/step3');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <QuestionnaireHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        backRoute="/(questionnaire)/step1"
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
              Parlez-nous de <Text style={styles.headlineHighlight}>vous</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={colors.accent.blue}
                  cursorColor={colors.accent.blue}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nom Prénom</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Jean Dupont"
                  placeholderTextColor={colors.text.secondary}
                  value={name}
                  onChangeText={setName}
                  selectionColor={colors.accent.blue}
                  cursorColor={colors.accent.blue}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Gender Toggle */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Sexe</Text>
              <View style={styles.genderToggleContainer}>
                <GenderButton
                  value="homme"
                  icon="gender-male"
                  label="Homme"
                  isSelected={sex === 'homme'}
                  onSelect={setSex}
                />
                <GenderButton
                  value="femme"
                  icon="gender-female"
                  label="Femme"
                  isSelected={sex === 'femme'}
                  onSelect={setSex}
                />
              </View>
            </View>

            {/* Age Picker */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, styles.fieldLabelCentered]}>Votre âge</Text>
              <WheelPicker
                data={ageOptions}
                onValueChange={(v) => setAge(String(v))}
                itemHeight={52}
                wheelHeight={260}
                fontSize={22}
                highlightColor={colors.accent.blue}
                initialIndex={clampedAge - MIN_AGE}
              />
            </View>
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
  headline: {
    ...questionnaireTokens.typography.headline,
    color: colors.text.primary,
    textAlign: 'left',
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  formContainer: {
    gap: questionnaireTokens.spacing.xl,
  },
  fieldGroup: {
    gap: questionnaireTokens.spacing.sm,
  },
  fieldLabel: {
    ...questionnaireTokens.typography.label,
    color: colors.text.primary,
    marginLeft: questionnaireTokens.spacing.xs,
  },
  fieldLabelCentered: {
    textAlign: 'center',
    marginLeft: 0,
    marginTop: questionnaireTokens.spacing.md,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIconContainer: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  inputWithIcon: {
    width: '100%',
    backgroundColor: colors.primary.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: questionnaireTokens.borderRadius.md,
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 16,
    color: colors.text.primary,
    fontSize: 15,
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary.medium,
    borderRadius: questionnaireTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 4,
    gap: 6,
  },
  genderButtonWrapper: {
    flex: 1,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: questionnaireTokens.borderRadius.sm,
    backgroundColor: 'transparent',
    gap: 6,
  },
  genderOptionSelected: {
    backgroundColor: colors.accent.blue,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  genderTextSelected: {
    color: colors.text.primary,
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
