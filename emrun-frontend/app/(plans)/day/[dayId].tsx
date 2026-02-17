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

// Icons for session types
const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  repos: 'bed',
  footing: 'walk',
  qualitative: 'flash',
  course: 'trophy',
};

export default function DayDetailScreen() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  // Parse dayId format: "weekNumber-dayIndex"
  const [weekNum, dayIndex] = (dayId || '1-0').split('-').map(Number);

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

      const foundDay = week.days[dayIndex];
      if (!foundDay) {
        setError('Séance introuvable');
        return;
      }

      setDay(foundDay);
    } catch (err: any) {
      console.error('Failed to fetch day detail:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [weekNum, dayIndex]);

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
          <Text style={styles.errorText}>{error || 'Séance introuvable'}</Text>
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
    steps.push({ title: 'Retour au calme', description: day.content.recuperation, color: '#A78BFA' });
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
            Séance du{'\n'}
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
              {day.content.session_type || 'Détails de la séance'}
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

        {/* Spacer for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: sessionColor }]}
          onPress={() => console.log('Start workout')}
          activeOpacity={0.9}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Démarrer la séance</Text>
        </TouchableOpacity>
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

  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 48,
    backgroundColor: 'transparent',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
