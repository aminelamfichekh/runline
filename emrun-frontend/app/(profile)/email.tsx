/**
 * Change Email Screen
 * Allows users to change their email address
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/lib/api/auth';
import { useNotification } from '@/contexts/NotificationContext';
import { colors } from '@/constants/colors';
import { BottomNav } from '@/components/ui/BottomNav';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '@/components/ui/KeyboardDoneBar';

export default function EmailScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCurrentEmail = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setCurrentEmail(response.user?.email || '');
      } catch {
        // ignore
      } finally {
        setIsFetching(false);
      }
    };
    loadCurrentEmail();
  }, []);

  const validate = () => {
    if (!newEmail.trim()) {
      setError('Le nouvel email est requis');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError('Format d\'email invalide');
      return false;
    }
    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setError('Le nouvel email est identique à l\'actuel');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.updateAccount({ email: newEmail.trim() });
      showNotification('Email modifié avec succès', 'success');
      router.back();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du changement d\'email';
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.email) {
        setError(Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email);
      } else {
        showNotification(message, 'error');
      }
    } finally {
      setIsLoading(false);
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
        <Text style={styles.headerTitle}>Email</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={40} color={colors.accent.blue} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Modifier votre{'\n'}adresse email</Text>
          <Text style={styles.subtitle}>
            Entrez votre nouvelle adresse email ci-dessous.
          </Text>

          {isFetching ? (
            <ActivityIndicator color={colors.accent.blue} style={{ marginTop: 32 }} />
          ) : (
            <>
              {/* Form */}
              <View style={styles.form}>
                {/* Current Email (read-only) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email actuel</Text>
                  <View style={styles.readOnlyContainer}>
                    <Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />
                    <Text style={styles.readOnlyText}>{currentEmail}</Text>
                  </View>
                </View>

                {/* New Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nouvel email</Text>
                  <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                    <Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />
                    <TextInput
                      style={styles.input}
                      value={newEmail}
                      onChangeText={(text) => {
                        setNewEmail(text);
                        if (error) setError('');
                      }}
                      placeholder="votre@nouvel-email.com"
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="done"
                      inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_DONE_ID : undefined}
                    />
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Enregistrer</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: 4,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
    opacity: 0.6,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    marginLeft: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
