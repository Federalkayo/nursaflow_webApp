import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService, SubscriptionData } from '../services/supabase/dbService';

export interface UseSubscriptionStatusResult {
  isPro: boolean;
  subscription: SubscriptionData | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useSubscriptionStatus = (): UseSubscriptionStatusResult => {
  const { student } = useAuth();
  const [isPro, setIsPro] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSubscription = useCallback(async () => {
    if (!student?.id) {
      setIsPro(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const active = await dbService.hasActiveSubscription(student.id);
      const subData = await dbService.getSubscriptionStatus(student.id);
      setIsPro(active);
      setSubscription(subData);
    } catch (err) {
      console.error('[useSubscriptionStatus Error]:', err);
      setIsPro(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [student?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    isPro,
    subscription,
    isLoading,
    refresh: fetchSubscription,
  };
};
