/**
 * Week Detail Screen
 * Shows daily workout plan for the selected week using REAL plan data
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
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { plansApi } from '@/lib/api/plans';
import type { Plan, PlanWeek, PlanDay, SessionType } from '@/types/plan';
import { isPlanReady, SESSION_TYPE_COLORS } from '@/types/plan';

// Month names in French
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Icons for session types
const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  repos: 'bed',
  footing: 'walk',
  qualitative: 'flash',
  course: 'trophy',
};

export default function WeekDetailScreen() {
  const router = useRouter();
  const { weekNumber } = useLocalSearchParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || '1', 10);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = MONTHS[now.getMonth()];

  const fetchPlan = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      const response = await plansApi.getActivePlan();
      setPlan(response.plan);
    } catch (err: any) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useFocusEffect(
    useCallback(() => {
      fetchPlan(false);
    }, [fetchPlan])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlan(false);
  }, [fetchPlan]);

  // Get current week data from plan
  const currentWeek: PlanWeek | null = plan && isPlanReady(plan)
    ? plan.content.weeks.find(w => w.week_number === weekNum) || null
    : null;

  const totalWeeks = plan && isPlanReady(plan) ? plan.content.weeks.length : 0;

  // Check if a day is today
  const isToday = (dateStr: string): boolean => {
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  // Check if a day is in the past
  const isPastDay = (dateStr: string): boolean => {
    const today = new Date();
    const [day, month] = dateStr.split('/').map(Number);
    const todayValue = (today.getMonth() + 1) * 100 + today.getDate();
    const dayValue = month * 100 + day;
    return dayValue < todayValue;
  };

  const handlePrevWeek = () => {
    if (weekNum > 1) {
      router.replace(`/(plans)/week/${weekNum - 1}`);
    }
  };

  const handleNextWeek = () => {
    if (weekNum < totalWeeks) {
      router.replace(`/(plans)/week/${weekNum + 1}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Error or no plan
  if (!plan || !isPlanReady(plan) || !currentWeek) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.brandName}>RUNLINE</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Semaine non disponible</Text>
          <Text style={styles.emptySubtitle}>
            {error || 'Cette semaine n\'est pas encore planifiée.'}
          </Text>
          <TouchableOpacity
            style={styles.backToPlansButton}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.backToPlansText}>Retour aux plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.brandName}>RUNLINE</Text>
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            Planning de la{'\n'}
            <Text style={styles.titleHighlight}>semaine</Text>
          </Text>

          {/* Week Navigator */}
          <View style={styles.weekNavigator}>
            <TouchableOpacity
              style={styles.navArrow}
              onPress={handlePrevWeek}
              disabled={weekNum <= 1}
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color={weekNum > 1 ? colors.accent.blue : colors.text.tertiary}
              />
            </TouchableOpacity>

            <View style={styles.weekInfo}>
              <Text style={styles.weekLabel}>
                Semaine {weekNum.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.weekDates}>
                {currentWeek.start_date} - {currentWeek.end_date}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.navArrow}
              onPress={handleNextWeek}
              disabled={weekNum >= totalWeeks}
            >
              <Ionicons
                name="chevron-forward"
                size={32}
                color={weekNum < totalWeeks ? colors.accent.blue : colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Days List */}
        <View style={styles.daysList}>
          {currentWeek.days.map((day, index) => {
            const isRest = day.type === 'repos';
            const isTodayDay = isToday(day.date);
            const isPast = isPastDay(day.date);
            const icon = SESSION_TYPE_ICONS[day.type] || 'fitness';

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCard,
                  !isRest && styles.dayCardWorkout,
                  isTodayDay && styles.dayCardToday,
                ]}
                activeOpacity={isRest ? 1 : 0.9}
                disabled={isRest}
                onPress={() => {
                  if (!isRest) {
                    router.push(`/(plans)/day/${weekNum}-${index}`);
                  }
                }}
              >
                {/* Left accent bar for workout days */}
                {!isRest && (
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: SESSION_TYPE_COLORS[day.type] }
                    ]}
                  />
                )}

                {/* Today badge */}
                {isTodayDay && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>AUJOURD'HUI</Text>
                  </View>
                )}

                {/* Completed indicator */}
                {isPast && !isRest && (
                  <View style={styles.completedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}

                <View style={styles.dayCardContent}>
                  {/* Date Column */}
                  <View style={styles.dateColumn}>
                    <Text style={[
                      styles.dayName,
                      isRest && styles.dayNameRest,
                      isTodayDay && styles.dayNameToday,
                    ]}>
                      {day.day_name.substring(0, 3)}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      isRest && styles.dayNumberRest,
                      isTodayDay && styles.dayNumberToday,
                    ]}>
                      {day.date.split('/')[0]}
                    </Text>
                  </View>

                  {/* Workout Info */}
                  <View style={styles.workoutInfo}>
                    {isRest ? (
                      <View style={styles.restContent}>
                        <Text style={styles.restTitle}>Repos</Text>
                        <Text style={styles.restSubtitle}>{day.content.description}</Text>
                      </View>
                    ) : (
                      <View style={styles.workoutContent}>
                        <View style={styles.workoutTitleRow}>
                          <Ionicons
                            name={icon as any}
                            size={18}
                            color={isTodayDay ? colors.accent.blue : SESSION_TYPE_COLORS[day.type]}
                          />
                          <Text style={[
                            styles.workoutTitle,
                            isTodayDay && styles.workoutTitleToday,
                          ]}>
                            {day.content.session_type || day.content.description}
                          </Text>
                        </View>
                        <Text style={styles.workoutDescription}>
                          {day.content.duration && `${day.content.duration} • `}
                          {day.content.description}
                        </Text>
                        {day.content.corps_de_seance && (
                          <Text style={styles.workoutDetail} numberOfLines={2}>
                            {day.content.corps_de_seance}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Rest Icon */}
                  {isRest && (
                    <Ionicons name="bed" size={28} color="rgba(255,255,255,0.15)" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
            style={styles.navItemActive}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Ionicons name="calendar" size={24} color={colors.accent.blue} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person" size={24} color={colors.text.tertiary} />
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
  backToPlansButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
  },
  backToPlansText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
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
    paddingHorizontal: 20,
  },

  // Title Section
  titleSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    lineHeight: 36,
  },
  titleHighlight: {
    color: colors.accent.blue,
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navArrow: {
    padding: 4,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  weekDates: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  // Days List
  daysList: {
    gap: 12,
  },

  // Day Card
  dayCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  dayCardWorkout: {
    backgroundColor: colors.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCardToday: {
    borderColor: colors.accent.blue,
    borderWidth: 2,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  todayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent.blue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  completedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },

  // Date Column
  dateColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    paddingRight: 16,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  dayNameRest: {
    color: 'rgba(255,255,255,0.3)',
  },
  dayNameToday: {
    color: colors.accent.blue,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  dayNumberRest: {
    color: 'rgba(255,255,255,0.3)',
  },
  dayNumberToday: {
    color: colors.accent.blue,
  },

  // Workout Info
  workoutInfo: {
    flex: 1,
  },
  restContent: {
    opacity: 0.7,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  restSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  workoutContent: {
    gap: 4,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  workoutTitleToday: {
    color: colors.accent.blue,
  },
  workoutDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  workoutDetail: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    fontStyle: 'italic',
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
