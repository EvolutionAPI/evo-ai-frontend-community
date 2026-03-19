import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { UserResponse, Account } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
// import { actionCableService, getReconnectService } from '@/services/core';
import { getReconnectService } from '@/services/core';
import { verifyMfa, logout as authServiceLogout } from '@/services/auth/authService';
import { profileService } from '@/services/profile/profileService';
import { markBootstrapPhaseEnd, markBootstrapPhaseStart } from '@/utils/requestMonitor';

interface MfaState {
  required: boolean;
  method: 'totp' | 'email';
  tempToken: string;
  email: string;
}

interface AuthContextType {
  user: UserResponse | null;
  currentAccount: Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaState: MfaState | null;
  login: (
    userData: UserResponse,
    loginData: { access_token?: string; accounts?: Account[] },
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initializeAccount: (accountId: string) => Promise<void>;
  verifyMfaCode: (code: string) => Promise<void>;
  clearMfaState: () => void;
  setMfaRequired: (data: MfaState) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    currentUser: user,
    currentAccountId,
    isLoading,
    isLoggedIn: isAuthenticated,
    setUser,
    setCurrentAccountId,
    setLoading,
    clearUser,
    validityCheck,
  } = useAuthStore();

  const { initializeAccount: initAccountData } = useAccountStore();

  // MFA state
  const [mfaState, setMfaState] = React.useState<MfaState | null>(null);

  // Compute current account from user data and currentAccountId
  const currentAccount = React.useMemo(() => {
    if (!user?.accounts || !currentAccountId) return null;
    return user.accounts.find(account => account.id === currentAccountId) || null;
  }, [user?.accounts, currentAccountId]);

  // Ref para evitar múltiplas chamadas de validityCheck
  const validityCheckCalled = React.useRef(false);

  // Verificar autenticação baseada em cookies na inicialização
  useEffect(() => {
    const isWidgetPublicRoute =
      window.location.pathname === '/widget' ||
      window.location.pathname.startsWith('/survey/responses/');
    if (isWidgetPublicRoute) {
      validityCheckCalled.current = true;
      setLoading(false);
      return;
    }

    // ⚡ Proteção: chamar apenas uma vez
    if (validityCheckCalled.current) return;

    const checkAuth = async () => {
      validityCheckCalled.current = true;
      markBootstrapPhaseStart('auth-validity-check');

      try {
        await validityCheck();
        markBootstrapPhaseEnd('auth-validity-check', { status: 'ok' });
        // Initialize reconnect service after successful auth
        getReconnectService();
      } catch (validationError) {
        markBootstrapPhaseEnd('auth-validity-check', { status: 'error' });
        const apiError = validationError as { response?: { status?: number } };
        if (apiError?.response?.status === 401) {
          clearUser();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez no mount

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    const isWidgetPublicRoute =
      window.location.pathname === '/widget' ||
      window.location.pathname.startsWith('/survey/responses/');
    if (isWidgetPublicRoute) return;
    if (!isAuthenticated || !user) return;

    const interval = setInterval(async () => {
      await validityCheck();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const login = async (userData: UserResponse, loginData: { access_token?: string; accounts?: Account[] }) => {
    try {
      // Merge accounts from loginData into userData
      const userWithAccounts = {
        ...userData,
        accounts: loginData.accounts || userData.accounts || []
      };

      // Set user data with accounts
      setUser(userWithAccounts);

      // Set currentAccountId immediately so requests fired during the React re-render
      // triggered by setUser() already carry the account-id header.
      // validityCheck() (called by Auth.tsx right after login) will re-validate and
      // override with the server-confirmed account if needed.
      if (userWithAccounts.accounts.length > 0) {
        const savedId = localStorage.getItem('currentAccountId');
        const validSavedId = savedId && userWithAccounts.accounts.some(a => a.id === savedId) ? savedId : null;
        setCurrentAccountId(validSavedId || userWithAccounts.accounts[0].id);
      }
    } catch (error) {
      clearUser();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the backend logout service to destroy the token
      await authServiceLogout();
    } catch (error) {
      console.error('Error during logout service call:', error);
    }

    // Disconnect WebSocket
    // TODO: Temporarily disabled to avoid conflicts with Chat module WebSocket
    // actionCableService.disconnect();

    // Clear all data in memory
    clearUser();
    useAccountStore.getState().clearAccountData();
    setMfaState(null);
  };

  const verifyMfaCode = async (code: string) => {
    if (!mfaState) {
      throw new Error('No MFA session active');
    }

    try {
      setLoading(true);
      const { response } = await verifyMfa({
        email: mfaState.email,
        code,
        tempToken: mfaState.tempToken,
      });

      // Complete login after successful MFA verification
      const userData = response.data.user;
      const accounts = response.data.accounts;

      // Merge accounts into user data
      const userWithAccounts: UserResponse = {
        ...userData,
        accounts: accounts || []
      };

      setUser(userWithAccounts);

      // O token é gerenciado por cookies HttpOnly
      // Não é mais necessário armazenar no localStorage

      // Initialize account
      if (accounts && accounts.length > 0) {
        // Usar a primeira conta por padrão
        const accountId = accounts[0].id;
        await initializeAccount(accountId, userWithAccounts);
      }

      setMfaState(null);
    } catch (error) {
      console.error('Erro na verificação MFA:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearMfaState = () => {
    setMfaState(null);
  };

  const setMfaRequired = (data: MfaState) => {
    setMfaState(data);
  };

  const refreshUser = async () => {
    try {
      // Fetch complete profile data including ui_settings
      const profileData = await profileService.getProfile();

      if (profileData?.user) {
        // Merge profile data into current user
        const currentUserData = user || {} as UserResponse;
        const updatedUser: UserResponse = {
          ...currentUserData,
          ...profileData.user,
          // Keep accounts from current user if not in profile response
          accounts: profileData.accounts || currentUserData.accounts || [],
        };

        setUser(updatedUser);

        // Set currentAccountId when not yet set (e.g. after first account creation)
        const storedAccountId = useAuthStore.getState().currentAccountId;
        if (!storedAccountId && updatedUser.accounts.length > 0) {
          setCurrentAccountId(updatedUser.accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      await logout();
    }
  };

  const initializeAccount = async (accountId: string, userData?: UserResponse | null) => {
    try {
      // Get accounts from user data
      const userAccounts = user?.accounts || userData?.accounts || [];
      const hasAccess = userAccounts.find(acc => acc.id === accountId);

      if (!hasAccess) {
        // Try to use the first available account instead
        if (userAccounts.length > 0) {
          const firstAccount = userAccounts[0];
          setCurrentAccountId(firstAccount.id);
          await initAccountData(firstAccount.id);
          return;
        }
        return; // No accounts available
      }

      // Set current account
      setCurrentAccountId(accountId);

      // Load account data
      await initAccountData(accountId);

      // Initialize WebSocket connection
      // TODO: Temporarily disabled to avoid conflicts with Chat module WebSocket
      // if (user?.pubsub_token) {
      //   actionCableService.init(user.pubsub_token, accountId, user.id);
      // }

      // Initialize reconnection service
      // TODO: Temporarily disabled to avoid conflicts with Chat module WebSocket
      // getReconnectService();
    } catch (error) {
      console.error('Failed to initialize account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    currentAccount,
    isAuthenticated,
    isLoading,
    mfaState,
    login,
    logout,
    refreshUser,
    initializeAccount,
    verifyMfaCode,
    clearMfaState,
    setMfaRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
