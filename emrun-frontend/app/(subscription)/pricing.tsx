import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function PricingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.pricing.title')}</Text>
          <Text style={styles.subtitle}>{t('subscription.pricing.subtitle')}</Text>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>9,99 €</Text>
            <Text style={styles.period}>{t('subscription.pricing.period')}</Text>
          </View>
          <Text style={styles.priceDescription}>{t('subscription.pricing.cancelAnytime')}</Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>{t('subscription.pricing.whatIncluded')}</Text>

          <FeatureItem
            icon="fitness"
            text={t('subscription.features.personalizedPlan')}
          />
          <FeatureItem
            icon="refresh"
            text={t('subscription.features.monthlyRegeneration')}
          />
          <FeatureItem
            icon="trending-up"
            text={t('subscription.features.adaptiveDifficulty')}
          />
          <FeatureItem
            icon="calendar"
            text={t('subscription.features.weeklySchedule')}
          />
          <FeatureItem
            icon="flash"
            text={t('subscription.features.aiPowered')}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => router.push('/(subscription)/checkout')}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>
            {t('subscription.pricing.subscribe')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={24} color={colors.accent.blue} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Space for bottom bar
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: colors.accent.blue,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent.blue,
  },
  period: {
    fontSize: 18,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  priceDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  features: {
    gap: 16,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: colors.primary.dark,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  subscribeButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
