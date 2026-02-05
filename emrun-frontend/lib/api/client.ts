/**
 * API Client Configuration
 * Handles all HTTP requests to the Laravel backend
 * Includes JWT token management and automatic token refresh
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = '@emrun:access_token';
const REFRESH_TOKEN_KEY = '@emrun:refresh_token';

/**
 * API Client class
 * Manages HTTP requests with JWT authentication
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    // Log API URL in development
    this.logApiUrl();
    
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add validateStatus to not throw on 4xx/5xx
      validateStatus: (status) => status < 600, // Accept all status codes
    });

    // Request interceptor - add JWT token to requests
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh on 401
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Try to refresh the token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: newRefreshToken } = response.data.data;

            // Store new tokens
            await AsyncStorage.setItem(TOKEN_KEY, access_token);
            if (newRefreshToken) {
              await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            }

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            // Process queued requests
            this.processQueue(null, access_token);

            // Retry the original request
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.processQueue(refreshError, null);
            await this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  /**
   * Extract data from backend response
   * Backend returns { success: true, data: {...} } or { success: false, message: '...' }
   * We extract the data field if success is true, otherwise throw error
   */
  private extractData<T>(response: AxiosResponse<any>): T {
    const responseData = response.data;
    
    // If response has success field, extract data
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success && 'data' in responseData) {
        return responseData.data as T;
      }
      // If success is false, throw error with message
      if (!responseData.success) {
        const error: any = new Error(responseData.message || 'Request failed');
        error.response = response;
        throw error;
      }
    }
    
    // If no success field, return data as-is (for backward compatibility)
    return responseData as T;
  }

  /**
   * Log API URL for debugging
   */
  private logApiUrl(): void {
    if (__DEV__) {
      console.log('🔗 API URL:', API_URL);
      console.log('📱 Using API URL from:', process.env.EXPO_PUBLIC_API_URL ? 'EXPO_PUBLIC_API_URL env var' : 'default (localhost)');
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return this.extractData<T>(response);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return this.extractData<T>(response);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return this.extractData<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return this.extractData<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return this.extractData<T>(response);
  }

  /**
   * Get the axios instance (for advanced usage)
   */
  get axiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();