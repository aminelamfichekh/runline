/**
 * Utility to test backend connection
 * Use this to verify your mobile app can reach the backend
 */

import { apiClient } from './client';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  apiUrl?: string;
  statusCode?: number;
  error?: string;
}

/**
 * Test if backend is reachable
 * This will try to hit a public endpoint or check if the server responds
 */
export async function testBackendConnection(): Promise<ConnectionTestResult> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    // Try to make a simple request to check if backend is reachable
    // We'll try the auth/register endpoint which should exist (even if it fails, we know server is up)
    const response = await apiClient.axiosInstance.get('/auth/register', {
      validateStatus: () => true, // Don't throw on any status
    });

    return {
      success: response.status < 500, // Server is reachable if status < 500
      message: response.status < 500 
        ? `Backend is reachable! Status: ${response.status}` 
        : `Backend responded with error: ${response.status}`,
      apiUrl,
      statusCode: response.status,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Cannot reach backend server',
      apiUrl,
      error: error.message || 'Network error - check if backend is running and URL is correct',
    };
  }
}

/**
 * Test authenticated endpoint (requires JWT token)
 */
export async function testAuthenticatedConnection(): Promise<ConnectionTestResult> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    const response = await apiClient.axiosInstance.get('/profile', {
      validateStatus: () => true,
    });

    if (response.status === 200) {
      return {
        success: true,
        message: 'Authenticated connection successful!',
        apiUrl,
        statusCode: response.status,
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: 'Backend is reachable but authentication required',
        apiUrl,
        statusCode: response.status,
        error: 'You need to login first to test authenticated endpoints',
      };
    } else {
      return {
        success: false,
        message: `Backend responded with status: ${response.status}`,
        apiUrl,
        statusCode: response.status,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Cannot reach backend server',
      apiUrl,
      error: error.message || 'Network error',
    };
  }
}



