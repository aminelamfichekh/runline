/**
 * Register Screen
 * Allows new users to create an account
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerSchema, type RegisterFormData } from '@/lib/validation/authSchema';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { QUESTIONNAIRE_SESSION_UUID } from '@/lib/storage/keys';

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    console.log('Starting registration with:', { email: data.email, name: data.name });
    
    try {
      // Récupérer session_uuid depuis AsyncStorage
      let sessionUuid: string | undefined;
      try {
        const storedUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
        if (storedUuid) {
          sessionUuid = storedUuid;
          console.log('Found questionnaire session UUID:', sessionUuid);
        }
      } catch (error) {
        console.log('No questionnaire session UUID found');
      }

      // Préparer payload avec session_uuid si disponible
      const registerPayload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      if (sessionUuid) {
        registerPayload.session_uuid = sessionUuid;
      }

      const response = await authApi.register(registerPayload);
      console.log('Registration successful:', response);
      setIsLoading(false);

      // Rediriger vers profil (questionnaire déjà attaché automatiquement)
      router.replace('/(tabs)/profile');
      
      // Show success message after a short delay
      setTimeout(() => {
        Alert.alert(
          'Compte créé',
          'Votre compte a été créé avec succès !',
          [{ text: 'OK' }]
        );
      }, 500);
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      setIsLoading(false);

      let errorMessage = 'Échec de la création du compte. Veuillez réessayer.';
      let errorDetails = '';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 422) {
          // Validation errors from backend
          if (data?.errors) {
            const errorDetailsList = Object.entries(data.errors)
              .map(([field, messages]: [string, any]) => {
                const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
              })
              .join('\n');
            errorMessage = 'Erreur de validation';
            errorDetails = errorDetailsList;
          } else if (data?.message) {
            errorMessage = 'Erreur de validation';
            errorDetails = data.message;
          }
        } else if (status === 500) {
          errorMessage = 'Erreur serveur';
          errorDetails = 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.';
        } else if (status === 401) {
          errorMessage = 'Erreur d\'authentification';
          errorDetails = 'Veuillez vérifier vos informations.';
        } else if (data?.message) {
          errorMessage = 'Erreur';
          errorDetails = data.message;
        } else {
          errorDetails = `HTTP ${status}: ${error.response.statusText || 'Erreur inconnue'}`;
        }
      } else if (error.message) {
        if (error.message.includes('Network') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Erreur de connexion';
          errorDetails = 'Impossible de se connecter au serveur. Veuillez vérifier :\n1. Le backend est en cours d\'exécution (php artisan serve --host=0.0.0.0)\n2. L\'adresse IP correcte dans le fichier .env\n3. Téléphone et ordinateur sur le même WiFi';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Erreur de délai';
          errorDetails = 'La demande a pris trop de temps. Veuillez vérifier votre connexion et réessayer.';
        } else {
          errorMessage = 'Erreur';
          errorDetails = error.message;
        }
      } else {
        errorDetails = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
      }

      Alert.alert(errorMessage, errorDetails, [{ text: 'OK' }]);
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
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Inscrivez-vous pour commencer</Text>
          </View>

          <View style={styles.form}>
            <TextInputField
              label="Nom complet"
              value={watch('name')}
              onChangeText={(text) => setValue('name', text, { shouldValidate: true })}
              error={errors.name?.message}
              required
              autoCapitalize="words"
              placeholder="Entrez votre nom complet"
            />

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
              placeholder="Entrez votre mot de passe (min 8 caractères)"
            />

            <TextInputField
              label="Confirmer le mot de passe"
              value={watch('password_confirmation')}
              onChangeText={(text) => setValue('password_confirmation', text, { shouldValidate: true })}
              error={errors.password_confirmation?.message}
              required
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholder="Confirmez votre mot de passe"
            />

            <Button
              title="S'inscrire"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Se connecter</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
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
