import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const runnerNightImage = require('@/assets/images/runner-city.jpeg');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-width hero image with overlay */}
        <View style={styles.heroSection}>
          <Image source={runnerNightImage} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(17, 25, 33, 0.6)', SUBSCRIPTION_BG]}
            locations={[0.1, 0.5, 0.95]}
            style={styles.heroGradient}
          />

          {/* Back button over the image */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.logo}>RUNLINE</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress bar over the image */}
          <View style={styles.progressOverlay}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '33%' }]} />
            </View>
            <Text style={styles.progressLabel}>Étape 1 · Tarif</Text>
          </View>

          {/* Headline at the bottom of the image */}
          <View style={styles.heroTextOverlay}>
            <Text style={styles.headline}>
              Choisissez votre{'\n'}<Text style={styles.headlineHighlight}>abonnement</Text>
            </Text>
            <Text style={styles.subtitle}>
              {t('subscription.pricing.subtitle')}
            </Text>
          </View>
        </View>

        {/* Price card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>19,99€</Text>
            <Text style={styles.period}>{t('subscription.pricing.period')}</Text>
          </View>
          <Text style={styles.priceDescription}>
            {t('subscription.pricing.cancelAnytime')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>{t('subscription.pricing.whatIncluded')}</Text>
          <FeatureRow icon="run-fast" text={t('subscription.features.personalizedPlan')} />
          <FeatureRow icon="calendar-refresh" text={t('subscription.features.monthlyRegeneration')} />
          <FeatureRow icon="trending-up" text={t('subscription.features.adaptiveDifficulty')} />
          <FeatureRow icon="calendar-week" text={t('subscription.features.weeklySchedule')} />
        </View>
      </ScrollView>

      {/* Bottom subscribe button */}
      <LinearGradient
        colors={['transparent', SUBSCRIPTION_BG]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
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
      <View style={styles.featureIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={22} color={ACCENT} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SUBSCRIPTION_BG,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Hero section
  heroSection: {
    width: SCREEN_WIDTH,
    height: 380,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: 380,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#ffffff',
    textAlign: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 38,
  },
  headlineHighlight: {
    color: ACCENT,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
  },

  // Price card
  priceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 8,
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

  // Features
  features: {
    paddingHorizontal: 24,
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
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(50, 140, 231, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },

  // Bottom bar
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  subscribeButton: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
