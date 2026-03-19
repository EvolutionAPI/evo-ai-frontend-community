import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/core';

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

const GlobalConfigContext = createContext<GlobalConfig>({});

// Cache global para evitar múltiplas chamadas
let globalConfigCache: GlobalConfig | null = null;
let globalConfigPromise: Promise<GlobalConfig> | null = null;

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

export const GlobalConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(globalConfigCache || {});

  useEffect(() => {
    let mounted = true;

    fetchGlobalConfig().then(data => {
      if (mounted) {
        setConfig(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => config, [config]);

  return <GlobalConfigContext.Provider value={value}>{children}</GlobalConfigContext.Provider>;
};

export const useGlobalConfig = (): GlobalConfig => useContext(GlobalConfigContext);
