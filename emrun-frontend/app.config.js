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
    name: 'Emrun',
    slug: 'emrun-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.emrun.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
      },
      package: 'com.emrun.app',
    },
    web: {
      bundler: 'metro',
      build: {
        babel: {
          include: ['@react-native-async-storage/async-storage'],
        },
      },
    },
    scheme: 'emrun',
    plugins: ['expo-router'],
    extra: {
      apiUrl: apiUrl,
    },
  },
};






