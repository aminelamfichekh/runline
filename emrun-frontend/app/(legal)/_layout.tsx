import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary.dark },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="terms" />
    </Stack>
  );
}
