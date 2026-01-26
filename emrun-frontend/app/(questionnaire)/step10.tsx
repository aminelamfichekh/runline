/**
 * Step 10: Contraintes personnelles / professionnelles (optional)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function Step10Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();
  const { setValue, watch } = form;

  const handleContinue = () => {
    router.push('/(questionnaire)/preview');
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
        <Text style={styles.stepIndicator}>10/10</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.stepNumber}>10</Text>
          <Text style={styles.title}>{t('onboarding.step10.title')}</Text>
          <Text style={styles.optional}>({t('onboarding.step10.optional')})</Text>
          <Text style={styles.subtitle}>{t('onboarding.step10.subtitle')}</Text>

          <TextInputField
            label=""
            value={watch('contraintes')}
            onChangeText={(text) => setValue('contraintes', text)}
            placeholder={t('onboarding.step10.placeholder')}
            multiline
            numberOfLines={5}
            optional
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Terminer le questionnaire" onPress={handleContinue} />
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
  optional: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.text.secondary, marginBottom: 24 },
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border.medium, backgroundColor: colors.primary.dark },
});
