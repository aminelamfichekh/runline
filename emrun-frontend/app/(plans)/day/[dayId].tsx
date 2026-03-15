/**
 * Day Workout Detail Screen
 * Shows detailed workout plan for a specific day using REAL plan data
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
import type { PlanDay, SessionType } from '@/types/plan';
import { isPlanReady, SESSION_TYPE_COLORS, SESSION_TYPE_LABELS } from '@/types/plan';
import { BottomNav } from '@/components/ui/BottomNav';

// Icons for session types
const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  repos: 'bed',
  footing: 'walk',
  qualitative: 'flash',
  course: 'trophy',
};

// Exercise icons for renforcement cards (cycling through)
const EXERCISE_ICONS = ['🦵', '🏋️', '🤸', '⚡', '🔥', '💪', '🎯', '🦴', '🌀', '⬆️'];

const RENFORCEMENT_COLOR = '#328ce7';

/**
 * Parse renforcement string into structured exercise items.
 * Format: "Nom (description) — 3 x 10 reps | Nom2 (desc) — 3 x 12 reps"
 * Matches the parsing logic from index_claude.html demo.
 */
function parseRenforcement(raw: string): Array<{ name: string; desc: string; volume: string; icon: string }> {
  const parts = raw.replace(/\n/g, ' | ').split(' | ').map(s => s.trim()).filter(Boolean);
  const exercises = parts.filter(p => p.includes('(') || p.includes('—') || /\d+\s*x/i.test(p));
  if (exercises.length === 0) return [];

  return exercises.map((ex, i) => {
    const dashIdx = ex.lastIndexOf('—');
    const volume = dashIdx > -1 ? ex.slice(dashIdx + 1).trim() : '';
    const rest = dashIdx > -1 ? ex.slice(0, dashIdx).trim() : ex;
    const parenOpen = rest.indexOf('(');
    const parenClose = rest.lastIndexOf(')');
    const name = parenOpen > -1 ? rest.slice(0, parenOpen).trim() : rest;
    const desc = (parenOpen > -1 && parenClose > parenOpen) ? rest.slice(parenOpen + 1, parenClose) : '';
    const icon = EXERCISE_ICONS[i % EXERCISE_ICONS.length];
    return { name: name || ex, desc, volume, icon };
  });
}

/** Estimate recovery time based on volume string */
function getRecoveryTime(volume: string): string {
  if (/sec/i.test(volume)) return '30 sec repos';
  const repsMatch = volume.match(/(\d+)\s*reps/i);
  if (repsMatch) {
    return parseInt(repsMatch[1]) <= 10 ? '45 sec repos' : '30 sec repos';
  }
  return '30 sec repos';
}

