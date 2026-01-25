/**
 * Profile API service
 * Matches Laravel backend ProfileController endpoints
 */

import { apiClient } from './client';
import type { UserProfileFormData, UserProfileResponse } from '@/types/profile';

export const profileApi = {
  /**
   * Get user profile
   * GET /api/profile
   */
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>('/profile');
  },

  /**
   * Update user profile
   * PUT /api/profile
   * Matches backend ProfileController@update
   */
  async updateProfile(data: Partial<UserProfileFormData>): Promise<UserProfileResponse> {
    return apiClient.put<UserProfileResponse>('/profile', data);
  },
};


