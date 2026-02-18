/**
 * History Index Screen
 * Lists all past completed training plans, each clickable to view its weeks
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { plansApi } from '@/lib/api/plans';
import type { Plan } from '@/types/plan';
import { isPlanReady, SESSION_TYPE_COLORS } from '@/types/plan';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

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

const getPlanDateRange = (plan: Plan) => {
  if (!plan.start_date || !plan.end_date) return '';
  const start = new Date(plan.start_date);
  const end = new Date(plan.end_date);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].substring(0, 3)}`;
  return `${fmt(start)} → ${fmt(end)} ${end.getFullYear()}`;
};

export default function HistoryIndexScreen() {
  const router = useRouter();
  const [pastPlans, setPastPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await plansApi.getPlans();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const past = (response.plans || [])
        .filter(p => {
          if (p.status !== 'completed' || !p.end_date) return false;
          return new Date(p.end_date) < today;
        })
        .sort((a, b) => new Date(b.end_date!).getTime() - new Date(a.end_date!).getTime());
      setPastPlans(past);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(false);
  }, [fetchHistory]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Historique</Text>
          <Text style={styles.headerSubtitle}>
            {pastPlans.length} plan{pastPlans.length !== 1 ? 's' : ''} terminé{pastPlans.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {/* spacer to balance the back button */}
        <View style={styles.backBtn} />
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
        {pastPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Aucun historique</Text>
            <Text style={styles.emptySubtitle}>
              Vos plans terminés apparaîtront ici.
            </Text>
          </View>
        ) : (
          <View style={styles.plansList}>
            {pastPlans.map((plan, index) => {
              const weeksCount = isPlanReady(plan) ? plan.content.weeks.length : 0;
              const sessionCount = isPlanReady(plan)
                ? plan.content.weeks.flatMap(w => w.days).filter(d => d.type !== 'repos').length
                : 0;

              // Collect unique session type dots from whole plan
              const allDays = isPlanReady(plan)
                ? plan.content.weeks.flatMap(w => w.days)
                : [];
              const typeDots = allDays.slice(0, 8);

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planCard}
                  onPress={() => router.push(`/(plans)/history/${plan.id}`)}
                  activeOpacity={0.85}
                >
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={styles.cardTopLeft}>
                      {/* Month badge */}
                      <View style={styles.monthIndexBadge}>
                        <Text style={styles.monthIndexText}>{String(pastPlans.length - index).padStart(2, '0')}</Text>
                      </View>
                      <View>
                        <Text style={styles.planLabel}>{getPlanLabel(plan)}</Text>
                        <Text style={styles.planDateRange}>{getPlanDateRange(plan)}</Text>
                      </View>
                    </View>
                    <View style={styles.cardTopRight}>
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.completedText}>Terminé</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} style={{ marginTop: 6 }} />
                    </View>
                  </View>

                  {/* Stats row */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.statText}>{weeksCount} semaine{weeksCount !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="fitness-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.statText}>{sessionCount} séances</Text>
                    </View>
                  </View>

                  {/* Session type dots */}
                  {typeDots.length > 0 && (
                    <View style={styles.dotsRow}>
                      {typeDots.map((day, i) => (
                        <View
                          key={i}
                          style={[
                            styles.typeDot,
                            { backgroundColor: SESSION_TYPE_COLORS[day.type] || '#9CA3AF' }
                          ]}
                        />
                      ))}
                      {allDays.length > 8 && (
                        <Text style={styles.dotsMore}>+{allDays.length - 8}</Text>
                      )}
                    </View>
                  )}

                  {/* Full-width green progress bar */}
                  <View style={styles.fullProgressTrack}>
                    <View style={styles.fullProgressFill} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  backBtn: {
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
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Plans list
  plansList: {
    gap: 16,
  },

  // Plan card
  planCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  monthIndexBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthIndexText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  planLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planDateRange: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotsMore: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginLeft: 4,
  },

  // Progress
  fullProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fullProgressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
});
