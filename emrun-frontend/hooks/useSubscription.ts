import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { paymentService } from '@/src/services/payment.service';

export interface SubscriptionStatus {
  isActive: boolean;
  status: string; // 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'inactive'
  isLoading: boolean;
  label: string;
  badgeLabel: string;
  periodEnd: string | null;
  refresh: () => Promise<void>;
  /** Poll backend every `intervalMs` until status is 'active' or max attempts reached */
  pollUntilActive: (intervalMs?: number, maxAttempts?: number) => Promise<boolean>;
}

function getLabels(status: string): { label: string; badgeLabel: string } {
  switch (status) {
    case 'active':
    case 'trialing':
      return { label: 'Runline Premium', badgeLabel: 'Runner Premium' };
    case 'incomplete':
      return { label: 'Paiement en cours...', badgeLabel: 'En attente' };
    case 'past_due':
      return { label: 'Paiement échoué', badgeLabel: 'Paiement requis' };
    case 'canceled':
      return { label: 'Abonnement annulé', badgeLabel: 'Annulé' };
    default:
      return { label: 'Runline Standard', badgeLabel: 'Runner Standard' };
  }
}

export function useSubscription(): SubscriptionStatus {
  const [status, setStatus] = useState<string>('inactive');
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await paymentService.getSubscriptionStatus();
      const newStatus = data?.status || 'inactive';
      setStatus(newStatus);
      setPeriodEnd(data?.subscription?.current_period_end || null);
      return newStatus;
    } catch {
      setStatus('inactive');
      setPeriodEnd(null);
      return 'inactive';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollUntilActive = useCallback(async (intervalMs = 3000, maxAttempts = 10): Promise<boolean> => {
    if (pollingRef.current) return false;
    pollingRef.current = true;

    try {
      for (let i = 0; i < maxAttempts; i++) {
        const currentStatus = await fetchStatus();
        if (currentStatus === 'active' || currentStatus === 'trialing') {
          return true;
        }
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      }
      return false;
    } finally {
      pollingRef.current = false;
    }
  }, [fetchStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus])
  );

  const isActive = status === 'active' || status === 'trialing';
  const { label, badgeLabel } = getLabels(status);

  return {
    isActive,
    status,
    isLoading,
    label,
    badgeLabel,
    periodEnd,
    refresh: fetchStatus,
    pollUntilActive,
  };
}
