import { apiClient } from '@/lib/api/client';

export const paymentService = {
  // Get subscription plans/prices
  async getPlans() {
    return apiClient.get('/subscription/plans');
  },

  // Create subscription (returns clientSecret for PaymentSheet)
  async createSubscription(priceId: string) {
    return apiClient.post('/payment/create-subscription', { priceId });
  },

  // Get current subscription status
  async getSubscriptionStatus() {
    return apiClient.get('/subscription/status');
  },

  // Cancel subscription
  async cancelSubscription() {
    return apiClient.post('/subscription/cancel');
  },

  // Get default payment method details
  async getPaymentMethod() {
    return apiClient.get('/subscription/payment-method');
  },

  // Create SetupIntent for updating payment method
  async createSetupIntent() {
    return apiClient.post('/payment/setup-intent');
  },

  // DEV ONLY: Skip payment, create test subscription + trigger plan generation
  async skipPayment() {
    return apiClient.post('/payment/skip', {}, { timeout: 120000 });
  },
};
