import { apiClient } from '@/lib/api/client';

export const paymentService = {
  // Get subscription plans/prices
  async getPlans() {
    const response = await apiClient.get('/subscription/plans');
    return response.data;
  },

  // Create subscription (returns clientSecret for PaymentSheet)
  async createSubscription(priceId: string) {
    const response = await apiClient.post('/payment/create-subscription', { priceId });
    return response.data; // { clientSecret, subscriptionId, ephemeralKey, customerId }
  },

  // Get current subscription status
  async getSubscriptionStatus() {
    const response = await apiClient.get('/subscription/status');
    return response.data;
  },

  // Cancel subscription
  async cancelSubscription() {
    const response = await apiClient.post('/subscription/cancel');
    return response.data;
  }
};
