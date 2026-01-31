import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '@/lib/utils/auth';

export default function IndexScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authenticated = await isAuthenticated();
      console.log('🔐 Auth check in index.tsx:', authenticated);
      setIsChecking(false);

      if (authenticated) {
        console.log('✅ User authenticated, redirecting to home');
        router.replace('/(tabs)/home');
      } else {
        console.log('👤 User NOT authenticated, showing welcome screen');
      }
    };

    checkAuthAndRedirect();
  }, []);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="light-content" />

      {/* Radial-like background overlay */}
      <View style={styles.backgroundGlow} />

      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            {/* Decorative back icon – no-op on home */}
            <Text style={styles.backIcon}>{'‹'}</Text>
          </TouchableOpacity>

          <View style={styles.brandWrapper}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandBolt}>⚡</Text>
            </View>
            <Text style={styles.brandText}>RUNLINE</Text>
          </View>

          <View style={{ width: 48 }} />
        </View>

        {/* Main content */}
        <View style={styles.main}>
          <View style={styles.headlineBlock}>
            <Text style={styles.headline}>
              Bon <Text style={styles.headlineHighlight}>retour</Text> parmi nous
            </Text>
            <Text style={styles.subheadline}>Prêt pour votre prochaine session ?</Text>
          </View>

          {/* CTA block */}
          <View style={styles.ctaBlock}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(questionnaire)/step1')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>Me connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Footer link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Pas encore de compte ?
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/(auth)/register')}
              >
                {' '}S'inscrire
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#111921',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -120,
    left: -60,
    right: -60,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(50, 140, 231, 0.28)',
    opacity: 0.35,
  },
  container: {
    flex: 1,
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 20,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#328ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBolt: {
    color: '#ffffff',
    fontSize: 18,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
  },
  main: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 4,
  },
  headlineBlock: {
    paddingBottom: 24,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 38,
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    marginTop: 8,
    fontSize: 14,
    color: '#93adc8',
    textAlign: 'center',
  },
  ctaBlock: {
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#344d65',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2632',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#93adc8',
  },
  footerLink: {
    color: '#328ce7',
    fontWeight: '700',
  },
});