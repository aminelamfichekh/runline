/**
 * Step 4: Historique de course
 * Converted from HTML design with dropdown and record inputs
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function Step4Screen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [pauseDuration, setPauseDuration] = useState(watch('pause_duration_select') || '');
  const [record5k, setRecord5k] = useState(watch('record_5k') || '');
  const [record10k, setRecord10k] = useState(watch('record_10k') || '');

  const handleContinue = () => {
    setValue('pause_duration_select', pauseDuration);
    setValue('record_5k', record5k);
    setValue('record_10k', record10k);
    router.push('/(questionnaire)/step5');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Étape 2 sur 4</Text>
            <Text style={styles.progressPercent}>50%</Text>
          </View>
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
              Votre {'\n'}
              <Text style={styles.headlineHighlight}>historique de course</Text>
            </Text>
            <Text style={styles.subheadline}>
              Afin d'adapter votre plan de reprise, dites-nous en plus sur votre expérience passée.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Pause Duration Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color="#328ce7" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Durée de la pause</Text>
                  <Text style={styles.cardSubtitle}>Depuis votre dernier run régulier</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={pauseDuration}
                    onValueChange={(value) => setPauseDuration(value)}
                    style={styles.picker}
                    dropdownIconColor="#328ce7"
                  >
                    <Picker.Item label="Sélectionnez une durée" value="" color="#5a7690" />
                    <Picker.Item label="Moins de 3 mois" value="3m" color="#ffffff" />
                    <Picker.Item label="3 à 6 mois" value="6m" color="#ffffff" />
                    <Picker.Item label="6 mois à 1 an" value="1y" color="#ffffff" />
                    <Picker.Item label="Plus d'1 an" value="long" color="#ffffff" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Records Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="trophy" size={24} color="#328ce7" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Records personnels</Text>
                  <Text style={styles.cardSubtitle}>Vos meilleurs temps (Facultatif)</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                {/* 5K Record */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelBadge}>
                    <Text style={styles.inputLabelText}>5 KM</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ex: 25:30"
                    placeholderTextColor="#5a7690"
                    value={record5k}
                    onChangeText={setRecord5k}
                  />
                </View>

                {/* 10K Record */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelBadge}>
                    <Text style={styles.inputLabelText}>10 KM</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ex: 55:00"
                    placeholderTextColor="#5a7690"
                    value={record10k}
                    onChangeText={setRecord10k}
                  />
                </View>
              </View>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#344d65',
    backgroundColor: '#1a2632',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#93adc8',
    marginTop: 2,
  },
  cardContent: {
    paddingLeft: 56,
    gap: 16,
  },
  pickerWrapper: {
    backgroundColor: '#111921',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#344d65',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  inputGroup: {
    position: 'relative',
  },
  inputLabelBadge: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#111921',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  inputLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#328ce7',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#111921',
    color: '#ffffff',
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#344d65',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
