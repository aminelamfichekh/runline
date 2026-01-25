/**
 * Plans API service
 * Handles all training plan endpoints
 */

import { apiClient } from './client';

export interface Plan {
  id: number;
  user_id: number;
  type: 'initial' | 'monthly';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  content: any; // JSON content of the plan
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface PlanResponse {
  plan: Plan | null;
}

export const plansApi = {
  /**
   * Get all user's plans
   * GET /api/plans
   */
  async getPlans(): Promise<PlansResponse> {
    return apiClient.get<PlansResponse>('/plans');
  },

  /**
   * Get a specific plan
   * GET /api/plans/{id}
   */
  async getPlan(id: number): Promise<PlanResponse> {
    return apiClient.get<PlanResponse>(`/plans/${id}`);
  },

  /**
   * Get user's active plan
   * GET /api/plans/active
   */
  async getActivePlan(): Promise<PlanResponse> {
    return apiClient.get<PlanResponse>('/plans/active');
  },

  /**
   * Generate a new plan
   * POST /api/plans/generate
   */
  async generatePlan(type: 'initial' | 'monthly' = 'initial'): Promise<PlanResponse> {
    return apiClient.post<PlanResponse>('/plans/generate', { type });
  },
};
