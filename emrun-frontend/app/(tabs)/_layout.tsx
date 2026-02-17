import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/utils/auth';

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated && segments[0] === '(tabs)') {
        router.replace('/(auth)/login');
      }
    };
    checkAuth();
  }, [segments]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hidden - using custom bottom nav in screens
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}