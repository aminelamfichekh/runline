/**
 * Step 2: Informations personnelles
 * Uses FlatList fake wheel for age (always starts at 18).
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUESTIONNAIRE_EMAIL } from '@/lib/storage/keys';
import { WheelPicker } from '@/components/ui/WheelPicker';

const MIN_AGE = 18;
const MAX_AGE = 90;
const DEFAULT_AGE = 18;
const ageOptions = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map((v) => ({
  value: v,
  label: String(v),
}));

export default function Step2Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

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
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.push('/(questionnaire)/step1')} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.logo}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '22%' }]} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
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
                    color="#93adc8"
                  />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="votre@email.com"
                  placeholderTextColor="#93adc8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor="#328ce7"
                  cursorColor="#328ce7"
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
                    color="#93adc8"
                  />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Jean Dupont"
                  placeholderTextColor="#93adc8"
                  value={name}
                  onChangeText={setName}
                  selectionColor="#328ce7"
                  cursorColor="#328ce7"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Gender Toggle */}
            <View style={[styles.fieldGroup, { paddingTop: 8 }]}>
              <Text style={styles.fieldLabel}>Sexe</Text>
              <View style={styles.genderToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    sex === 'homme' && styles.genderOptionSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSex('homme')}
                >
                  <MaterialCommunityIcons
                    name="gender-male"
                    size={20}
                    color={sex === 'homme' ? '#ffffff' : '#93adc8'}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      sex === 'homme' && styles.genderTextSelected,
                    ]}
                  >
                    Homme
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    sex === 'femme' && styles.genderOptionSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSex('femme')}
                >
                  <MaterialCommunityIcons
                    name="gender-female"
                    size={20}
                    color={sex === 'femme' ? '#ffffff' : '#93adc8'}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      sex === 'femme' && styles.genderTextSelected,
                    ]}
                  >
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Age – FlatList fake wheel (default 18) */}
            <View style={[styles.fieldGroup, { paddingTop: 12 }]}>
              <Text style={[styles.fieldLabel, { textAlign: 'center' }]}>
                Votre âge
              </Text>
              <WheelPicker
                data={ageOptions}
                onValueChange={(v) => setAge(String(v))}
                itemHeight={44}
                wheelHeight={308}
                fontSize={17}
                highlightColor="#328ce7"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  header: {
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#ffffff',
    textAlign: 'center',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  progressPercent: {
    fontSize: 12,
    color: '#93adc8',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#344d65',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#328ce7',
    borderRadius: 9999,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headlineContainer: {
    paddingVertical: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'left',
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#93adc8',
  },
  formContainer: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputIconContainer: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputWithIcon: {
    width: '100%',
    backgroundColor: '#1a2632',
    borderWidth: 1,
    borderColor: '#344d65',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 44,
    color: '#ffffff',
    fontSize: 15,
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a2632',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#344d65',
    padding: 4,
    gap: 6,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
    gap: 6,
  },
  genderOptionSelected: {
    backgroundColor: '#328ce7',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#93adc8',
  },
  genderTextSelected: {
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
