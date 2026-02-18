/**
 * Home Screen - Mes Plans
 * Shows monthly training plans with progress
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { plansApi } from '@/lib/api/plans';
import { colors } from '@/constants/colors';
import { isPlanReady } from '@/types/plan';
import type { Plan } from '@/types/plan';

// Month names in French
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  // Fetch plan directly for fresh data
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pastPlans, setPastPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fetchPlan = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [activeResponse, allResponse] = await Promise.all([
        plansApi.getActivePlan(),
        plansApi.getPlans(),
      ]);
      setPlan(activeResponse.plan);

      // Past plans: completed plans whose end_date is before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const past = (allResponse.plans || []).filter(p => {
        if (p.status !== 'completed' || !p.end_date) return false;
        return new Date(p.end_date) < today;
      }).sort((a, b) => new Date(b.end_date!).getTime() - new Date(a.end_date!).getTime());
      setPastPlans(past);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setPlan(null);
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

  // Use fetched plan for display
  const activePlan = plan;

  // Calculate progress from plan (memoized for performance)
  const progress = useMemo(() => {
    if (!activePlan || !isPlanReady(activePlan)) return 0;

    const today = new Date();
    const startDate = new Date(activePlan.start_date!);
    const endDate = new Date(activePlan.end_date!);

    if (today < startDate) return 0;
    if (today > endDate) return 100;

    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  }, [activePlan]);

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Get next months (current + 2 future)
  const getNextMonths = () => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentMonth + i >= 12 ? currentYear + 1 : currentYear;
      months.push({
        name: MONTHS[monthIndex],
        index: monthIndex,
        year,
        isCurrent: i === 0,
      });
    }
    return months;
  };

  const monthsToShow = getNextMonths();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandLogo}>
            <Ionicons name="fitness" size={24} color={colors.accent.blue} />
          </View>
          <View>
            <Text style={styles.brandName}>RUNLINE</Text>
            <Text style={styles.brandSubtitle}>Coach Running</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={28} color={colors.text.primary} />
        </TouchableOpacity>
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerLabel}>
            <Ionicons name="calendar" size={14} color={colors.accent.blue} />
            <Text style={styles.headerLabelText}>MES PLANS</Text>
          </View>
          <Text style={styles.headerTitle}>
            Votre progression{'\n'}en {currentYear}
          </Text>
        </View>

        {/* Month Cards */}
        <View style={styles.monthList}>
          {monthsToShow.map((month) => {
            if (month.isCurrent) {
              // Check plan status for current month
              const hasPlan = isPlanReady(activePlan);
              const isPending = activePlan && (activePlan.status === 'pending' || activePlan.status === 'generating');

              if (hasPlan) {
                // Active current month card with plan
                return (
                  <TouchableOpacity
                    key={month.name}
                    style={styles.activeCard}
                    onPress={() => router.push('/(tabs)/plans')}
                    activeOpacity={0.95}
                  >
                    <View style={styles.activeCardGlow} />
                    <View style={styles.activeCardContent}>
                      <View style={styles.activeCardLeft}>
                        <View style={styles.statusBadge}>
                          <View style={styles.pulseDot} />
                          <Text style={styles.statusText}>En cours</Text>
                        </View>
                        <Text style={styles.activeMonthName}>{month.name}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressSection}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progression</Text>
                            <Text style={styles.progressValue}>{progress}%</Text>
                          </View>
                          <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                          </View>
                        </View>
                      </View>

                      <View style={styles.activeCardRight}>
                        <View style={styles.cardImagePlaceholder}>
                          <Ionicons name="map" size={40} color={colors.accent.blue} />
                        </View>
                        <View style={styles.arrowButton}>
                          <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              } else if (isPending) {
                // Plan is being generated
                return (
                  <TouchableOpacity
                    key={month.name}
                    style={styles.pendingCard}
                    onPress={() => router.push('/(tabs)/plans')}
                    activeOpacity={0.9}
                  >
                    <View style={styles.pendingCardContent}>
                      <View style={styles.pendingCardLeft}>
                        <View style={styles.pendingBadge}>
                          <Ionicons name="hourglass-outline" size={14} color={colors.accent.blue} />
                          <Text style={styles.pendingBadgeText}>Génération en cours</Text>
                        </View>
                        <Text style={styles.pendingMonthName}>{month.name}</Text>
                        <Text style={styles.pendingSubtext}>
                          Votre plan personnalisé est en cours de création...
                        </Text>
                      </View>
                      <View style={styles.pendingCardRight}>
                        <ActivityIndicator size="small" color={colors.accent.blue} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              } else {
                // No plan yet - show as not planned
                return (
                  <TouchableOpacity
                    key={month.name}
                    style={styles.currentNoPlanCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.currentNoPlanLeft}>
                      <Text style={styles.currentNoPlanMonth}>{month.name}</Text>
                      <Text style={styles.currentNoPlanStatus}>Non planifié</Text>
                      <Text style={styles.currentNoPlanText}>
                        Votre plan sera généré après votre inscription.
                      </Text>
                    </View>
                    <View style={styles.currentNoPlanRight}>
                      <Ionicons name="calendar-outline" size={32} color={colors.text.tertiary} />
                    </View>
                  </TouchableOpacity>
                );
              }
            } else {
              // Future month card - non planifié
              return (
                <TouchableOpacity
                  key={month.name}
                  style={styles.futureCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.futureCardLeft}>
                    <Text style={styles.futureMonthName}>{month.name}</Text>
                    <Text style={styles.futureStatus}>Non planifié</Text>
                    <Text style={styles.futurePlanText}>Généré automatiquement</Text>
                  </View>
                  <View style={styles.futureCardRight}>
                    <Ionicons name="time-outline" size={28} color={colors.text.tertiary} />
                  </View>
                </TouchableOpacity>
              );
            }
          })}

          {/* History Section */}
          {pastPlans.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyLabel}>HISTORIQUE</Text>
              {pastPlans.map((pastPlan) => {
                const startDate = new Date(pastPlan.start_date!);
                const endDate = new Date(pastPlan.end_date!);
                const startMonth = MONTHS[startDate.getMonth()];
                const endMonth = MONTHS[endDate.getMonth()];
                const year = endDate.getFullYear();
                const label = startDate.getMonth() === endDate.getMonth()
                  ? `${startMonth} ${year}`
                  : `${startMonth} – ${endMonth} ${year}`;

                const sessionCount = pastPlan.content?.weeks
                  ? pastPlan.content.weeks
                      .flatMap(w => w.days)
                      .filter(d => d.type !== 'repos').length
                  : 0;

                return (
                  <TouchableOpacity
                    key={pastPlan.id}
                    style={styles.historyCard}
                    activeOpacity={0.7}
                    onPress={() => router.push('/(tabs)/plans')}
                  >
                    <View style={styles.historyLeft}>
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={18} color="#10B981" />
                      </View>
                      <View>
                        <Text style={styles.historyMonth}>{label}</Text>
                        <Text style={styles.historyDetail}>{sessionCount} séances au programme</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color={colors.accent.blue} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/plans')}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="calendar" size={26} color={colors.text.tertiary} />
          </View>
          <Text style={styles.navLabel}>Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={26} color={colors.text.tertiary} />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>

        {/* iOS Home Indicator */}
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

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: colors.primary.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Header Section
  headerSection: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent.blue,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 36,
  },

  // Month List
  monthList: {
    gap: 16,
    paddingTop: 16,
  },

  // Active Card
  activeCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent.blue,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  activeCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent.blue,
    opacity: 0.05,
  },
  activeCardContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  activeCardLeft: {
    flex: 1,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  activeMonthName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: colors.accent.blue,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: 4,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  activeCardRight: {
    width: 100,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pending Card (plan being generated)
  pendingCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(50, 140, 231, 0.4)',
    borderStyle: 'dashed',
  },
  pendingCardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  pendingCardLeft: {
    flex: 1,
    gap: 6,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent.blue,
  },
  pendingMonthName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  pendingSubtext: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  pendingCardRight: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Current month no plan card
  currentNoPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  currentNoPlanLeft: {
    flex: 1,
    gap: 4,
  },
  currentNoPlanMonth: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  currentNoPlanStatus: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  currentNoPlanText: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  currentNoPlanRight: {
    width: 80,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Future Card
  futureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  futureCardLeft: {
    flex: 1,
    gap: 4,
  },
  futureMonthName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  futureStatus: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  futurePlanText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  futureCardRight: {
    width: 80,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // History Section
  historySection: {
    marginTop: 24,
  },
  historyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 38, 50, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  historyDetail: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
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
  navIconContainer: {
    position: 'relative',
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
