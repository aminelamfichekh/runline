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
      
      // Only redirect if authenticated - unauthenticated users see welcome screen
      if (authenticated) {
        console.log('✅ User authenticated, redirecting to home');
        // User is logged in, redirect to home
        router.replace('/(tabs)/home');
      } else {
        console.log('👤 User NOT authenticated, showing welcome screen');
        // If not authenticated, do nothing - show welcome screen below
      }
    };
    
    checkAuthAndRedirect();
  }, []);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background gradient overlay */}
      <View style={styles.gradientOverlay} />
      
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>R</Text>
            </View>
          </View>
          
          <Text style={styles.title}>RUNLINE</Text>
          <Text style={styles.tagline}>Votre coach de course personnel</Text>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Obtenez un plan d'entraînement personnalisé adapté à vos objectifs, votre expérience et votre emploi du temps.
          </Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(questionnaire)/step1')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Commencer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <Text style={styles.hintText}>
            
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -2,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  descriptionSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 17,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
  ctaSection: {
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  loginButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
});