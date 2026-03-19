import { useState, useEffect, useMemo } from 'react';
import { accountService } from '../services/account/accountService';
import type { Account, AccountFeatures } from '@/types/settings';
import { useAccountId } from '@/hooks/useAccountId';
import { useAuthStore } from '@/store/authStore';

interface UseAccountReturn {
  // Account data
  account: Account | null;
  accountId: string | null;
  loading: boolean;
  error: string | null;

  // Feature checking
  isFeatureEnabled: (featureName: keyof AccountFeatures) => boolean;
  hasAllFeatures: (featureNames: (keyof AccountFeatures)[]) => boolean;
  hasAnyFeature: (featureNames: (keyof AccountFeatures)[]) => boolean;
  enabledFeatures: string[];
  disabledFeatures: string[];

  // Account operations
  updateAccount: (data: Partial<Account>) => Promise<void>;
  refreshAccount: () => Promise<void>;

  // URL utilities
  accountScopedUrl: (path: string) => string;
}

export function useAccount(): UseAccountReturn {
  const accountId = useAccountId(); // Usar o hook existente
  const currentUser = useAuthStore(state => state.currentUser);

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCachedAccount = (id: string): Account | null => {
    const cached = currentUser?.accounts?.find(acc => String(acc.id) === String(id));
    return (cached as unknown as Account) || null;
  };

  // Feature checking functions
  const isFeatureEnabled = (featureName: keyof AccountFeatures): boolean => {
    if (!account?.features) return false;

    // Always enable V4 interface by default (matching original logic)
    if (featureName === 'evolution_v4') return true;

    return account.features[featureName] || false;
  };

  const hasAllFeatures = (featureNames: (keyof AccountFeatures)[]): boolean => {
    return featureNames.every(feature => isFeatureEnabled(feature));
  };

  const hasAnyFeature = (featureNames: (keyof AccountFeatures)[]): boolean => {
    return featureNames.some(feature => isFeatureEnabled(feature));
  };

  const enabledFeatures = useMemo(() => {
    if (!account?.features) return [];

    return Object.entries(account.features)
      .filter(([_, enabled]) => enabled === true)
      .map(([feature, _]) => feature);
  }, [account?.features]);

  const disabledFeatures = useMemo(() => {
    if (!account?.features) return [];

    return Object.entries(account.features)
      .filter(([_, enabled]) => enabled === false)
      .map(([feature, _]) => feature);
  }, [account?.features]);

  // Account operations
  const fetchAccount = async (id: string, forceApi = false) => {
    if (!id) return;

    const cached = getCachedAccount(id);
    if (!forceApi && cached) {
      setAccount(cached);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAccount(id);
      setAccount(response);
    } catch (err) {
      // Graceful fallback for environments where account endpoints are unavailable in gateway.
      if (cached) {
        setAccount(cached);
        setError(null);
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar conta';
      setError(errorMessage);
      console.error('Erro ao carregar conta:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (data: Partial<Account>) => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedAccount = await accountService.updateAccount(accountId, data);
      setAccount(updatedAccount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setError(errorMessage);
      throw err; // Re-throw para permitir tratamento pelo componente
    } finally {
      setLoading(false);
    }
  };

  const refreshAccount = async () => {
    if (accountId) {
      await fetchAccount(accountId, true);
    }
  };

  // URL utilities
  const accountScopedUrl = (path: string): string => {
    if (!accountId) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/accounts/${accountId}/${cleanPath}`;
  };

  // Load account data when accountId changes
  useEffect(() => {
    if (accountId) {
      fetchAccount(accountId);
    }
  }, [accountId, currentUser?.id]);

  return {
    // Account data
    account,
    accountId,
    loading,
    error,

    // Feature checking
    isFeatureEnabled,
    hasAllFeatures,
    hasAnyFeature,
    enabledFeatures,
    disabledFeatures,

    // Account operations
    updateAccount,
    refreshAccount,

    // URL utilities
    accountScopedUrl,
  };
}

// Hook for feature checking without loading full account (requires account to be loaded elsewhere)
export function useFeatures(account: Account | null) {
  const isFeatureEnabled = (featureName: keyof AccountFeatures): boolean => {
    if (!account?.features) return false;

    // Always enable V4 interface by default
    if (featureName === 'evolution_v4') return true;

    return account.features[featureName] || false;
  };

  const hasAllFeatures = (featureNames: (keyof AccountFeatures)[]): boolean => {
    return featureNames.every(feature => isFeatureEnabled(feature));
  };

  const hasAnyFeature = (featureNames: (keyof AccountFeatures)[]): boolean => {
    return featureNames.some(feature => isFeatureEnabled(feature));
  };

  return {
    isFeatureEnabled,
    hasAllFeatures,
    hasAnyFeature,
  };
}

