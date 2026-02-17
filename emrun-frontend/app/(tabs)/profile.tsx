/**
 * Profile Screen - Summary View
 * Shows user profile summary with navigation to sub-pages
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/lib/api/auth';
import { profileApi } from '@/lib/api/profile';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserProfileResponse } from '@/types/profile';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Load profile on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      // Load user info for name - extract first name only
      const userResponse = await authApi.getCurrentUser();
      const fullName = userResponse.user?.name || '';
      const firstName = fullName.split(' ')[0] || 'Utilisateur';
      setUserName(firstName);

      const response = await profileApi.getProfile();
      console.log('📊 Profile Response:', JSON.stringify(response, null, 2));
      setProfile(response);
    } catch (error: any) {
      console.error('Profile load error:', error);
      console.error('Error details:', error.message, error.response?.data);
      if (error.response?.status === 404) {
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.logout();
              router.replace('/(auth)/login');
            } catch (error) {
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGoalLabel = (goal: string | null) => {
    if (!goal) return 'Non défini';
    const goals: Record<string, string> = {
      'me_lancer': 'Commencer',
      'reprendre': 'Reprendre',
      'entretenir': 'Entretenir',
      'ameliorer_condition': 'Condition',
      'courir_race': 'Course',
      'ameliorer_chrono': 'Chrono',
      'autre': 'Autre',
    };
    return goals[goal] || goal.replace(/_/g, ' ');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const profileData = profile?.profile;
  const age = profileData?.birth_date ? calculateAge(profileData.birth_date) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Glow Effects */}
      <View style={styles.glowTop} />
      <View style={styles.glowTopRight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.brandName}>RUNLINE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGradientBorder}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={colors.accent.blue} />
              </View>
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Athlète Premium</Text>
          </View>
        </View>

        {/* My Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes informations</Text>
          <View style={styles.glassPanel}>
            <View style={styles.panelGlow} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoLabel}>
                  <Ionicons name="calendar" size={16} color={colors.accent.blue} />
                  <Text style={styles.infoLabelText}>AGE</Text>
                </View>
                <Text style={styles.infoValue}>
                  {age || '--'} <Text style={styles.infoUnit}>ans</Text>
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoLabel}>
                  <Ionicons name="resize-outline" size={16} color={colors.accent.blue} />
                  <Text style={styles.infoLabelText}>TAILLE</Text>
                </View>
                <Text style={styles.infoValue}>
                  {profileData?.height_cm
                    ? (profileData.height_cm < 10
                        ? profileData.height_cm.toFixed(2)
                        : (profileData.height_cm / 100).toFixed(2))
                    : '--'} <Text style={styles.infoUnit}>m</Text>
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoLabel}>
                  <Ionicons name="fitness" size={16} color={colors.accent.blue} />
                  <Text style={styles.infoLabelText}>POIDS</Text>
                </View>
                <Text style={styles.infoValue}>
                  {profileData?.weight_kg || '--'} <Text style={styles.infoUnit}>kg</Text>
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoLabel}>
                  <Ionicons name="flag" size={16} color={colors.accent.blue} />
                  <Text style={styles.infoLabelText}>OBJECTIF</Text>
                </View>
                <Text style={styles.infoValueSmall}>
                  {getGoalLabel(profileData?.primary_goal || null)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={() => router.push('/(profile)/info')}
              activeOpacity={0.9}
            >
              <Text style={styles.moreInfoButtonText}>Plus d'infos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres du compte</Text>
          <View style={styles.glassPanel}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => router.push('/(profile)/password')}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIcon}>
                  <Ionicons name="lock-closed" size={18} color={colors.text.secondary} />
                </View>
                <Text style={styles.settingsItemText}>Modifier mon mot de passe</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.accent.blue} />
            </TouchableOpacity>

            <View style={styles.settingsDivider} />

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => router.push('/(profile)/subscription')}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIcon}>
                  <Ionicons name="card" size={18} color={colors.text.secondary} />
                </View>
                <Text style={styles.settingsItemText}>Gérer mon abonnement</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.accent.blue} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.text.tertiary} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Ionicons name="home" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Ionicons name="calendar" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItemActive}>
            <Ionicons name="person" size={24} color={colors.accent.blue} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },

  // Glow Effects
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: 'rgba(50, 140, 231, 0.08)',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  glowTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
    opacity: 0.3,
    pointerEvents: 'none',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  avatarGradientBorder: {
    padding: 4,
    borderRadius: 64,
    backgroundColor: colors.accent.blue,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  premiumBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.2)',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },

  // Glass Panel
  glassPanel: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  panelGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  infoItem: {
    width: '50%',
    marginBottom: 24,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    paddingLeft: 2,
  },
  infoValueSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    paddingLeft: 2,
  },
  infoUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text.tertiary,
  },

  // More Info Button
  moreInfoButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  moreInfoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Settings
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
  },

  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
    zIndex: 100,
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
