/**
 * Authentication utility functions
 * Handles token storage and retrieval using AsyncStorage
 * Web-compatible with localStorage fallback
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Web-compatible storage helper
async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new Error('Failed to store token');
    }
  } else {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      throw new Error('Failed to store token');
    }
  }
}

async function removeStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore errors
    }
  } else {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Ignore errors
    }
  }
}

/**
 * Get stored access token
 */
export async function getStoredToken(): Promise<string | null> {
  return getStorageItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export async function getStoredRefreshToken(): Promise<string | null> {
  return getStorageItem(REFRESH_TOKEN_KEY);
}

/**
 * Store both access and refresh tokens
 */
export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    console.log('Storing tokens...', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
    
    if (Platform.OS === 'web') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('Tokens stored in localStorage');
    } else {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
      console.log('Tokens stored in AsyncStorage');
      
      // Verify tokens were stored
      const storedAccess = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      console.log('Token verification:', { 
        accessStored: !!storedAccess, 
        refreshStored: !!storedRefresh 
      });
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store tokens: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Clear all stored tokens
 */
export async function clearTokens(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    }
  } catch (error) {
    // Ignore errors when clearing
  }
}

/**
 * Check if user is authenticated (has access token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getStoredToken();
  return token !== null && token.length > 0;
}
