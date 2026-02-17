/**
 * Profile Stack Layout
 * Handles navigation for profile sub-pages
 */

import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="info" />
      <Stack.Screen name="password" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
