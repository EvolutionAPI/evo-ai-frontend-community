import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useAuthStore } from '@/store/authStore';
import { permissionsService } from '@/services/permissions';
import type { ResourceActionsResponse } from '@/types/auth';

interface PermissionsContextValue {
  // Permissões
  userPermissions: string[];
  accountPermissions: string[];

  // Métodos de verificação
  can: (resource: string, action: string, type?: 'account' | 'user') => boolean;
  canAny: (permissions: string[], type?: 'account' | 'user') => boolean;
  canAll: (permissions: string[], type?: 'account' | 'user') => boolean;

  // Estado
  loading: boolean;
  isReady: boolean;
  error: string | null;

  // Métodos utilitários
  refreshPermissions: () => Promise<void>;
  createPermission: (resource: string, action: string) => string;
  isValidPermission: (permission: string) => boolean;
  getPermissionDisplayName: (permission: string) => string;
}

export const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentAccountId } = useAuthStore();

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [accountPermissions, setAccountPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config state
  const [resourceActions, setResourceActions] = useState<ResourceActionsResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Load permissions config (metadata)
  useEffect(() => {

    const loadConfig = async () => {
      const isAuthenticated = useAuthStore.getState().isLoggedIn;
      if (!isAuthenticated) return;

      try {
        setConfigLoading(true);
        const config = await permissionsService.getResourceActions();
        setResourceActions(config);
      } catch (err) {
        console.error('Error loading permissions config:', err);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  // ⚡ OTIMIZAÇÃO: Se há currentAccountId, não carregar userPermissions separadamente
  // accountPermissions já contém as mesmas permissões, então reutilizamos
  // Load user permissions apenas se NÃO há currentAccountId
  useEffect(() => {
    // Se há currentAccountId, não carregar userPermissions (será reutilizado de accountPermissions)
    if (currentAccountId) {
      return;
    }

    if (!user?.id) {
      setUserPermissions([]);
      return;
    }

    // Usuário sem accounts ainda — não há permissões a carregar
    if (!user.accounts || user.accounts.length === 0) {
      setUserPermissions([]);
      return;
    }

    const loadUserPermissions = async () => {
      try {
        const isAuthenticated = useAuthStore.getState().isLoggedIn;
        if (!isAuthenticated) {
          setUserPermissions([]);
          return;
        }

        setLoading(true);
        setError(null);
        const permissions = await permissionsService.getUserPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Erro ao carregar permissões do usuário:', error);
        setError('Erro ao carregar permissões do usuário');
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user?.id, currentAccountId]);

  // Load account permissions (específicas do account baseadas no AccountUser role)
  useEffect(() => {
    // Verificar autenticação primeiro - precisa ter user também
    const isAuthenticated = useAuthStore.getState().isLoggedIn;
    if (!isAuthenticated || !user) {
      setAccountPermissions([]);
      return;
    }

    if (!currentAccountId) {
      setAccountPermissions([]);
      return;
    }

    // ⚡ Proteção: não carregar se já tem permissões (evita recarregar desnecessariamente)
    if (accountPermissions.length > 0) {
      return;
    }


    const loadAccountPermissions = async () => {
      // Capturar currentAccountId no início para evitar problemas de closure
      const accountIdToLoad = currentAccountId;

      try {
        const isAuthenticated = useAuthStore.getState().isLoggedIn;

        if (!isAuthenticated) {
          setAccountPermissions([]);
          return;
        }

        setLoading(true);
        setError(null);
        const permissions = await permissionsService.getAccountPermissions(accountIdToLoad);

        setAccountPermissions(permissions);

        // ⚡ OTIMIZAÇÃO: Se há currentAccountId, reutilizar accountPermissions como userPermissions
        // Isso evita fazer uma segunda chamada, já que ambas retornam as mesmas permissões
        if (currentAccountId === accountIdToLoad) {
          setUserPermissions(permissions);
        }
      } catch (error) {
        console.error('Erro ao carregar permissões do account:', error);
        setError('Erro ao carregar permissões do account');
        setAccountPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccountPermissions();
  }, [currentAccountId, user, accountPermissions.length]);

  const createPermission = useCallback((resource: string, action: string): string => {
    return `${resource}.${action}`;
  }, []);

  const isValidPermission = useCallback(
    (permission: string): boolean => {
      if (!resourceActions) return true; // Se não tiver config, aceita
      return resourceActions.data?.all_permissions?.some(p => p.key === permission) || false;
    },
    [resourceActions],
  );

  const getPermissionDisplayName = useCallback(
    (permission: string): string => {
      if (!resourceActions) return permission;
      const perm = resourceActions.data?.all_permissions?.find(p => p.key === permission);
      return perm?.display_name || permission;
    },
    [resourceActions],
  );

  const can = useCallback(
    (resource: string, action: string, type: 'account' | 'user' = 'account'): boolean => {
      const permission = createPermission(resource, action);
      const permissionsArray = type === 'user' ? userPermissions : accountPermissions;

      // Se ainda está carregando e não há permissões, aguardar
      if (loading && permissionsArray.length === 0) {
        return false;
      }

      // Se não está carregando mas não há permissões, retornar false
      if (permissionsArray.length === 0) {
        return false;
      }

      if (error && permissionsArray.length > 0) {
        const hasPermission = permissionsArray.includes(permission);
        return hasPermission;
      }

      if (!error && !isValidPermission(permission)) {
        return false;
      }

      const hasPermission = permissionsArray.includes(permission);
      return hasPermission;
    },
    [
      createPermission,
      userPermissions,
      accountPermissions,
      error,
      isValidPermission,
      loading,
    ],
  );

  const canAny = useCallback(
    (permissions: string[], type: 'account' | 'user' = 'account'): boolean => {
      const permissionsArray = type === 'user' ? userPermissions : accountPermissions;
      return permissions.some(permission => permissionsArray.includes(permission));
    },
    [userPermissions, accountPermissions],
  );

  const canAll = useCallback(
    (permissions: string[], type: 'account' | 'user' = 'account'): boolean => {
      const permissionsArray = type === 'user' ? userPermissions : accountPermissions;
      return permissions.every(permission => permissionsArray.includes(permission));
    },
    [userPermissions, accountPermissions],
  );

  const refreshPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Carregar user permissions
      const userPerms = await permissionsService.getUserPermissions(true);
      setUserPermissions(userPerms);

      // Carregar account permissions se houver currentAccountId
      const currentAccountId = useAuthStore.getState().currentAccountId;
      if (currentAccountId) {
        const accountPerms = await permissionsService.getAccountPermissions(currentAccountId, true);
        setAccountPermissions(accountPerms);
      }
    } catch {
      setError('Erro ao recarregar permissões');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // isReady: true when user is loaded and the permissions fetch has completed
  // (regardless of whether permissions came back empty or with data).
  // Returning false when loading is done but permissions are empty causes an
  // infinite loading spinner because the RouterGuard waits for this to be true.
  const isReady = useMemo(() => {
    if (!user) return false;
    if (configLoading) return false;
    if (loading) return false;
    return true;
  }, [configLoading, loading, user]);

  const value: PermissionsContextValue = {
    userPermissions,
    accountPermissions,
    can,
    canAny,
    canAll,
    loading: loading || configLoading,
    isReady,
    error,
    refreshPermissions,
    createPermission,
    isValidPermission,
    getPermissionDisplayName,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = (): PermissionsContextValue => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
