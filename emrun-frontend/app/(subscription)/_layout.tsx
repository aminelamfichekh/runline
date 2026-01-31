import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function SubscriptionLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.content,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="pricing" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="success" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  content: {
    backgroundColor: colors.primary.dark,
  },
});
