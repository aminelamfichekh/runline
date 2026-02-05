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
        tabBarStyle: {
          backgroundColor: '#111921',
          borderTopColor: '#1a2632',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}