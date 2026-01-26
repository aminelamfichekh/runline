/**
 * Step 2: Informations personnelles
 * With wheel pickers for age, weight, height, volume
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WheelPicker } from '@quidone/react-native-wheel-picker';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// Generate arrays for wheel pickers
const ages = Array.from({ length: 83 }, (_, i) => ({ value: i + 18, label: `${i + 18} ans` }));
const weights = Array.from({ length: 151 }, (_, i) => ({ value: i + 30, label: `${i + 30} kg` }));
const heights = Array.from({ length: 121 }, (_, i) => ({ value: i + 130, label: `${i + 130} cm` }));
const volumes = Array.from({ length: 21 }, (_, i) => ({ value: i * 5, label: `${i * 5} km/sem` }));

type PickerType = 'age' | 'weight' | 'height' | 'volume' | null;

export default function Step2Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);

  const age = watch('age') || 25;
  const weight = watch('weight') || 70;
  const height = watch('height') || 170;
  const volume = watch('volume') || 20;
  const sexe = watch('sexe');

  const openPicker = (type: PickerType) => {
    if (type === 'age') setTempValue(age);
    else if (type === 'weight') setTempValue(weight);
    else if (type === 'height') setTempValue(height);
    else if (type === 'volume') setTempValue(volume);
    setActivePicker(type);
  };

  const confirmPicker = () => {
    if (tempValue !== null && activePicker) {
      setValue(activePicker, tempValue);
    }
    setActivePicker(null);
  };

  const handleContinue = () => {
    router.push('/(questionnaire)/step3');
  };

  const handleBack = () => {
    router.back();
  };

  const getPickerData = () => {
    if (activePicker === 'age') return ages;
    if (activePicker === 'weight') return weights;
    if (activePicker === 'height') return heights;
    if (activePicker === 'volume') return volumes;
    return [];
  };

  const getCurrentIndex = () => {
    if (activePicker === 'age') return ages.findIndex(a => a.value === (tempValue || age));
    if (activePicker === 'weight') return weights.findIndex(w => w.value === (tempValue || weight));
    if (activePicker === 'height') return heights.findIndex(h => h.value === (tempValue || height));
    if (activePicker === 'volume') return volumes.findIndex(v => v.value === (tempValue || volume));
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>2/10</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.title}>{t('onboarding.step2.title')}</Text>
          <Text style={styles.required}>({t('onboarding.step2.required')})</Text>

          {/* Nom Prénom */}
          <TextInputField
            label={t('onboarding.step2.nomPrenomLabel')}
            value={watch('nom_prenom')}
            onChangeText={(text) => setValue('nom_prenom', text)}
            placeholder={t('onboarding.step2.nomPrenomPlaceholder')}
          />

          {/* Age - Wheel Picker */}
          <Text style={styles.label}>{t('onboarding.step2.ageLabel')}</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('age')}>
            <Text style={styles.pickerButtonText}>{age} ans</Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>

          {/* Sexe */}
          <Text style={styles.label}>{t('onboarding.step2.sexeLabel')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionButton, sexe === 'homme' && styles.optionButtonSelected]}
              onPress={() => setValue('sexe', 'homme')}
            >
              <Text style={[styles.optionText, sexe === 'homme' && styles.optionTextSelected]}>
                {t('onboarding.step2.sexeHomme')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, sexe === 'femme' && styles.optionButtonSelected]}
              onPress={() => setValue('sexe', 'femme')}
            >
              <Text style={[styles.optionText, sexe === 'femme' && styles.optionTextSelected]}>
                {t('onboarding.step2.sexeFemme')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Poids - Wheel Picker */}
          <Text style={styles.label}>{t('onboarding.step2.poidsLabel')}</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('weight')}>
            <Text style={styles.pickerButtonText}>{weight} kg</Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>

          {/* Taille - Wheel Picker */}
          <Text style={styles.label}>{t('onboarding.step2.tailleLabel')}</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('height')}>
            <Text style={styles.pickerButtonText}>{height} cm</Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>

          {/* Volume - Wheel Picker */}
          <Text style={styles.label}>{t('onboarding.step2.volumeLabel')}</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker('volume')}>
            <Text style={styles.pickerButtonText}>{volume} km/semaine</Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Wheel Picker Modal */}
      <Modal visible={activePicker !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPicker}>
                <Text style={styles.modalConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
            <WheelPicker
              data={getPickerData()}
              value={tempValue}
              onValueChanged={({ item }) => setTempValue(item.value)}
              itemHeight={50}
              selectedIndicatorStyle={styles.selectedIndicator}
              itemTextStyle={styles.wheelItemText}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Button title={t('onboarding.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary.medium,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '300',
  },
  stepIndicator: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text.secondary,
    fontSize: 28,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.accent.blue,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  required: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  pickerButtonIcon: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: colors.accent.blue,
    backgroundColor: `${colors.accent.blue}15`,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.accent.blue,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.medium,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  modalConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.blue,
  },
  selectedIndicator: {
    backgroundColor: `${colors.accent.blue}20`,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.accent.blue,
  },
  wheelItemText: {
    fontSize: 18,
    color: colors.text.primary,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
    backgroundColor: colors.primary.dark,
  },
});
