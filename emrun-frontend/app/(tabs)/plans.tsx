/**
 * Plans Screen - Week Overview
 * Shows all weeks of the current training plan
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { plansApi } from '@/lib/api/plans';
import type { Plan, PlanWeek, PlanDay } from '@/types/plan';
import { isPlanReady, SESSION_TYPE_COLORS } from '@/types/plan';

// Month names in French
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Week status types
type WeekStatus = 'completed' | 'in_progress' | 'upcoming';

interface WeekDisplayData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  sessionsCount: number;
  completedSessions: number;
  days: PlanDay[];
}

/**
 * Process plan weeks to add status and session counts
 */
const processWeeks = (plan: Plan): WeekDisplayData[] => {
  if (!isPlanReady(plan)) return [];

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

  return plan.content.weeks.map((week) => {
    // Count sessions (non-rest days)
    const sessions = week.days.filter(day => day.type !== 'repos');
    const sessionsCount = sessions.length;

    // Parse dates to determine status
    const [startDay, startMonth] = week.start_date.split('/').map(Number);
    const [endDay, endMonth] = week.end_date.split('/').map(Number);
    const [todayDay, todayMonth] = todayStr.split('/').map(Number);

    // Compare dates (assuming same year)
    const startValue = startMonth * 100 + startDay;
    const endValue = endMonth * 100 + endDay;
    const todayValue = todayMonth * 100 + todayDay;

    let status: WeekStatus = 'upcoming';
    let completedSessions = 0;

    if (endValue < todayValue) {
      status = 'completed';
      completedSessions = sessionsCount;
    } else if (startValue <= todayValue && todayValue <= endValue) {
      status = 'in_progress';
      // Calculate completed sessions based on days passed
      completedSessions = week.days.filter(day => {
        if (day.type === 'repos') return false;
        const [dayNum, dayMonth] = day.date.split('/').map(Number);
        return (dayMonth * 100 + dayNum) < todayValue;
      }).length;
    }

    return {
      weekNumber: week.week_number,
      startDate: week.start_date,
      endDate: week.end_date,
      status,
      sessionsCount,
      completedSessions,
      days: week.days,
    };
  });
};