export default function DayDetailScreen() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  // Parse dayId format: "weekNumber-DD-MM" (date-based) or legacy "weekNumber-dayIndex"
  const parts = (dayId || '1-0').split('-');
  const weekNum = Number(parts[0]);
  // New format: "2-09-03" -> date "09/03"; Legacy format: "2-1" -> index 1
  const isDateFormat = parts.length === 3;
  const dayDate = isDateFormat ? `${parts[1]}/${parts[2]}` : null;
  const dayIndex = !isDateFormat ? Number(parts[1]) : 0;

  const [day, setDay] = useState<PlanDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDay = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plansApi.getActivePlan();
      const plan = response.plan;

      if (!plan || !isPlanReady(plan)) {
        setError('Plan non disponible');
        return;
      }

      const week = plan.content.weeks.find(w => w.week_number === weekNum);
      if (!week) {
        setError(`Semaine ${weekNum} introuvable`);
        return;
      }

      // Find day by date (new format) or by index (legacy)
      const foundDay = dayDate
        ? week.days.find(d => d.date === dayDate)
        : week.days[dayIndex];
      if (!foundDay) {
        setError('Sortie introuvable');
        return;
      }

      setDay(foundDay);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [weekNum, dayDate, dayIndex]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent.blue} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !day) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
          <Text style={styles.brandName}>RUNLINE</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.errorText}>{error || 'Sortie introuvable'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const sessionColor = SESSION_TYPE_COLORS[day.type];
  const sessionIcon = SESSION_TYPE_ICONS[day.type];
  const sessionLabel = SESSION_TYPE_LABELS[day.type];

  // Build timeline steps from content
  const steps: Array<{ title: string; description: string; color: string }> = [];

  if (day.content.echauffement) {
    steps.push({ title: 'Échauffement', description: day.content.echauffement, color: '#10B981' });
  }
  if (day.content.corps_de_seance) {
    steps.push({ title: 'Corps de séance', description: day.content.corps_de_seance, color: colors.accent.blue });
  }
  if (day.content.recuperation) {
    steps.push({ title: 'Récupération', description: day.content.recuperation, color: '#A78BFA' });
  }

  // If no structured steps, use the description as the main content
  const hasSteps = steps.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.tertiary} />
        </TouchableOpacity>
        <Text style={styles.brandName}>RUNLINE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Title */}
        <View style={styles.dateTitle}>
          <Text style={styles.dateLabelSmall}>Plan d'entraînement</Text>
          <Text style={styles.dateText}>
            Sortie du{'\n'}
            <Text style={[styles.dateHighlight, { color: sessionColor }]}>
              {day.day_name} {day.date.split('/')[0]}
            </Text>
          </Text>
        </View>

        {/* Session Type Badge */}
        <View style={[styles.sessionTypeBadge, { backgroundColor: sessionColor + '22', borderColor: sessionColor + '44' }]}>
          <Ionicons name={sessionIcon as any} size={20} color={sessionColor} />
          <Text style={[styles.sessionTypeText, { color: sessionColor }]}>{sessionLabel}</Text>
          {day.content.duration && (
            <>
              <View style={styles.badgeDivider} />
              <Ionicons name="time-outline" size={16} color={sessionColor} />
              <Text style={[styles.sessionTypeText, { color: sessionColor }]}>{day.content.duration}</Text>
            </>
          )}
        </View>

        {/* Workout Card */}
        <View style={styles.workoutCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: sessionColor + '33' }]}>
              <Ionicons name="document-text" size={24} color={sessionColor} />
            </View>
            <Text style={styles.cardTitle}>
              {day.content.session_type || 'Détails de la sortie'}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.introText}>{day.content.description}</Text>

          {/* Steps Timeline (if structured data exists) */}
          {hasSteps && (
            <View style={styles.stepsContainer}>
              <View style={styles.timelineLine} />
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={[styles.stepDot, { backgroundColor: step.color }]} />
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Race Distance (if applicable) */}
          {day.content.race_distance && (
            <View style={styles.summaryBox}>
              <Ionicons name="trophy-outline" size={16} color={sessionColor} />
              <Text style={styles.summaryText}>Distance: {day.content.race_distance}</Text>
            </View>
          )}

          {/* Renforcement Section */}
          {day.content.renforcement && (() => {
            const exercises = parseRenforcement(day.content.renforcement);
            if (exercises.length === 0) {
              // Raw text fallback (no parseable exercises)
              return (
                <View style={styles.renforcementSection}>
                  <View style={styles.renforcementHeader}>
                    <Text style={styles.renforcementIcon}>💪</Text>
                    <Text style={styles.renforcementTitle}>RENFORCEMENT</Text>
                  </View>
                  <Text style={styles.renforcementRawText}>{day.content.renforcement}</Text>
                </View>
              );
            }
            return (
              <View style={styles.renforcementSection}>
                <View style={styles.renforcementHeader}>
                  <Text style={styles.renforcementIcon}>💪</Text>
                  <Text style={styles.renforcementTitle}>RENFORCEMENT</Text>
                </View>
                <View style={styles.renforcementList}>
                  {exercises.map((ex, idx) => (
                    <View key={idx} style={styles.renforcementItem}>
                      <Text style={styles.renforcementItemIcon}>{ex.icon}</Text>
                      <View style={styles.renforcementItemBody}>
                        <Text style={styles.renforcementItemName}>{ex.name}</Text>
                        {ex.desc ? <Text style={styles.renforcementItemDesc}>{ex.desc}</Text> : null}
                        {ex.volume ? (
                          <View style={styles.renforcementVolumeBadge}>
                            <Text style={styles.renforcementVolumeText}>🔁 {ex.volume}  ·  ⏸ {getRecoveryTime(ex.volume)}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { borderColor: sessionColor + '44' }]}>
              <Ionicons name={sessionIcon as any} size={14} color={sessionColor} />
              <Text style={[styles.tagText, { color: sessionColor }]}>{sessionLabel}</Text>
            </View>
            {day.content.duration && (
              <View style={styles.tag}>
                <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.tagText}>{day.content.duration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="plans" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
  },
  retryButtonText: {
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
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
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
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Date Title
  dateTitle: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  dateLabelSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent.blue,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  dateHighlight: {
    fontWeight: '700',
  },

  // Session Type Badge
  sessionTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sessionTypeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Workout Card
  workoutCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },

  // Intro
  introText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
  },

  // Steps Timeline
  stepsContainer: {
    position: 'relative',
    paddingLeft: 16,
    marginBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text.tertiary,
    lineHeight: 20,
  },

  // Summary Box
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
    lineHeight: 22,
    flex: 1,
  },

  // Renforcement Section
  renforcementSection: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: RENFORCEMENT_COLOR + '12',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: RENFORCEMENT_COLOR + '30',
  },
  renforcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  renforcementIcon: {
    fontSize: 20,
  },
  renforcementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: RENFORCEMENT_COLOR,
    letterSpacing: 1,
  },
  renforcementList: {
    gap: 12,
  },
  renforcementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  renforcementItemIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  renforcementItemBody: {
    flex: 1,
  },
  renforcementItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  renforcementItemDesc: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.text.tertiary,
    marginBottom: 6,
  },
  renforcementVolumeBadge: {
    backgroundColor: RENFORCEMENT_COLOR + '20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  renforcementVolumeText: {
    fontSize: 12,
    fontWeight: '600',
    color: RENFORCEMENT_COLOR,
  },
  renforcementRawText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },

});
