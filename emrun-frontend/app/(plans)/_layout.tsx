/**
 * Plans Stack Layout
 * Handles navigation for week and day detail screens
 */

import { Stack } from 'expo-router';

export default function PlansLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="week/[weekNumber]" />
      <Stack.Screen name="day/[dayId]" />
      <Stack.Screen name="history/[planId]" />
    </Stack>
  );
}
