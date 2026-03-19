import { useMemo } from 'react';
import { useGlobalConfig, WhitelabelConfig } from '@/contexts/GlobalConfigContext';

const DEFAULT_CONFIG: WhitelabelConfig = {
  enabled: false,
};

export function useWhitelabelConfig() {
  const globalConfig = useGlobalConfig();
  
  const config = useMemo(() => {
    return globalConfig.whitelabel || DEFAULT_CONFIG;
  }, [globalConfig.whitelabel]);

  return { config };
}

