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

      const response = await apiClient.post<AuthResponse>('/auth/register', data);

      // extractData in client.ts unwraps { success: true, data: {...} } → {...}
      // So response should already be { user, access_token, refresh_token, ... }
      // But handle fallback if wrapper was returned instead
      let authData: any = response;

      if (!authData?.access_token && authData?.data) {
        // extractData didn't unwrap — use inner data
        authData = authData.data;
      }

      console.log('📥 Register response keys:', Object.keys(authData || {}));

      if (!authData?.access_token || !authData?.refresh_token) {
        console.error('❌ Missing tokens in response:', JSON.stringify(authData));
        throw new Error('Registration response missing tokens');
      }

      if (!authData?.user?.id) {
        console.error('❌ Missing user in response:', JSON.stringify(authData));
        throw new Error('Registration response missing user data');
      }

      await storeTokens(authData.access_token, authData.refresh_token);
      console.log('✅ Tokens stored, user ID:', authData.user.id);

      return authData as AuthResponse;
    } catch (error: any) {
      console.error('❌ Register API error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Enhanced error message for network issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network') || error.message?.includes('network')) {
        const enhancedError: any = new Error('Cannot connect to server. Please check:\n1. Backend is running (php artisan serve --host=0.0.0.0 --port=8000)\n2. Correct IP address in .env file\n3. Phone and computer on same WiFi');
        enhancedError.response = error.response;
        throw enhancedError;
      }

      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const firstError = Object.values(errors)[0]?.[0] || error.response.data?.message || 'Validation failed';
        throw new Error(firstError as string);
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
