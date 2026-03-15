import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '@/lib/utils/auth';
import { LinearGradient } from 'expo-linear-gradient';

const runnerCityImage = require('@/assets/images/runner-night.jpeg');
const runlineLogo = require('@/assets/images/runline-logo.jpeg');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authenticated = await isAuthenticated();
      setIsChecking(false);

      if (authenticated) {
        router.replace('/(tabs)/home');
      }
    };

    checkAuthAndRedirect();
  }, []);

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen background image */}
      <Image source={runnerCityImage} style={styles.backgroundImage} resizeMode="cover" />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(17, 25, 33, 0.4)', 'rgba(17, 25, 33, 0.85)', '#111921']}
        locations={[0, 0.35, 0.6, 0.85]}
        style={styles.gradientOverlay}
      />

      {/* Top brand bar */}
      <View style={styles.topBar}>
        <View style={styles.brandWrapper}>
          <Image source={runlineLogo} style={styles.brandLogo} />
          <Text style={styles.brandText}>RUNLINE</Text>
        </View>
      </View>

      {/* Bottom content overlay */}
      <View style={styles.bottomContent}>
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>
            <Text style={styles.headlineHighlight}>Bienvenue</Text>
          </Text>
          <Text style={styles.subheadline}>Prêt pour votre prochaine session ?</Text>
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaBlock}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(questionnaire)/step1')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </TouchableOpacity>

          <Text style={styles.loginPrompt}>
            Déjà un compte ?{'  '}
            <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
              Se connecter
            </Text>
          </Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111921',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111921',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headlineBlock: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 44,
  },
  headlineHighlight: {
    color: '#328ce7',
  },
  subheadline: {
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  ctaBlock: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#328ce7',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#328ce7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  loginPrompt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: '#328ce7',
    fontWeight: '600',
  },
});
