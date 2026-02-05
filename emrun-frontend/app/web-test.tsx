/**
 * Simple test page to verify web setup
 * Visit: http://localhost:8081/web-test
 */

import { View, Text, StyleSheet } from 'react-native';

export default function WebTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Web is Working!</Text>
      <Text style={styles.text}>
        If you can see this, React Native Web is configured correctly.
      </Text>
      <Text style={styles.text}>
        API URL: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
    textAlign: 'center',
  },
});






