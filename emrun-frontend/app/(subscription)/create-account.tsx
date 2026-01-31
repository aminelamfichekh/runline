import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { registerSchema, type RegisterFormData } from '@/lib/validation/authSchema';
import { authApi } from '@/lib/api/auth';
import { QUESTIONNAIRE_EMAIL, QUESTIONNAIRE_SESSION_UUID } from '@/lib/storage/keys';

/**
 * CreateAccountAfterPricingScreen
 *
 * Shown after the user selects a subscription (annual / monthly).
 * Lets the user finalize their RUNLINE account (email + password),
 * then sends them to the payment screen.
 */
export default function CreateAccountAfterPricingScreen() {
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

  // Pre-fill email from questionnaire (Step 2) so the user
  // doesn't have to type it again here.
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem(QUESTIONNAIRE_EMAIL);
        if (storedEmail) {
          setValue('email', storedEmail, { shouldValidate: true });
        }
      } catch {
        // ignore, user can still type manually if something goes wrong
      }
    };
    loadEmail();
  }, [setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Try to attach questionnaire session if it exists
      let sessionUuid: string | undefined;
      try {
        const storedUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
        if (storedUuid) {
          sessionUuid = storedUuid;
        }
      } catch {
        // Ignore storage errors, registration can still succeed
      }

      const payload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      if (sessionUuid) {
        payload.session_uuid = sessionUuid;
      }

      await authApi.register(payload);

      // After account is created, go to subscription checkout (payment)
      router.replace('/(subscription)/checkout');
    } catch (error: any) {
      let message = "Échec de la création du compte. Veuillez réessayer.";
      let details = '';

      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 422 && data?.errors) {
          const errorDetailsList = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());
              return `${fieldName}: ${
                Array.isArray(messages) ? messages.join(', ') : messages
              }`;
            })
            .join('\n');
          message = 'Erreur de validation';
          details = errorDetailsList;
        } else if (data?.message) {
          message = 'Erreur';
          details = data.message;
        }
      } else if (error?.message) {
        details = error.message;
      }

      Alert.alert(message, details || undefined, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressLabel}>Inscription complétée</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Finalisez votre <Text style={styles.headlineHighlight}>compte</Text>
          </Text>
          <Text style={styles.subheadline}>
            Prêt pour votre première session d&apos;entraînement ?
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInputField
            label="Nom complet"
            value={watch('name')}
            onChangeText={(text) => setValue('name', text, { shouldValidate: true })}
            error={errors.name?.message}
            required
            autoCapitalize="words"
            placeholder="Jean Dupont"
            control={control}
            name="name"
          />

          <View style={styles.readonlyField}>
            <Text style={styles.readonlyLabel}>Email</Text>
            <Text style={styles.readonlyValue}>
              {watch('email') || 'Récupération de votre email...'}
            </Text>
          </View>

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
            control={control}
            name="password"
          />

          <TextInputField
            label="Confirmer le mot de passe"
            value={watch('password_confirmation')}
            onChangeText={(text) =>
              setValue('password_confirmation', text, { shouldValidate: true })
            }
            error={errors.password_confirmation?.message}
            required
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Confirmez votre mot de passe"
            control={control}
            name="password_confirmation"
          />
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>i</Text>
          <Text style={styles.infoText}>
            Vos informations de profil et de paiement sont déjà enregistrées en toute
            sécurité.
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <View style={styles.footer}>
          <Button
            title="Créer mon compte"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          />
          <Text style={styles.footerNote}>
            En cliquant, vous acceptez nos conditions d&apos;utilisation
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backIcon: {
    color: colors.text.primary,
    fontSize: 20,
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: colors.text.primary,
    textAlign: 'center',
  },
  progressWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: 9999,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headlineContainer: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  headlineHighlight: {
    color: colors.accent.blue,
  },
  subheadline: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  readonlyField: {
    marginTop: 4,
  },
  readonlyLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  readonlyValue: {
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoBox: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(49,140,231,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(49,140,231,0.3)',
    gap: 8,
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(49,140,231,0.2)',
    color: colors.accent.blue,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: 24,
  },
  footerNote: {
    marginTop: 10,
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

