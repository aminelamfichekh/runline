/**
 * Contact Us Screen
 * Subject dropdown + description + send via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '@/components/ui/KeyboardDoneBar';

const CONTACT_EMAIL = 'contact@runline.fr';

const SUBJECTS = [
  { value: 'plan', label: 'Mon plan d\'entraînement', icon: 'barbell-outline' as const },
  { value: 'subscription', label: 'Mon abonnement / facturation', icon: 'card-outline' as const },
  { value: 'bug', label: 'Bug ou problème technique', icon: 'bug-outline' as const },
  { value: 'account', label: 'Mon compte', icon: 'person-outline' as const },
  { value: 'suggestion', label: 'Suggestion d\'amélioration', icon: 'bulb-outline' as const },
  { value: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline' as const },
];

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const selectedSubjectLabel = SUBJECTS.find(s => s.value === selectedSubject)?.label || '';
  const canSend = selectedSubject && description.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;

    const subject = encodeURIComponent(`[RUNLINE] ${selectedSubjectLabel}`);
    const userInfo = user?.email ? `\n\n---\nCompte RUNLINE : ${user.email}` : '';
    const body = encodeURIComponent(description.trim() + userInfo);
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert(
          'Aucune app email',
          `Envoyez votre message à ${CONTACT_EMAIL}`,
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Erreur',
        `Impossible d'ouvrir l'email. Contactez-nous à ${CONTACT_EMAIL}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contactez-nous</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro */}
          <View style={styles.introCard}>
            <View style={styles.introIconWrap}>
              <Ionicons name="chatbubbles-outline" size={28} color={colors.accent.blue} />
            </View>
            <Text style={styles.introTitle}>Comment pouvons-nous vous aider ?</Text>
            <Text style={styles.introText}>
              Décrivez votre demande et nous vous répondrons dans les plus brefs délais.
            </Text>
          </View>

          {/* Subject Picker */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>OBJET</Text>
            <TouchableOpacity
              style={[
                styles.subjectSelector,
                selectedSubject && styles.subjectSelectorActive,
              ]}
              onPress={() => setShowSubjectPicker(true)}
              activeOpacity={0.7}
            >
              {selectedSubject ? (
                <View style={styles.subjectSelected}>
                  <Ionicons
                    name={SUBJECTS.find(s => s.value === selectedSubject)?.icon || 'help-outline'}
                    size={20}
                    color={colors.accent.blue}
                  />
                  <Text style={styles.subjectSelectedText}>{selectedSubjectLabel}</Text>
                </View>
              ) : (
                <Text style={styles.subjectPlaceholder}>Choisir un objet</Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Décrivez votre demande en détail..."
              placeholderTextColor={colors.text.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={2000}
              textAlignVertical="top"
              selectionColor={colors.accent.blue}
              cursorColor={colors.accent.blue}
              returnKeyType="default"
              blurOnSubmit={false}
              inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_DONE_ID : undefined}
            />
            <Text style={styles.charCount}>{description.length}/2000</Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>

          {/* Email fallback */}
          <Text style={styles.emailHint}>
            Ou écrivez-nous directement à{' '}
            <Text style={styles.emailLink} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
              {CONTACT_EMAIL}
            </Text>
          </Text>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Subject Picker Modal */}
      <Modal
        visible={showSubjectPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubjectPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisir un objet</Text>
            {SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject.value}
                style={[
                  styles.modalOption,
                  selectedSubject === subject.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedSubject(subject.value);
                  setShowSubjectPicker(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={subject.icon}
                  size={20}
                  color={selectedSubject === subject.value ? colors.accent.blue : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedSubject === subject.value && styles.modalOptionTextActive,
                  ]}
                >
                  {subject.label}
                </Text>
                {selectedSubject === subject.value && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent.blue} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav activeTab="profile" />

      <KeyboardDoneBar />
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Intro
  introCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  introIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Fields
  fieldSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text.tertiary,
    marginBottom: 10,
  },

  // Subject Selector
  subjectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: colors.background.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
  },
  subjectSelectorActive: {
    borderColor: 'rgba(50, 140, 231, 0.3)',
  },
  subjectPlaceholder: {
    fontSize: 15,
    color: colors.text.tertiary,
  },
  subjectSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectSelectedText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },

  // Text Area
  textArea: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: 6,
  },

  // Send Button
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.blue,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Email hint
  emailHint: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailLink: {
    color: colors.accent.blue,
    textDecorationLine: 'underline',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.medium,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  modalOptionTextActive: {
    color: colors.accent.blue,
    fontWeight: '600',
  },
});
