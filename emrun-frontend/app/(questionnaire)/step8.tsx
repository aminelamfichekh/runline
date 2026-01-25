/**
 * Step 8: Additional Context
 * equipment, personal_constraints, injuries (all optional)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { profileApi } from '@/lib/api/profile';
import { cleanConditionalFields } from '@/lib/validation/profileSchema';

export default function Step8Screen() {
  const router = useRouter();
  const { form, currentStep, totalSteps, prevStep, isComplete, getPreviousStepRoute } = useQuestionnaireForm();

  const { setValue, watch, formState: { errors }, handleSubmit } = form;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    prevStep();
    const previousRoute = getPreviousStepRoute();
    if (previousRoute) {
      router.replace(previousRoute);
    }
  };

  const onSubmit = async (data: any) => {
    if (!isComplete) {
      Alert.alert('Incomplet', 'Veuillez compléter tous les champs requis.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean conditional fields before sending
      const cleanedData = cleanConditionalFields(data);

      // Remove undefined values and empty strings
      const payload = Object.fromEntries(
        Object.entries(cleanedData).filter(([_, v]) => {
          if (v === undefined || v === null) return false;
          if (typeof v === 'string' && v.trim() === '') return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        })
      );

      console.log('Submitting profile data:', JSON.stringify(payload, null, 2));

      const response = await profileApi.updateProfile(payload);

      console.log('Profile update response:', response);

      Alert.alert(
        'Succès',
        'Votre profil a été enregistré avec succès !',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Profile update error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // More detailed error message
      let errorMessage = 'Échec de l\'enregistrement du profil.';
      let errorDetails = '';

      if (error.response) {
        // Backend returned an error
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = 'Authentification requise.';
          errorDetails = 'Veuillez vous connecter d\'abord pour enregistrer votre profil.';
        } else if (status === 422) {
          // Validation error
          errorMessage = 'Erreur de validation';
          if (data?.errors) {
            const errors = Object.entries(data.errors)
              .map(([field, messages]: [string, any]) => {
                const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
              })
              .join('\n');
            errorDetails = errors;
          } else if (data?.message) {
            errorDetails = data.message;
          } else {
            errorDetails = 'Veuillez vérifier vos données et réessayer.';
          }
        } else if (status === 500) {
          errorMessage = 'Erreur serveur';
          errorDetails = 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.';
        } else if (data?.message) {
          errorMessage = 'Erreur';
          errorDetails = data.message;
        } else {
          errorDetails = `HTTP ${status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = 'Erreur de connexion';
          errorDetails = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet et vous assurer que le backend est en cours d\'exécution.';
        } else {
          errorMessage = 'Erreur';
          errorDetails = error.message;
        }
      } else {
        errorDetails = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
      }

      Alert.alert(
        errorMessage,
        errorDetails,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <ProgressBar current={currentStep} total={totalSteps} />
        <TouchableOpacity onPress={() => router.push('/')} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Informations additionnelles</Text>
        <Text style={styles.subtitle}>
          Partagez tous les détails supplémentaires qui pourraient nous aider à créer un meilleur plan pour vous. (Tout est optionnel)
        </Text>

        <TextInputField
          label="Équipement"
          value={watch('equipment')}
          onChangeText={(text) => setValue('equipment', text)}
          error={errors.equipment?.message}
          multiline
          numberOfLines={3}
          placeholder="ex: Chaussures de course, montre GPS, ceinture cardio"
        />

        <TextInputField
          label="Contraintes personnelles/professionnelles"
          value={watch('personal_constraints')}
          onChangeText={(text) => setValue('personal_constraints', text)}
          error={errors.personal_constraints?.message}
          multiline
          numberOfLines={4}
          placeholder="ex: Horaires de travail, garde d'enfants"
        />

        <TextInputField
          label="Blessures passées ou limitations"
          value={watch('injuries')?.join(', ') || ''}
          onChangeText={(text) => {
            const injuries = text.split(',').map(i => i.trim()).filter(i => i);
            setValue('injuries', injuries.length > 0 ? injuries : undefined);
          }}
          error={errors.injuries?.message}
          multiline
          numberOfLines={3}
          placeholder="ex: Blessure au genou il y a 2 ans, douleur au bas du dos"
          helperText="Séparez plusieurs éléments avec des virgules"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isComplete ? "Terminer le questionnaire" : "Complétez d'abord les champs requis"}
          onPress={handleSubmit(onSubmit)}
          disabled={!isComplete || isSubmitting}
          loading={isSubmitting}
        />
        {!isComplete && (
          <Text style={styles.completionHint}>
            Veuillez revenir en arrière et compléter tous les champs requis marqués avec *
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  completionHint: {
    color: '#ff9800',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});

