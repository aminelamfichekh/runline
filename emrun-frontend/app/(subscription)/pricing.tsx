import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SUBSCRIPTION_BG = '#111921';
const CARD_BG = '#1a2632';
const BORDER = '#344d65';
const ACCENT = '#328ce7';
const TEXT_SECONDARY = '#93adc8';

export default function PricingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* RUNLINE header – same as create-account */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.logo}>RUNLINE</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressLabel}>Étape 1 · Tarif</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            Choisissez votre <Text style={styles.headlineHighlight}>abonnement</Text>
          </Text>
          <Text style={styles.subtitle}>
            {t('subscription.pricing.subtitle')}
          </Text>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>19,99 $</Text>
            <Text style={styles.period}>{t('subscription.pricing.period')}</Text>
          </View>
          <Text style={styles.priceDescription}>
            {t('subscription.pricing.cancelAnytime')}
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>{t('subscription.pricing.whatIncluded')}</Text>
          <FeatureRow icon="run-fast" text={t('subscription.features.personalizedPlan')} />
          <FeatureRow icon="calendar-refresh" text={t('subscription.features.monthlyRegeneration')} />
          <FeatureRow icon="trending-up" text={t('subscription.features.adaptiveDifficulty')} />
          <FeatureRow icon="calendar-week" text={t('subscription.features.weeklySchedule')} />
          <FeatureRow icon="brain" text={t('subscription.features.aiPowered')} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => router.push('/(subscription)/create-account')}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>
            {t('subscription.pricing.subscribe')}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name={icon as any} size={22} color={ACCENT} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUBSCRIPTION_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#ffffff',
    textAlign: 'center',
  },
  progressWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: BORDER,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 9999,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headlineContainer: {
    marginBottom: 28,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headlineHighlight: {
    color: ACCENT,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  priceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: BORDER,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
    color: ACCENT,
  },
  period: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginLeft: 8,
  },
  priceDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  features: {
    gap: 14,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: SUBSCRIPTION_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  subscribeButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
