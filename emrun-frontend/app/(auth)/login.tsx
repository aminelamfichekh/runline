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
      {/* Radial-like background glow */}
      <View style={styles.backgroundGlow} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Top bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.backIcon}>{'‹'}</Text>
            </TouchableOpacity>

            <View style={styles.brandWrapper}>
              <View style={styles.brandLogo}>
                <Text style={styles.brandBolt}>⚡</Text>
              </View>
              <Text style={styles.brandText}>RUNLINE</Text>
            </View>

            <View style={{ width: 48 }} />
          </View>

          {/* Headline */}
          <View style={styles.headlineBlock}>
            <Text style={styles.title}>
              Bon <Text style={styles.titleHighlight}>retour</Text> parmi nous
            </Text>
            <Text style={styles.subtitle}>Prêt pour votre prochaine session ?</Text>
          </View>

          {/* Form */}
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
              placeholder="votre@email.com"
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
              placeholder="••••••••"
            />

            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Mot de passe oublié',
                    "Cette action n'est pas encore configurée. Veuillez contacter le support."
                  )
                }
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Me connecter"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          {/* No "continuer avec" / social section as requested */}
          {/* No sign up link - login page is only for existing users */}
          {/* Users who want to create an account should go through the questionnaire flow */}

          {/* Debug / recovery action: clear tokens and questionnaire state */}
          <View style={styles.debugFooter}>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await clearTokens();
                  await AsyncStorage.multiRemove([
                    QUESTIONNAIRE_SESSION_UUID,
                    QUESTIONNAIRE_PENDING_ATTACH,
                    QUESTIONNAIRE_DRAFT,
                  ]);
                  Alert.alert(
                    'Session réinitialisée',
                    'Toutes les données de connexion et du questionnaire ont été effacées.',
                    [
                      {
                        text: 'OK',
                        onPress: () => router.replace('/'),
                      },
                    ]
                  );
                } catch (error: any) {
                  console.error('Reset session error:', error);
                  Alert.alert(
                    'Erreur',
                    `Échec de la réinitialisation de la session : ${
                      error?.message || 'Erreur inconnue'
                    }. Veuillez réessayer.`
                  );
                }
              }}
            >
              <Text style={styles.debugText}>
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
    backgroundColor: '#111921',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -160,
    left: -80,
    right: -80,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(50, 140, 231, 0.25)',
    opacity: 0.4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 20,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#328ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBolt: {
    color: '#ffffff',
    fontSize: 18,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headlineBlock: {
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleHighlight: {
    color: '#328ce7',
  },
  subtitle: {
    fontSize: 14,
    color: '#93adc8',
    fontWeight: '300',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
    gap: 12,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#328ce7',
    fontWeight: '500',
  },
  debugFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
