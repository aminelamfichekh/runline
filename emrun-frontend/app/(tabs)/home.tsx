/**
 * Home Screen
 * Modern design with dark blue to black theme
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { profileApi } from '@/lib/api/profile';
import type { User } from '@/lib/api/auth';
import { colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user info
      const userResponse = await authApi.getCurrentUser();
      setUser(userResponse.user);

      // Check questionnaire status - CRITICAL: This determines if user needs to complete questionnaire
      try {
        const profileResponse = await profileApi.getProfile();
        console.log('📥 Profile loaded in home:', {
          hasProfile: !!profileResponse.profile,
          questionnaire_completed: profileResponse.questionnaire_completed,
          profileData: profileResponse.profile ? {
            first_name: profileResponse.profile.first_name,
            primary_goal: profileResponse.profile.primary_goal,
          } : null,
        });
        
        // Set questionnaire_completed status
        const isCompleted = profileResponse.questionnaire_completed === true;
        setQuestionnaireCompleted(isCompleted);
        
        if (!isCompleted && profileResponse.profile) {
          console.warn('⚠️ Profile exists but questionnaire_completed is false');
        }
      } catch (error: any) {
        console.error('❌ Failed to load profile in home:', error);
        // If profile doesn't exist, questionnaire is not completed
        setQuestionnaireCompleted(false);
      }
    } catch (error: any) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bon retour,</Text>
          <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={32} color={colors.accent.blue} />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusTitleContainer}>
            <Ionicons 
              name={questionnaireCompleted ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color={questionnaireCompleted ? colors.status.success : colors.status.warning} 
              style={styles.statusIcon}
            />
            <Text style={styles.statusTitle}>Statut du questionnaire</Text>
          </View>
          <View
            style={[
              styles.badge,
              questionnaireCompleted ? styles.badgeCompleted : styles.badgeIncomplete,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                questionnaireCompleted ? styles.badgeTextCompleted : styles.badgeTextIncomplete,
              ]}
            >
              {questionnaireCompleted ? 'Terminé' : 'Incomplet'}
            </Text>
          </View>
        </View>

        <Text style={styles.statusDescription}>
          {questionnaireCompleted
            ? 'Votre profil est complet. Vous pouvez le consulter ou le mettre à jour à tout moment depuis votre profil.'
            : 'Complétez le questionnaire de votre profil pour obtenir un plan d\'entraînement personnalisé adapté à vos objectifs.'}
        </Text>
      </View>

      {/* Quick Stats */}
      {questionnaireCompleted && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="fitness-outline" size={28} color={colors.accent.blue} />
            <Text style={styles.statValue}>Prêt</Text>
            <Text style={styles.statLabel}>Plan d'entraînement</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color={colors.accent.cyan} />
            <Text style={styles.statValue}>Actif</Text>
            <Text style={styles.statLabel}>Profil</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!questionnaireCompleted ? (
          <Button
            title="Commencer le questionnaire"
            onPress={() => router.push('/(questionnaire)/step1')}
          />
        ) : (
          <>
            <Button
              title="Générer le plan"
              onPress={() => router.push('/(tabs)/plans')}
            />
            <Button
              title="Voir le profil"
              variant="secondary"
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.secondaryButton}
            />
          </>
        )}
      </View>

      {/* Dev-only reset button */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devResetButton}
          onPress={() => {
            Alert.alert(
              'Réinitialiser',
              'Supprimer toutes les données locales (questionnaire, tokens, cache) ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Réinitialiser',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.clear();
                    Alert.alert('Fait', 'Données locales supprimées. Redémarrez l\'app.');
                  },
                },
              ]
            );
          }}
          activeOpacity={0.6}
        >
          <Text style={styles.devResetText}>Réinitialiser les données locales (dev)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  content: {
    padding: 24,
    paddingTop: 60,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '400',
    marginBottom: 4,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent.blue,
  },
  statusCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  badgeIncomplete: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextCompleted: {
    color: colors.status.success,
  },
  badgeTextIncomplete: {
    color: colors.status.warning,
  },
  statusDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    marginTop: 0,
  },
  devResetButton: {
    marginTop: 40,
    paddingVertical: 10,
    alignItems: 'center',
  },
  devResetText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
});