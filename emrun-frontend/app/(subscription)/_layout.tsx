import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary.dark },
      }}
    >
      <Stack.Screen name="pricing" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
