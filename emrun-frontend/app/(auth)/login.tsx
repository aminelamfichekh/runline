/**
 * Login Screen
 * Allows users to sign in with email and password
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validation/authSchema';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { clearTokens } from '@/lib/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QUESTIONNAIRE_SESSION_UUID,
  QUESTIONNAIRE_PENDING_ATTACH,
  QUESTIONNAIRE_DRAFT,
} from '@/lib/storage/keys';
import { attachQuestionnaireIfNeeded } from '@/lib/utils/attachQuestionnaireSession';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authApi.login({
        email: data.email,
        password: data.password,
      });

      // After successful login, try to attach any pending anonymous questionnaire session
      const attached = await attachQuestionnaireIfNeeded();

      if (attached) {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      let errorMessage = 'Échec de la connexion. Veuillez réessayer.';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Email ou mot de passe invalide. Veuillez vérifier vos informations.';
        } else if (status === 422) {
          // Validation errors from backend
          if (data?.errors) {
            const errorDetails = Object.values(data.errors).flat().join('\n');
            errorMessage = `Erreur de validation :\n${errorDetails}`;
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = 'Erreur de connexion. Veuillez vérifier votre connexion Internet.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Échec de la connexion', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Bon retour</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
          </View>

          <View style={styles.form}>
            <TextInputField
              label="Email"
              value={watch('email')}
              onChangeText={(text) => setValue('email', text, { shouldValidate: true })}
              error={errors.email?.message}
              required
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="Entrez votre email"
            />

            <TextInputField
              label="Mot de passe"
              value={watch('password')}
              onChangeText={(text) => setValue('password', text, { shouldValidate: true })}
              error={errors.password?.message}
              required
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="Entrez votre mot de passe"
            />

            <Button
              title="Se connecter"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous n'avez pas de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          {/* Debug / recovery action: clear tokens and questionnaire state */}
          <View style={[styles.footer, { marginTop: 16 }]}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await clearTokens();
                  await AsyncStorage.multiRemove([
                    QUESTIONNAIRE_SESSION_UUID,
                    QUESTIONNAIRE_PENDING_ATTACH,
                    QUESTIONNAIRE_DRAFT,
                  ]);
                  Alert.alert('Session réinitialisée', 'Toutes les données de connexion et du questionnaire ont été effacées.', [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/'),
                    },
                  ]);
                } catch (error: any) {
                  console.error('Reset session error:', error);
                  Alert.alert('Erreur', `Échec de la réinitialisation de la session : ${error?.message || 'Erreur inconnue'}. Veuillez réessayer.`);
                }
              }}
            >
              <Text style={[styles.footerLink, { fontSize: 13, color: '#888' }]}>
                Réinitialiser la session (effacer connexion & questionnaire)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#999',
    fontWeight: '400',
  },
  form: {
    marginBottom: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#999',
  },
  footerLink: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});



