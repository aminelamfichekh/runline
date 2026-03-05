import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { paymentService } from '@/src/services/payment.service';

export interface SubscriptionStatus {
  isActive: boolean;
  status: string; // 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'inactive'
  isLoading: boolean;
  label: string; // 'Runline Premium' or 'Runline Standard'
  badgeLabel: string; // 'Runner Premium' or 'Runner Standard'
  periodEnd: string | null; // ISO date string of current period end
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionStatus {
  const [status, setStatus] = useState<string>('inactive');
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await paymentService.getSubscriptionStatus();
      setStatus(data?.status || 'inactive');
      setPeriodEnd(data?.subscription?.current_period_end || null);
    } catch {
      setStatus('inactive');
      setPeriodEnd(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus])
  );

  const isActive = status === 'active' || status === 'trialing';

  return {
    isActive,
    status,
    isLoading,
    label: isActive ? 'Runline Premium' : 'Runline Standard',
    badgeLabel: isActive ? 'Runner Premium' : 'Runner Standard',
    periodEnd,
    refresh: fetchStatus,
  };
}
