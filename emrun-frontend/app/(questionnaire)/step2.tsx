/**
 * Step 2: Informations personnelles
 * Converted from HTML design with form inputs
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function Step2Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [name, setName] = useState(watch('name') || '');
  const [email, setEmail] = useState(watch('email') || '');
  const [sex, setSex] = useState(watch('sex') || '');
  const [age, setAge] = useState(watch('age')?.toString() || '');

  const handleContinue = () => {
    setValue('name', name);
    setValue('email', email);
    setValue('sex', sex);
    setValue('age', parseInt(age) || 0);
    router.push('/(questionnaire)/step3');
  };

  const renderInputCard = (
    icon: string,
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#93adc8" />
      </View>
      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
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
              Vos {'\n'}
              <Text style={styles.headlineHighlight}>informations personnelles</Text>
            </Text>
            <Text style={styles.subheadline}>
              Ces détails nous aident à personnaliser votre plan d'entraînement et calculer vos zones d'effort.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {renderInputCard('account', 'Nom & Prénom', 'Ex: Thomas Dupont', name, setName)}
            {renderInputCard('email', 'Email', 'nom@exemple.com', email, setEmail, 'email-address')}

            {/* Sex Picker */}
            <View style={styles.inputCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="gender-male-female" size={24} color="#93adc8" />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Sexe</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={sex}
                    onValueChange={(value) => setSex(value)}
                    style={styles.picker}
                    dropdownIconColor="#93adc8"
                  >
                    <Picker.Item label="Sélectionner" value="" color="#64748b" />
                    <Picker.Item label="Homme" value="homme" color="#ffffff" />
                    <Picker.Item label="Femme" value="femme" color="#ffffff" />
                    <Picker.Item label="Autre" value="autre" color="#ffffff" />
                  </Picker>
                </View>
              </View>
            </View>

            {renderInputCard('cake', 'Âge', 'Ex: 28', age, setAge, 'numeric')}
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
    height: 500,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#93adc8',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    gap: 8,
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
    paddingVertical: 24,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    color: '#ffffff',
    marginBottom: 8,
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
    gap: 16,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344d65',
    backgroundColor: '#1a2632',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#243442',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#93adc8',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 15,
    color: '#ffffff',
    padding: 0,
    margin: 0,
  },
  pickerContainer: {
    marginTop: -8,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
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
