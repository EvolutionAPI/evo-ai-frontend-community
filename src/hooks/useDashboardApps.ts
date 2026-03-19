import { useState, useEffect, useCallback, useRef } from 'react';
import { integrationsService } from '@/services/integrations';
import { DashboardApp } from '@/types/integrations';

interface UseDashboardAppsOptions {
  /**
   * Auto-load apps on mount
   * Set to false to manually trigger load (better for performance)
   * @default true
   */
  autoLoad?: boolean;

  /**
   * Delay in ms before auto-loading
   * Useful to defer non-critical loads
   * @default 0
   */
  loadDelay?: number;
}

// Cache global para evitar múltiplas chamadas
let dashboardAppsCache: DashboardApp[] | null = null;
let dashboardAppsPromise: Promise<import('@/types/integrations').DashboardAppsResponse> | null =
  null;

/**
 * Hook to load and manage sidebar dashboard apps
 * Filters apps by display_type = 'sidebar' for menu integration
 *
 * ⚡ Usa cache global para evitar múltiplas chamadas simultâneas
 *
 * @param options - Configuration options
 * @returns Dashboard apps state and actions
 */
export function useDashboardApps(options: UseDashboardAppsOptions = {}) {
  const { autoLoad = true, loadDelay = 0 } = options;
  const [apps, setApps] = useState<DashboardApp[]>(dashboardAppsCache ? dashboardAppsCache : []);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);

  // ⚡ Proteção: evitar múltiplas chamadas
  const loadCalledRef = useRef(false);

  const loadApps = useCallback(async () => {
    if (dashboardAppsCache) {
      setApps(dashboardAppsCache);
      setLoading(false);
      return;
    }

    // ⚡ Se já está carregando, aguarda a promise existente
    if (dashboardAppsPromise) {
      try {
        const result = await dashboardAppsPromise;
        const sidebarApps = result.data.filter(app => app.display_type === 'sidebar');
        setApps(sidebarApps);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      dashboardAppsPromise = integrationsService.getDashboardApps();

      const response = await dashboardAppsPromise;

      // Filter only sidebar type apps
      const sidebarApps = response.data.filter(app => app.display_type === 'sidebar');

      dashboardAppsCache = sidebarApps;
      setApps(sidebarApps);
    } catch (err) {
      console.error('Error loading dashboard apps:', err);
      setError(err as Error);
      setApps([]);
      dashboardAppsCache = null;
    } finally {
      setLoading(false);
      dashboardAppsPromise = null;
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      setLoading(false);
      return;
    }

    // ⚡ Proteção: carregar apenas uma vez por instância
    if (loadCalledRef.current) return;

    if (loadDelay > 0) {
      const timer = setTimeout(() => {
        loadCalledRef.current = true;
        loadApps();
      }, loadDelay);
      return () => clearTimeout(timer);
    }

    loadCalledRef.current = true;
    loadApps();
  }, [loadApps, autoLoad, loadDelay]);

  return {
    apps,
    loading,
    error,
    reload: loadApps,
  };
}