export default function PlansScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = MONTHS[now.getMonth()];
  const currentMonthLower = currentMonth.toLowerCase();

  const fetchPlan = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      const response = await plansApi.getActivePlan();
      setPlan(response.plan);
    } catch (err: any) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Erreur lors du chargement du plan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchPlan(false);
    }, [fetchPlan])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlan(false);
  }, [fetchPlan]);

  const weeks = plan && isPlanReady(plan) ? processWeeks(plan) : [];

  const formatDateRange = (startDate: string, endDate: string) => {
    const [startDay, startMonth] = startDate.split('/');
    const [endDay, endMonth] = endDate.split('/');
    const startMonthName = MONTHS[parseInt(startMonth) - 1].substring(0, 3);
    const endMonthName = MONTHS[parseInt(endMonth) - 1].substring(0, 3);

    // If same month, show "01 Fév - 07 Fév", otherwise "23 Fév - 01 Mar"
    if (startMonth === endMonth) {
      return `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
    } else {
      return `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
    }
  };

  const handleWeekPress = (weekNumber: number) => {
    router.push(`/(plans)/week/${weekNumber}`);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement de votre plan...</Text>
      </View>
    );
  }

  // No plan state
  if (!plan || !isPlanReady(plan)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="fitness" size={28} color={colors.accent.blue} />
            <Text style={styles.brandName}>RUNLINE</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>
            {plan?.status === 'generating'
              ? 'Plan en cours de génération...'
              : plan?.status === 'pending'
              ? 'Plan en attente...'
              : 'Aucun plan actif'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {plan?.status === 'generating'
              ? 'Votre plan personnalisé est en cours de création par notre IA. Cela peut prendre quelques minutes.'
              : plan?.status === 'pending'
              ? 'Votre plan sera généré très prochainement.'
              : plan?.status === 'failed'
              ? `Une erreur est survenue: ${plan.error_message || 'Erreur inconnue'}`
              : 'Votre plan d\'entraînement apparaîtra ici une fois généré.'}
          </Text>
          {(plan?.status === 'generating' || plan?.status === 'pending') && (
            <TouchableOpacity style={styles.refreshButton} onPress={() => fetchPlan()}>
              <Ionicons name="refresh" size={20} color={colors.accent.blue} />
              <Text style={styles.refreshButtonText}>Actualiser</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Ionicons name="home" size={26} color={colors.text.tertiary} />
            <Text style={styles.navLabel}>Accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="calendar" size={26} color={colors.accent.blue} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person" size={26} color={colors.text.tertiary} />
            <Text style={styles.navLabel}>Profil</Text>
          </TouchableOpacity>

          <View style={styles.homeIndicator} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="fitness" size={28} color={colors.accent.blue} />
          <Text style={styles.brandName}>RUNLINE</Text>
        </View>
        <Text style={styles.monthLabel}>{currentMonth.toUpperCase()}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Vos semaines de <Text style={styles.titleHighlight}>{currentMonthLower}</Text>
          </Text>
          <Text style={styles.subtitle}>
            Préparez-vous à dépasser vos limites ce mois-ci.
          </Text>
        </View>

        {/* Weeks List */}
        <View style={styles.weeksList}>
          {weeks.map((week) => {
            const isActive = week.status === 'in_progress';
            const isCompleted = week.status === 'completed';

            return (
              <TouchableOpacity
                key={week.weekNumber}
                style={[
                  styles.weekCard,
                  isActive && styles.weekCardActive,
                ]}
                onPress={() => handleWeekPress(week.weekNumber)}
                activeOpacity={0.9}
              >
                {/* Active card gradient border effect */}
                {isActive && <View style={styles.activeGradientBorder} />}

                <View style={[
                  styles.weekCardInner,
                  isActive && styles.weekCardInnerActive,
                ]}>
                  {/* Week Header */}
                  <View style={styles.weekHeader}>
                    <View style={styles.weekTitleContainer}>
                      <View style={styles.weekTitleRow}>
                        <Text style={[
                          styles.weekTitle,
                          isActive && styles.weekTitleActive,
                        ]}>
                          Semaine {week.weekNumber}
                        </Text>
                        {isCompleted && (
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        )}
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>En cours</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.weekDates}>
                        {formatDateRange(week.startDate, week.endDate)}
                      </Text>
                    </View>

                    <View style={[
                      styles.sessionsBadge,
                      isActive && styles.sessionsBadgeActive,
                    ]}>
                      <Ionicons
                        name={isActive ? "fitness" : "barbell-outline"}
                        size={14}
                        color={isActive ? colors.accent.blue : colors.text.tertiary}
                      />
                      <Text style={[
                        styles.sessionsText,
                        isActive && styles.sessionsTextActive,
                      ]}>
                        {week.sessionsCount} séances
                      </Text>
                    </View>
                  </View>

                  {/* Session Type Preview */}
                  <View style={styles.sessionTypesRow}>
                    {week.days.slice(0, 5).map((day, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.sessionTypeDot,
                          { backgroundColor: SESSION_TYPE_COLORS[day.type] || '#9CA3AF' }
                        ]}
                      />
                    ))}
                    {week.days.length > 5 && (
                      <Text style={styles.moreText}>+{week.days.length - 5}</Text>
                    )}
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressRow}>
                    {week.sessionsCount > 0 ? (
                      Array.from({ length: week.sessionsCount }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.progressSegment,
                            i < week.completedSessions && styles.progressSegmentFilled,
                            isCompleted && styles.progressSegmentCompleted,
                          ]}
                        />
                      ))
                    ) : (
                      <Text style={styles.noSessionsText}>Semaine de repos</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={26} color={colors.text.tertiary} />
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={26} color={colors.accent.blue} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={26} color={colors.text.tertiary} />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>

        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 24,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.3)',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.primary.dark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 1,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Title Section
  titleSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 36,
  },
  titleHighlight: {
    color: colors.accent.blue,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
  },

  // Weeks List
  weeksList: {
    gap: 20,
  },

  // Week Card
  weekCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  weekCardActive: {
    padding: 2,
  },
  activeGradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent.blue,
    borderRadius: 16,
  },
  weekCardInner: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 20,
  },
  weekCardInnerActive: {
    backgroundColor: '#242c38',
  },

  // Week Header
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weekTitleContainer: {
    flex: 1,
    gap: 4,
  },
  weekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  weekTitleActive: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent.blue,
  },
  weekDates: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: 'rgba(50, 140, 231, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sessionsBadgeActive: {
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(50, 140, 231, 0.2)',
  },
  sessionsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  sessionsTextActive: {
    color: colors.accent.blue,
  },

  // Session Types Row
  sessionTypesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  sessionTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreText: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  noSessionsText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  // Progress Row
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
    minHeight: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressSegmentFilled: {
    backgroundColor: colors.accent.blue,
  },
  progressSegmentCompleted: {
    backgroundColor: '#10B981',
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.primary.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  navLabelActive: {
    color: colors.accent.blue,
    fontWeight: '700',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
