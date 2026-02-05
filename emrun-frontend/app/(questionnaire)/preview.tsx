/**
 * Aperçu du plan personnalisé
 * Résumé clair du plan d'entraînement basé sur les réponses au questionnaire.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { colors } from '@/constants/colors';

const JOURS_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const TYPE_SESSION = [
  { type: 'Endurance', desc: 'Course à allure modérée pour développer votre endurance de base.', icon: 'run' },
  { type: 'Tempo', desc: 'Allure soutenue pour améliorer votre seuil et la résistance.', icon: 'speedometer' },
  { type: 'VMA', desc: 'Séances de vitesse pour progresser sur le court et moyen terme.', icon: 'lightning-bolt' },
  { type: 'Récup', desc: 'Sortie légère ou repos actif pour bien récupérer.', icon: 'heart-pulse' },
];

function getPlanDescription(goal: string | undefined): string {
  switch (goal) {
    case 'me_lancer':
      return 'Un programme progressif pour vous lancer en douceur et prendre de bonnes habitudes.';
    case 'reprendre':
      return 'Une reprise en sécurité, adaptée à votre pause, pour retrouver le plaisir de courir.';
    case 'courir_race':
    case 'ameliorer_chrono':
      return 'Un plan structuré pour préparer votre objectif course et performer le jour J.';
    case 'entretenir':
    case 'ameliorer_condition':
      return 'Un plan équilibré pour entretenir votre forme et votre santé.';
    default:
      return 'Un plan sur mesure, adapté à votre profil et à vos disponibilités.';
  }
}

export default function PreviewScreen() {
  const router = useRouter();
  const { form } = useQuestionnaireForm();
  const values = form.getValues();

  const goal = values.primary_goal as string | undefined;
  const availableDays = values.available_days ?? ['monday', 'wednesday', 'friday'];
  const nbSeances = availableDays.length;
  const planDescription = getPlanDescription(goal);

  const handleViewPricing = () => {
    router.push('/(subscription)/pricing');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
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
          <Text style={styles.title}>Votre plan personnalisé</Text>
          <Text style={styles.subtitle}>
            {planDescription}
          </Text>

          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={colors.accent.blue} />
              <Text style={styles.planCardTitle}>Résumé du plan</Text>
            </View>
            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{nbSeances}</Text>
                <Text style={styles.statLabel}>séances par semaine</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>semaines par mois</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>adapté à vous</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Structure de la semaine</Text>
          <Text style={styles.sectionDescription}>
            Basé sur vos {nbSeances} jour{nbSeances > 1 ? 's' : ''} disponible{nbSeances > 1 ? 's' : ''} pour courir.
          </Text>

          {availableDays.slice(0, 5).map((dayKey, index) => {
            const session = TYPE_SESSION[index % TYPE_SESSION.length];
            const dayName = JOURS_FR[dayKey] ?? dayKey;
            return (
              <View key={dayKey} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{session.type}</Text>
                  </View>
                </View>
                <Text style={styles.dayDescription}>{session.desc}</Text>
              </View>
            );
          })}

          {nbSeances > 5 && (
            <Text style={styles.moreWorkouts}>
              + {nbSeances - 5} autre{nbSeances - 5 > 1 ? 's' : ''} séance{nbSeances - 5 > 1 ? 's' : ''} selon votre plan
            </Text>
          )}

          <Text style={styles.sectionTitle}>Ce qui est inclus</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialCommunityIcons name="robot" size={18} color={colors.accent.blue} />
              </View>
              <Text style={styles.featureText}>
                Plan généré et adapté à votre objectif et à votre niveau
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialCommunityIcons name="calendar-refresh" size={18} color={colors.accent.blue} />
              </View>
              <Text style={styles.featureText}>
                Mise à jour du plan chaque mois
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialCommunityIcons name="chart-line" size={18} color={colors.accent.blue} />
              </View>
              <Text style={styles.featureText}>
                Séances détaillées avec allures, durées et conseils
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <MaterialCommunityIcons name="trending-up" size={18} color={colors.accent.blue} />
              </View>
              <Text style={styles.featureText}>
                Progression pensée pour éviter la surcharge et les blessures
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleViewPricing} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>Voir les tarifs</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 140, 231, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#1a2632',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#93adc8',
    marginBottom: 28,
    lineHeight: 24,
  },
  planCard: {
    backgroundColor: '#1a2632',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#344d65',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#328ce7',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#93adc8',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#93adc8',
    marginBottom: 14,
  },
  dayCard: {
    backgroundColor: '#1a2632',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#344d65',
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
    color: '#ffffff',
  },
  dayBadge: {
    backgroundColor: 'rgba(50, 140, 231, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#328ce7',
  },
  dayDescription: {
    fontSize: 14,
    color: '#93adc8',
    lineHeight: 20,
  },
  moreWorkouts: {
    fontSize: 14,
    color: '#93adc8',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  featureList: {
    gap: 14,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(50, 140, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#1a2632',
    backgroundColor: '#111921',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
