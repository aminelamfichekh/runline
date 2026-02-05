import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionnaireProvider } from '@/contexts/QuestionnaireContext';
import { isAuthenticated } from '@/lib/utils/auth';
import { colors } from '@/constants/colors';
import { profileApi } from '@/lib/api/profile';
import { questionnaireApi } from '@/lib/api/questionnaireApi';
import type { ProfileFormData } from '@/lib/validation/profileSchema';
import {
  QUESTIONNAIRE_SESSION_UUID,
  QUESTIONNAIRE_DRAFT,
} from '@/lib/storage/keys';

// Smooth transition configuration for native feel
const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.primary.dark },
  // Smooth slide animation
  animation: 'slide_from_right' as const,
  animationDuration: 280,
  // iOS-specific smooth transitions
  ...(Platform.OS === 'ios' && {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    fullScreenGestureEnabled: true,
  }),
};

export default function QuestionnaireLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ProfileFormData> | undefined>(undefined);
  const [sessionUuid, setSessionUuid] = useState<string | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        // 1) Ensure we have a questionnaire session UUID (server-side session)
        let storedUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
        if (!storedUuid) {
          try {
            const session = await questionnaireApi.createSession();
            storedUuid = session.session_uuid;
            await AsyncStorage.setItem(QUESTIONNAIRE_SESSION_UUID, storedUuid);
          } catch (e) {
            // If server is unavailable, we still allow local-only questionnaire
            console.log('Failed to create questionnaire session on server, using local only.');
          }
        }
        if (storedUuid) {
          setSessionUuid(storedUuid);
        }

        // 2) Restore draft from local storage if present
        const draftJson = await AsyncStorage.getItem(QUESTIONNAIRE_DRAFT);
        if (draftJson) {
          try {
            const draft = JSON.parse(draftJson) as Partial<ProfileFormData>;
            setInitialData(draft);
          } catch {
            // Ignore invalid draft
          }
        }

        // 3) If user is authenticated and already has a completed profile, prefer that as source of truth
        const authed = await isAuthenticated();
        if (authed) {
          try {
            const response = await profileApi.getProfile();
            if (response.profile) {
              const profile = response.profile;
              const formData: Partial<ProfileFormData> = {
                ...profile,
                birth_date: profile.birth_date
                  ? (typeof profile.birth_date === 'string'
                      ? profile.birth_date
                      : new Date(profile.birth_date).toISOString().split('T')[0])
                  : undefined,
                target_race_date: profile.target_race_date
                  ? (typeof profile.target_race_date === 'string'
                      ? profile.target_race_date
                      : new Date(profile.target_race_date).toISOString().split('T')[0])
                  : undefined,
              };
              setInitialData(formData);
            }
          } catch {
            // Ignore profile errors; anonymous flow still works
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <QuestionnaireProvider initialData={initialData} sessionUuid={sessionUuid}>
      <SafeAreaView style={styles.container}>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="step1" />
          <Stack.Screen name="step2" />
          <Stack.Screen name="step3" />
          <Stack.Screen name="step3a" />
          <Stack.Screen name="step3b" />
          <Stack.Screen name="step3b-goal" />
          <Stack.Screen name="step4" />
          <Stack.Screen name="step4a" />
          <Stack.Screen name="step5" />
          <Stack.Screen name="step6" />
          <Stack.Screen name="step7" />
          <Stack.Screen name="step8" />
          <Stack.Screen name="step9" />
          <Stack.Screen name="preview" />
        </Stack>
      </SafeAreaView>
    </QuestionnaireProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
});