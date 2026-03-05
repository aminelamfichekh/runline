/**
 * Shared Bottom Navigation - Futuristic Glass Pill
 * Used across all main screens (home, plans, profile and sub-pages)
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export type ActiveTab = 'home' | 'plans' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={activeTab === 'home' ? styles.navItemActive : styles.navItem}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons
            name="home"
            size={24}
            color={activeTab === 'home' ? colors.accent.blue : colors.text.tertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === 'plans' ? styles.navItemActive : styles.navItem}
          onPress={() => router.push('/(tabs)/plans')}
        >
          <Ionicons
            name="calendar"
            size={24}
            color={activeTab === 'plans' ? colors.accent.blue : colors.text.tertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === 'profile' ? styles.navItemActive : styles.navItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons
            name="person"
            size={24}
            color={activeTab === 'profile' ? colors.accent.blue : colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  navItem: {
    padding: 8,
  },
  navItemActive: {
    padding: 8,
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
    borderRadius: 20,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
});
