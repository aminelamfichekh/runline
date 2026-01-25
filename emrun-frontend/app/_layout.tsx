import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { colors } from '@/constants/colors';
import '@/src/i18n';

// Web polyfill: Set API URL in window for web platform
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Make API URL available globally for web
  const apiUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) 
    || 'http://localhost:8000/api';
  (window as any).__EXPO_PUBLIC_API_URL__ = apiUrl;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure everything is ready
    const init = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary.dark }}>
        <ActivityIndicator size="large" color={colors.accent.blue} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.primary.dark },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(questionnaire)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="test-connection" />
          <Stack.Screen name="web-test" />
        </Stack>
      </NotificationProvider>
    </AuthProvider>
  );
}
