/**
 * Preview Screen
 * Shows personalized plan preview based on questionnaire answers
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

export default function PreviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { form } = useQuestionnaireForm();

  const values = form.getValues();

  // Calculate workouts per week based on available days
  const workoutsPerWeek = values.available_days?.length || 3;

  const handleViewPricing = () => {
    // Navigate to pricing screen (to be implemented in next phase)
    router.push('/');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aperçu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.preview.title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.preview.description')}
          </Text>

          {/* Plan Overview Card */}
          <View style={styles.planCard}>
            <Text style={styles.planCardTitle}>Votre plan personnalisé</Text>
            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workoutsPerWeek}</Text>
                <Text style={styles.statLabel}>séances / semaine</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>semaines / mois</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>personnalisé</Text>
              </View>
            </View>
          </View>

          {/* Week Structure */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('onboarding.preview.weekStructure')}</Text>
            <Text style={styles.sectionDescription}>
              Basé sur vos {workoutsPerWeek} jours disponibles
            </Text>

            {values.available_days?.slice(0, 3).map((day, index) => (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day}</Text>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>
                      {index === 0 ? 'Endurance' : index === 1 ? 'Tempo' : 'Intervalles'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dayDescription}>
                  {index === 0
                    ? 'Course longue à allure modérée pour développer l\'endurance'
                    : index === 1
                    ? 'Course à allure soutenue pour améliorer le seuil'
                    : 'Séances de vitesse pour améliorer la VMA'}
                </Text>
              </View>
            ))}

            {workoutsPerWeek > 3 && (
              <Text style={styles.moreWorkouts}>
                + {workoutsPerWeek - 3} autres séances adaptées à votre niveau
              </Text>
            )}
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce qui est inclus</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Plan généré par IA adapté à votre objectif
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Mise à jour automatique chaque mois
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Séances détaillées avec allures et durées
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>
                  Progression adaptée à votre niveau
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('onboarding.preview.viewPricing')}
          onPress={handleViewPricing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.primary.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.primary.medium,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.text.secondary,
    marginBottom: 32,
    fontWeight: '400',
    lineHeight: 24,
  },
  planCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  planCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent.blue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dayBadge: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dayDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  moreWorkouts: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 20,
    color: colors.accent.blue,
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.primary.medium,
    backgroundColor: colors.primary.dark,
  },
});
