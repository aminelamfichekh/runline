/**
 * Profile Screen
 * Complete profile with questionnaire review, edit, and password change
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { TextInputField } from '@/components/forms/TextInputField';
import { authApi } from '@/lib/api/auth';
import { profileApi } from '@/lib/api/profile';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserProfileResponse } from '@/types/profile';
import { format } from 'date-fns';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load profile on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileApi.getProfile();
      console.log('📥 Profile loaded:', {
        hasProfile: !!response.profile,
        questionnaire_completed: response.questionnaire_completed,
        profileKeys: response.profile ? Object.keys(response.profile) : [],
      });
      
      // Always set profile data, even if questionnaire_completed is false
      // This allows users to see and edit their partial data
      setProfile(response);
    } catch (error: any) {
      console.error('❌ Profile load error:', error);
      if (error.response?.status === 404) {
        // No profile - that's ok, show empty state
        setProfile(null);
      } else {
        showNotification('Failed to load profile', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.password || !passwordData.password_confirmation) {
      showNotification('Please fill all password fields', 'error');
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (passwordData.password.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword(passwordData);
      showNotification('Password changed successfully', 'success');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      showNotification(errorMessage, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.blue} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // Show empty state only if truly no profile exists
  if (!profile || !profile.profile) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptyText}>
            Complete the questionnaire to create your profile.
          </Text>
          <Button
            title="Start Questionnaire"
            onPress={() => router.push('/(questionnaire)/step1')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  const { profile: profileData, questionnaire_completed } = profile;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Review and manage your information</Text>
          </View>
          <View
            style={[
              styles.badge,
              questionnaire_completed ? styles.badgeCompleted : styles.badgeIncomplete,
            ]}
          >
            <Ionicons
              name={questionnaire_completed ? 'checkmark-circle' : 'time-outline'}
              size={16}
              color={questionnaire_completed ? colors.status.success : colors.status.warning}
              style={styles.badgeIcon}
            />
            <Text
              style={[
                styles.badgeText,
                questionnaire_completed ? styles.badgeTextCompleted : styles.badgeTextIncomplete,
              ]}
            >
              {questionnaire_completed ? 'Completed' : 'Incomplete'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(questionnaire)/step1')}
          >
            <Ionicons name="create-outline" size={24} color={colors.accent.blue} />
            <Text style={styles.quickActionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowPasswordModal(true)}
          >
            <Ionicons name="lock-closed-outline" size={24} color={colors.accent.cyan} />
            <Text style={styles.quickActionText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Questionnaire Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>Questionnaire Overview</Text>
          </View>

          {/* Basic Information */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Basic Information</Text>
            <View style={styles.sectionContent}>
              <ProfileRow
                icon="person"
                label="Name"
                value={`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Not set'}
              />
              <ProfileRow
                icon="calendar"
                label="Date of Birth"
                value={profileData.birth_date ? format(new Date(profileData.birth_date), 'MMM dd, yyyy') : 'Not set'}
              />
              <ProfileRow
                icon="people"
                label="Gender"
                value={profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : 'Not set'}
              />
              <ProfileRow
                icon="resize"
                label="Height"
                value={profileData.height_cm ? `${(profileData.height_cm / 100).toFixed(2)}m` : 'Not set'}
              />
              <ProfileRow
                icon="barbell"
                label="Weight"
                value={profileData.weight_kg ? `${profileData.weight_kg}kg` : 'Not set'}
              />
            </View>
          </View>

          {/* Primary Goal */}
          {profileData.primary_goal && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Primary Goal</Text>
              <View style={styles.sectionContent}>
                <ProfileRow
                  icon="flag"
                  label="Goal"
                  value={profileData.primary_goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
                {profileData.primary_goal_other && (
                  <ProfileRow icon="chatbubble" label="Details" value={profileData.primary_goal_other} />
                )}
              </View>
            </View>
          )}

          {/* Running Status */}
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Running Status</Text>
            <View style={styles.sectionContent}>
              <ProfileRow
                icon="speedometer"
                label="Weekly Volume"
                value={profileData.current_weekly_volume_km ? `${profileData.current_weekly_volume_km}km` : 'Not set'}
              />
              <ProfileRow
                icon="repeat"
                label="Runs Per Week"
                value={profileData.current_runs_per_week ? profileData.current_runs_per_week.replace(/_/g, ' ') : 'Not set'}
              />
              {profileData.available_days && profileData.available_days.length > 0 && (
                <ProfileRow
                  icon="calendar-outline"
                  label="Available Days"
                  value={profileData.available_days
                    .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                    .join(', ')}
                />
              )}
            </View>
          </View>

          {/* Experience */}
          {profileData.running_experience_period && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Experience</Text>
              <View style={styles.sectionContent}>
                <ProfileRow
                  icon="trophy"
                  label="Experience Period"
                  value={profileData.running_experience_period.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              </View>
            </View>
          )}

          {/* Problem to Solve */}
          {profileData.problem_to_solve && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Problem to Solve</Text>
              <View style={styles.sectionContent}>
                <ProfileRow
                  icon="help-circle"
                  label="Problem"
                  value={profileData.problem_to_solve.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
                {profileData.problem_to_solve_other && (
                  <ProfileRow icon="chatbubble" label="Details" value={profileData.problem_to_solve_other} />
                )}
              </View>
            </View>
          )}

          {/* Training Locations */}
          {profileData.training_locations && profileData.training_locations.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Training Locations</Text>
              <View style={styles.sectionContent}>
                <ProfileRow
                  icon="location"
                  label="Locations"
                  value={profileData.training_locations
                    .map((loc) => loc.charAt(0).toUpperCase() + loc.slice(1))
                    .join(', ')}
                />
                {profileData.training_location_other && (
                  <ProfileRow icon="chatbubble" label="Other" value={profileData.training_location_other} />
                )}
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {questionnaire_completed ? (
            <>
              <Button
                title="Generate Plan"
                onPress={() => router.push('/(tabs)/plans')}
                style={styles.actionButton}
              />
              <Button
                title="Edit Profile"
                variant="secondary"
                onPress={() => router.push('/(questionnaire)/step1')}
                style={styles.actionButton}
              />
            </>
          ) : (
            <Button
              title="Complete Questionnaire"
              onPress={() => router.push('/(questionnaire)/step1')}
              style={styles.actionButton}
            />
          )}
          <Button
            title="Disconnect"
            variant="secondary"
            onPress={handleLogout}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInputField
                label="Current Password"
                value={passwordData.current_password}
                onChangeText={(text) => setPasswordData({ ...passwordData, current_password: text })}
                secureTextEntry
                placeholder="Enter current password"
              />
              <TextInputField
                label="New Password"
                value={passwordData.password}
                onChangeText={(text) => setPasswordData({ ...passwordData, password: text })}
                secureTextEntry
                placeholder="Enter new password (min 8 characters)"
              />
              <TextInputField
                label="Confirm New Password"
                value={passwordData.password_confirmation}
                onChangeText={(text) => setPasswordData({ ...passwordData, password_confirmation: text })}
                secureTextEntry
                placeholder="Confirm new password"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                loading={isChangingPassword}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={colors.accent.blue} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
    paddingBottom: 40,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  emptyButton: {
    maxWidth: 300,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
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
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextCompleted: {
    color: colors.status.success,
  },
  badgeTextIncomplete: {
    color: colors.status.warning,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 12,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  rowValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
  },
});