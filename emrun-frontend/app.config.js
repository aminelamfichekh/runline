/**
 * Expo configuration with environment variables
 * Makes EXPO_PUBLIC_API_URL available on web
 */

const fs = require('fs');
const path = require('path');

// Read .env file if it exists
let apiUrl = 'http://localhost:8000/api';
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/);
    if (match) {
      apiUrl = match[1].trim();
    }
  }
} catch (error) {
  // Use default if .env can't be read
}

module.exports = {
  expo: {
    name: 'RUNLINE',
    slug: 'runline',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#0F1419',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.runline.app',
      buildNumber: '1',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0F1419',
      },
      package: 'com.runline.app',
      versionCode: 1,
    },
    web: {
      bundler: 'metro',
      build: {
        babel: {
          include: ['@react-native-async-storage/async-storage'],
        },
      },
    },
    scheme: 'runline',
    plugins: [
      'expo-router',
      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.runline.app',
          enableGooglePay: true,
        },
      ],
    ],
    extra: {
      apiUrl: apiUrl,
      eas: {
        projectId: '7c46a573-6cf8-4060-8e06-8166ca29b682',
      },
    },
  },
};






