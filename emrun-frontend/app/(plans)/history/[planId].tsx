/**
 * History Plan Detail Screen
 * Shows all weeks of a past (completed) training plan
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { plansApi } from '@/lib/api/plans';
import type { Plan, PlanDay } from '@/types/plan';
import { isPlanReady, SESSION_TYPE_COLORS } from '@/types/plan';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface WeekDisplayData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  sessionsCount: number;
  days: PlanDay[];
}

const processWeeks = (plan: Plan): WeekDisplayData[] => {
  if (!isPlanReady(plan)) return [];
  return plan.content.weeks.map((week) => ({
    weekNumber: week.week_number,
    startDate: week.start_date,
    endDate: week.end_date,
    sessionsCount: week.days.filter(d => d.type !== 'repos').length,
    days: week.days,
  }));
};

const formatDateRange = (startDate: string, endDate: string) => {
  const [startDay, startMonth] = startDate.split('/');
  const [endDay, endMonth] = endDate.split('/');
  const startMonthName = MONTHS[parseInt(startMonth) - 1].substring(0, 3);
  const endMonthName = MONTHS[parseInt(endMonth) - 1].substring(0, 3);
  return `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;
};

const getPlanLabel = (plan: Plan) => {
  if (!plan.start_date || !plan.end_date) return 'Plan passé';
  const start = new Date(plan.start_date);
  const end = new Date(plan.end_date);
  const startMonth = MONTHS[start.getMonth()];
  const endMonth = MONTHS[end.getMonth()];
  const year = end.getFullYear();
  return start.getMonth() === end.getMonth()
    ? `${startMonth} ${year}`
    : `${startMonth} – ${endMonth} ${year}`;
};

export default function HistoryPlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const response = await plansApi.getPlan(parseInt(planId, 10));
      setPlan(response.plan);
    } catch (err) {
      console.error('Failed to fetch history plan:', err);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!plan || !isPlanReady(plan)) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.errorText}>Plan introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const weeks = processWeeks(plan);
  const planLabel = getPlanLabel(plan);
  const totalSessions = weeks.reduce((sum, w) => sum + w.sessionsCount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{planLabel}</Text>
          <Text style={styles.headerSubtitle}>Plan terminé</Text>
        </View>
        <View style={styles.headerBack} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Badge */}
        <View style={styles.summaryBadge}>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.summaryValue}>{weeks.length}</Text>
            <Text style={styles.summaryLabel}>semaines</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="fitness" size={20} color={colors.accent.blue} />
            <Text style={styles.summaryValue}>{totalSessions}</Text>
            <Text style={styles.summaryLabel}>séances</Text>
          </View>
        </View>

        {/* Weeks List */}
        <View style={styles.weeksList}>
          {weeks.map((week) => (
            <TouchableOpacity
              key={week.weekNumber}
              style={styles.weekCard}
              onPress={() => router.push(`/(plans)/week/${week.weekNumber}?planId=${planId}`)}
              activeOpacity={0.85}
            >
              <View style={styles.weekCardInner}>
                {/* Week Header */}
                <View style={styles.weekHeader}>
                  <View style={styles.weekTitleContainer}>
                    <View style={styles.weekTitleRow}>
                      <Text style={styles.weekTitle}>Semaine {week.weekNumber}</Text>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    </View>
                    <Text style={styles.weekDates}>
                      {formatDateRange(week.startDate, week.endDate)}
                    </Text>
                  </View>

                  <View style={styles.sessionsBadge}>
                    <Ionicons name="barbell-outline" size={13} color={colors.text.tertiary} />
                    <Text style={styles.sessionsText}>{week.sessionsCount} séances</Text>
                  </View>
                </View>

                {/* Session Type Dots */}
                <View style={styles.sessionTypesRow}>
                  {week.days.slice(0, 7).map((day, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.sessionTypeDot,
                        { backgroundColor: SESSION_TYPE_COLORS[day.type] || '#9CA3AF' }
                      ]}
                    />
                  ))}
                </View>

                {/* Progress Bar - all completed (green) */}
                <View style={styles.progressRow}>
                  {week.sessionsCount > 0 ? (
                    Array.from({ length: week.sessionsCount }).map((_, i) => (
                      <View key={i} style={[styles.progressSegment, styles.progressSegmentCompleted]} />
                    ))
                  ) : (
                    <Text style={styles.noSessionsText}>Semaine de repos</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(50,140,231,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(50,140,231,0.3)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.blue,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.primary.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  // Summary Badge
  summaryBadge: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    gap: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Weeks List
  weeksList: { gap: 16 },

  // Week Card
  weekCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  weekCardInner: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 18,
  },
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  weekDates: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  sessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sessionsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  sessionTypesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
  },
  sessionTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    minHeight: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressSegmentCompleted: {
    backgroundColor: '#10B981',
  },
  noSessionsText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
