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

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [accountPermissions, setAccountPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the permission fetches have completed for the current user.
  // Starts false so we never report `isReady` true with empty permissions during
  // the brief render between user appearing and the fetch effect running — that
  // window used to flash the Unauthorized page after a fresh login.
  const [userPermsLoaded, setUserPermsLoaded] = useState(false);
  const [accountPermsLoaded, setAccountPermsLoaded] = useState(false);

  // Config state
  const [resourceActions, setResourceActions] = useState<ResourceActionsResponse | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Reset loaded flags whenever the logged-in user changes so the next user's
  // permissions go through the fetch cycle before `isReady` flips back to true.
  useEffect(() => {
    setUserPermsLoaded(false);
    setAccountPermsLoaded(false);
  }, [user?.id]);

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

  // Load user permissions
  useEffect(() => {
    if (!user?.id) {
      setUserPermissions([]);
      setUserPermsLoaded(true);
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
        setUserPermsLoaded(true);
      }
    };

    loadUserPermissions();
  }, [user?.id]);

  // Load account permissions (específicas do account baseadas no AccountUser role)
  useEffect(() => {
    // Verificar autenticação primeiro - precisa ter user também
    const isAuthenticated = useAuthStore.getState().isLoggedIn;
    if (!isAuthenticated || !user) {
      setAccountPermissions([]);
      setAccountPermsLoaded(true);
      return;
    }

    // ⚡ Proteção: não carregar se já tem permissões (evita recarregar desnecessariamente)
    if (accountPermissions.length > 0) {
      setAccountPermsLoaded(true);
      return;
    }

    const loadAccountPermissions = async () => {
      try {
        const isAuthenticated = useAuthStore.getState().isLoggedIn;

        if (!isAuthenticated) {
          setAccountPermissions([]);
          return;
        }

        setLoading(true);
        setError(null);
        const permissions = await permissionsService.getAccountPermissions();

        setAccountPermissions(permissions);
      } catch (error) {
        console.error('Erro ao carregar permissões do account:', error);
        setError('Erro ao carregar permissões do account');
        setAccountPermissions([]);
      } finally {
        setLoading(false);
        setAccountPermsLoaded(true);
      }
    };

    loadAccountPermissions();
  }, [user, accountPermissions.length]);

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

      // Carregar account permissions
      const accountPerms = await permissionsService.getAccountPermissions(true);
      setAccountPermissions(accountPerms);
    } catch {
      setError('Erro ao recarregar permissões');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // isReady: true when user is loaded, config finished, and both permission
  // fetches completed at least once for the current user. Tracking completion
  // (rather than just `!loading`) prevents PermissionRoute from evaluating
  // `can()` against empty arrays during the render window between user
  // appearing and the fetch effect firing — that flashed Unauthorized after
  // a fresh login.
  const isReady = useMemo(() => {
    if (!user) return false;
    if (configLoading) return false;
    if (loading) return false;
    return userPermsLoaded && accountPermsLoaded;
  }, [configLoading, loading, user, userPermsLoaded, accountPermsLoaded]);

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
