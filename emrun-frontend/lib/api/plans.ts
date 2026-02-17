/**
 * Plans API service
 * Handles all training plan endpoints
 */

import { apiClient } from './client';
import type { Plan, PlansResponse, PlanResponse, PlanType } from '@/types/plan';

// Re-export types for convenience
export type { Plan, PlansResponse, PlanResponse, PlanContent, PlanWeek, PlanDay, SessionContent } from '@/types/plan';

export const plansApi = {
  /**
   * Get all user's plans
   * GET /api/plans
   */
  async getPlans(): Promise<PlansResponse> {
    return apiClient.get<PlansResponse>('/plans');
  },

  /**
   * Get a specific plan by ID
   * GET /api/plans/{id}
   */
  async getPlan(id: number): Promise<PlanResponse> {
    return apiClient.get<PlanResponse>(`/plans/${id}`);
  },

  /**
   * Get user's current active plan
   * GET /api/plans/active
   */
  async getActivePlan(): Promise<PlanResponse> {
    return apiClient.get<PlanResponse>('/plans/active');
  },

  /**
   * Manually trigger plan generation
   * POST /api/plans/generate
   * Note: Plans are normally auto-generated after subscription payment
   */
  async generatePlan(type: PlanType = 'initial'): Promise<PlanResponse> {
    return apiClient.post<PlanResponse>('/plans/generate', { type });
  },
};
