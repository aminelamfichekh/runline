/**
 * Step 5: Depuis combien de temps cours-tu de manière régulière ? (Wheel picker)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WheelPicker } from '@quidone/react-native-wheel-picker';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

// Generate experience options
const experienceOptions = [
  { value: 'commence', label: 'Je commence' },
  ...Array.from({ length: 11 }, (_, i) => ({ value: `${i + 1}_mois`, label: `${i + 1} mois` })),
  ...Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}_ans`, label: `${i + 1} an${i > 0 ? 's' : ''}` })),
  { value: 'plus_10', label: '+ de 10 ans' },
];

export default function Step5Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState(watch('experience') || 'commence');

  const experience = watch('experience') || 'commence';
  const experienceLabel = experienceOptions.find(opt => opt.value === experience)?.label || 'Je commence';

  const confirmPicker = () => {
    setValue('experience', tempValue);
    setShowPicker(false);
  };

  const handleContinue = () => {
    router.push('/(questionnaire)/step6');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>5/10</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.stepNumber}>5</Text>
          <Text style={styles.title}>{t('onboarding.step5.title')}</Text>
          <Text style={styles.required}>({t('onboarding.step5.required')})</Text>

          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.pickerButtonText}>{experienceLabel}</Text>
            <Text style={styles.pickerButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPicker}>
                <Text style={styles.modalConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
            <WheelPicker
              data={experienceOptions}
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
  container: { flex: 1, backgroundColor: colors.primary.dark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.primary.medium },
  backButtonText: { color: colors.text.primary, fontSize: 24, fontWeight: '300' },
  stepIndicator: { fontSize: 15, fontWeight: '600', color: colors.text.secondary },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { color: colors.text.secondary, fontSize: 28, fontWeight: '300' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  stepNumber: { fontSize: 48, fontWeight: '800', color: colors.accent.blue, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  required: { fontSize: 14, color: colors.text.secondary, marginBottom: 32 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background.card, borderWidth: 2, borderColor: colors.border.medium, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20 },
  pickerButtonText: { fontSize: 16, fontWeight: '500', color: colors.text.primary },
  pickerButtonIcon: { fontSize: 12, color: colors.text.secondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.primary.medium, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.medium },
  modalCancel: { fontSize: 16, color: colors.text.secondary },
  modalConfirm: { fontSize: 16, fontWeight: '600', color: colors.accent.blue },
  selectedIndicator: { backgroundColor: `${colors.accent.blue}20`, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.accent.blue },
  wheelItemText: { fontSize: 18, color: colors.text.primary },
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border.medium, backgroundColor: colors.primary.dark },
});
