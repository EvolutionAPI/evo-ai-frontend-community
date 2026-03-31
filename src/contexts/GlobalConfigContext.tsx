import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/core';
import { setupService } from '@/services/setup/setupService';

export interface WhitelabelConfig {
  enabled: boolean;
  logo?: {
    light: string;
    dark: string;
  };
  favicon?: string;
  companyName?: string;
  systemName?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  colors?: {
    light: {
      primary: string;
      primaryForeground: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
    };
  };
}

export interface GlobalConfig {
  fbAppId?: string;
  fbApiVersion?: string;
  wpAppId?: string;
  wpApiVersion?: string;
  wpWhatsappConfigId?: string;
  instagramAppId?: string;
  googleOAuthClientId?: string;
  azureAppId?: string;
  // 🔒 SECURITY: Don't expose sensitive API URLs to frontend
  // Only boolean indicators to check if config exists
  hasEvolutionConfig?: boolean;
  hasEvolutionGoConfig?: boolean;
  openaiConfigured?: boolean;
  enableAccountSignup?: boolean;
  whitelabel?: WhitelabelConfig;
}

interface GlobalConfigContextValue extends GlobalConfig {
  setupRequired: boolean;
  setupLoading: boolean;
}

const GlobalConfigContext = createContext<GlobalConfigContextValue>({
  setupRequired: false,
  setupLoading: true,
});

// Cache global para evitar múltiplas chamadas
let globalConfigCache: GlobalConfig | null = null;
let globalConfigPromise: Promise<GlobalConfig> | null = null;
let setupRequiredCache: boolean | null = null;

// Exportar função para reutilização (com cache)
export const fetchGlobalConfig = async (): Promise<GlobalConfig> => {
  // Se já tem cache, retorna
  if (globalConfigCache) {
    return globalConfigCache;
  }

  // Se já está carregando, retorna a promise existente
  if (globalConfigPromise) {
    return globalConfigPromise;
  }

  // Cria nova promise de carregamento
  globalConfigPromise = (async () => {
    try {
      const res = await api.get('/global_config');
      const data = (res?.data || {}) as GlobalConfig;
      globalConfigCache = data;
      return data;
    } catch (e) {
      console.error('[GlobalConfig] Failed to load from /api/v1/global_config', e);
      globalConfigCache = {};
      return {};
    } finally {
      globalConfigPromise = null;
    }
  })();

  return globalConfigPromise;
};

export const fetchSetupStatus = async (): Promise<boolean> => {
  if (setupRequiredCache !== null) {
    return setupRequiredCache;
  }

  try {
    const status = await setupService.getStatus();
    setupRequiredCache = status.status === 'inactive';
    return setupRequiredCache;
  } catch {
    setupRequiredCache = false;
    return false;
  }
};

export const clearSetupCache = () => {
  setupRequiredCache = null;
};

export const GlobalConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(globalConfigCache || {});
  const [setupRequired, setSetupRequired] = useState<boolean>(setupRequiredCache ?? false);
  const [setupLoading, setSetupLoading] = useState<boolean>(setupRequiredCache === null);

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchGlobalConfig(), fetchSetupStatus()]).then(([configData, isSetupRequired]) => {
      if (mounted) {
        setConfig(configData);
        setSetupRequired(isSetupRequired);
        setSetupLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ ...config, setupRequired, setupLoading }),
    [config, setupRequired, setupLoading],
  );

  return <GlobalConfigContext.Provider value={value}>{children}</GlobalConfigContext.Provider>;
};

export const useGlobalConfig = (): GlobalConfigContextValue => useContext(GlobalConfigContext);
