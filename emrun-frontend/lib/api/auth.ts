/**
 * Authentication API service
 * Handles all authentication endpoints
 */

import { apiClient } from './client';
import { storeTokens, clearTokens } from '@/lib/utils/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  session_uuid?: string; // AJOUTER CETTE LIGNE
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface MeResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📤 Calling register API with:', { email: data.email, name: data.name });
      console.log('🌐 API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api');
      
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      console.log('✅ Register API response received:', { 
        hasTokens: !!(response.access_token && response.refresh_token),
        hasUser: !!response.user,
        responseKeys: Object.keys(response)
      });
      
      // Backend returns { success: true, data: { user, access_token, refresh_token } }
      // But extractData already extracted the data, so response should be AuthResponse directly
      // However, if backend wraps it, we need to handle it
      let authData: AuthResponse;
      
      if ('user' in response && 'access_token' in response) {
        // Direct AuthResponse format
        authData = response as AuthResponse;
      } else if ('data' in response && typeof response.data === 'object') {
        // Wrapped in data field
        authData = response.data as AuthResponse;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        throw new Error('Unexpected response format from server');
      }
      
      // Verify user was created
      if (!authData.user || !authData.user.id) {
        console.error('❌ User not created properly:', authData);
        throw new Error('User registration failed: user data not returned');
      }
      
      // Automatically store tokens after registration
      if (authData.access_token && authData.refresh_token) {
        await storeTokens(authData.access_token, authData.refresh_token);
        console.log('✅ Tokens stored successfully');
        console.log('✅ User registered with ID:', authData.user.id);
        return authData;
      } else {
        console.warn('⚠️ No tokens in response:', authData);
        throw new Error('Registration successful but no tokens received');
      }
    } catch (error: any) {
      console.error('❌ Register API error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      
      // Enhanced error message for network issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network')) {
        const enhancedError: any = new Error('Cannot connect to server. Please check:\n1. Backend is running (php artisan serve --host=0.0.0.0 --port=8000)\n2. Correct IP address in .env file\n3. Phone and computer on same WiFi');
        enhancedError.response = error.response;
        enhancedError.config = error.config;
        throw enhancedError;
      }
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || error.response.data?.message || 'Validation failed';
        throw new Error(firstError);
      }
      
      // Handle database errors
      if (error.response?.status === 500 && error.response?.data?.message?.includes('Database')) {
        throw new Error('Database error. Please check database connection and run migrations.');
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store tokens after successful login
    await storeTokens(response.access_token, response.refresh_token);
    
    return response;
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Update stored tokens
    await storeTokens(response.access_token, response.refresh_token);
    
    return response;
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<MeResponse> {
    return apiClient.get<MeResponse>('/auth/me');
  },

  /**
   * Change user password
   * POST /api/auth/change-password
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return apiClient.post<void>('/auth/change-password', data);
  },

  /**
   * Update user account (name, email)
   * PUT /api/auth/account
   */
  async updateAccount(data: {
    name?: string;
    email?: string;
  }): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>('/auth/account', data);
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>('/auth/logout');
      // Clear tokens regardless of API response
      await clearTokens();
      return response;
    } catch (error) {
      // Even if API call fails, clear local tokens
      await clearTokens();
      throw error;
    }
  },
};
