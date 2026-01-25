/**
 * Plans Screen
 * Development message
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export default function PlansScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct-outline" size={64} color={colors.accent.blue} />
        </View>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          We're working hard to bring you personalized training plans.
        </Text>
        <Text style={styles.description}>
          This feature is currently in development and will be available soon.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>In Development</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent.blue,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
    letterSpacing: 0.5,
  },
});