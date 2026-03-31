import { create } from 'zustand';
import { UserResponse, UISettings } from '@/types/auth';
import { validateToken } from '@/services/auth/authService';
import i18n from '@/i18n/config';
import { useAccountStore } from './accountStore';

interface ImpersonationData {
  adminUser: UserResponse;
  adminToken: string;
  impersonatedClient: string;
}

interface AuthState {
  // User data
  currentUser: UserResponse | null;
  currentAccountId: string | null;
  isLoggedIn: boolean;

  // Token data
  accessToken: string | null;

  impersonation: ImpersonationData | null;

  // UI flags
  isLoading: boolean;
  isFetching: boolean;

  // Actions
  setUser: (user: UserResponse | null) => void;
  setCurrentAccountId: (accountId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string | null) => void;
  clearUser: () => void;
  validityCheck: () => Promise<void>;
  updateUISettings: (settings: Partial<UISettings>) => void;
  updateAvailability: (availability: 'online' | 'offline' | 'busy', accountId?: string) => void;
  getAuthHeader: () => { Authorization: string } | undefined;

  // Impersonation actions
  startImpersonation: (impersonatedUser: UserResponse, impersonatedToken: string, clientName: string) => void;
  exitImpersonation: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Helper to check if user is logged in
  const checkIsLoggedIn = (user: UserResponse | null): boolean => {
    return !!user?.id;
  };

  return {
    currentUser: null,
    currentAccountId: null,
    accessToken: localStorage.getItem('access_token'),
    isLoggedIn: false,
    isLoading: true,
    isFetching: false,
    impersonation: null,

    // Actions
    setUser: user => {
      const isLoggedIn = checkIsLoggedIn(user);
      set({
        currentUser: user,
        isLoggedIn: isLoggedIn,
      });
    },

    setCurrentAccountId: accountId => {
      // Salvar no localStorage para persistir entre reloads
      if (accountId) {
        localStorage.setItem('currentAccountId', accountId);
      } else {
        localStorage.removeItem('currentAccountId');
      }
      set({ currentAccountId: accountId });

      // Update language when switching accounts
      const user = get().currentUser;
      if (user?.accounts) {
        const activeAccount = user.accounts.find(
          (acc) => acc.id === accountId
        );

        if (activeAccount?.locale) {
          const locale = activeAccount.locale;
          // Map account locale to i18n locale
          let i18nLocale = locale;
          if (locale === 'pt' || locale === 'pt_BR') {
            i18nLocale = 'pt-BR';
          } else if (locale === 'es' || locale.startsWith('es_')) {
            i18nLocale = 'es';
          } else if (locale === 'en' || locale.startsWith('en_')) {
            i18nLocale = 'en';
          }

          // Only change language if different from current
          if (i18n.language !== i18nLocale) {
            i18n.changeLanguage(i18nLocale);
            localStorage.setItem('i18nextLng', i18nLocale);
          }
        }
      }
    },

    setLoading: loading => set({ isLoading: loading }),

    setAccessToken: (token) => {
      set({ accessToken: token });

      // Persist token in localStorage for refresh functionality
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    },

    getAuthHeader: () => {
      const token = get().accessToken || localStorage.getItem('access_token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
      return undefined;
    },

    clearUser: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('currentAccountId');
      set({
        currentUser: null,
        currentAccountId: null,
        accessToken: null,
        isLoggedIn: false,
      });
    },

    validityCheck: async () => {
      set({ isFetching: true });
      try {
        const userData = await validateToken();

        // If backend responded but without data, do not hard-fail. Keep current user.
        if (!userData) {
          set({ isFetching: false });
          return;
        }

        const isLoggedIn = checkIsLoggedIn(userData);
        set({
          currentUser: userData,
          isLoggedIn: isLoggedIn,
          isFetching: false,
        });

        // Set currentAccountId from user data
        // Priority: localStorage saved account > userData.account_id > first account
        let activeAccountId: string | null = null;
        const savedAccountId = localStorage.getItem('currentAccountId');

        if (savedAccountId && userData.accounts?.some((acc) => acc.id === savedAccountId)) {
          activeAccountId = savedAccountId;
          set({ currentAccountId: savedAccountId });
        } else {
          if (savedAccountId) {
            console.warn(`AccountId ${savedAccountId} do localStorage não está disponível para o usuário. Limpando.`);
            localStorage.removeItem('currentAccountId');
          }

          if (userData.accounts && userData.accounts.length > 0) {
            const firstAccountId = userData.accounts[0].id;
            activeAccountId = firstAccountId;
            set({ currentAccountId: firstAccountId });
            localStorage.setItem('currentAccountId', firstAccountId);
          } else {
            set({ currentAccountId: null });
            localStorage.removeItem('currentAccountId');
          }
        }

        // Set language based on active account locale
        if (activeAccountId && userData.accounts) {
          const activeAccount = userData.accounts.find(
            (acc) => acc.id === activeAccountId
          );

          if (activeAccount?.locale) {
            const locale = activeAccount.locale;
            // Map account locale to i18n locale
            let i18nLocale = locale;
            if (locale === 'pt' || locale === 'pt_BR') {
              i18nLocale = 'pt-BR';
            } else if (locale === 'es' || locale.startsWith('es_')) {
              i18nLocale = 'es';
            } else if (locale === 'en' || locale.startsWith('en_')) {
              i18nLocale = 'en';
            }

            // Only change language if different from current
            if (i18n.language !== i18nLocale) {
              await i18n.changeLanguage(i18nLocale);
              localStorage.setItem('i18nextLng', i18nLocale);
            }
          }

          // Inicialização mínima para bootstrap rápido (datasets pesados são deferred/lazy)
          try {
            await useAccountStore.getState().initializeAccountMinimal(activeAccountId);
          } catch (error) {
            console.error('Failed to initialize account after validity check:', error);
            // Não falhar o validityCheck se init mínima falhar
          }
        }
      } catch (error: unknown) {
        // Only clear on 401; otherwise keep session
        const apiError = error as { response?: { status?: number } };
        if (apiError?.response?.status === 401) {
          get().clearUser();
        }
        set({ isFetching: false });
      }
    },

    updateUISettings: settings => {
      const currentUser = get().currentUser;
      if (!currentUser) return;

      const updatedUser = {
        ...currentUser,
        ui_settings: {
          ...currentUser.ui_settings,
          ...settings,
        },
      };

      set({ currentUser: updatedUser });
    },

    updateAvailability: (availability, accountId) => {
      const currentUser = get().currentUser;
      if (!currentUser || !currentUser.accounts) return;

      const targetAccountId = accountId || get().currentAccountId;
      if (!targetAccountId) return;

      const updatedAccounts = currentUser.accounts.map(account => {
        if (account.id === targetAccountId) {
          return { ...account, availability_status: availability };
        }
        return account;
      });

      const updatedUser = {
        ...currentUser,
        accounts: updatedAccounts,
        availability,
      };

      set({ currentUser: updatedUser });
    },

    // Impersonation actions
    startImpersonation: (impersonatedUser, impersonatedToken, clientName) => {
      const currentState = get();

      // Salvar dados do admin antes de impersonar
      if (currentState.currentUser && currentState.accessToken) {
        set({
          impersonation: {
            adminUser: currentState.currentUser,
            adminToken: currentState.accessToken,
            impersonatedClient: clientName,
          },
          currentUser: impersonatedUser,
          accessToken: impersonatedToken,
          currentAccountId: impersonatedUser.account_id || impersonatedUser.accounts?.[0]?.id || null,
        });
      }
    },

    exitImpersonation: () => {
      const impersonationData = get().impersonation;

      if (impersonationData) {
        set({
          currentUser: impersonationData.adminUser,
          accessToken: impersonationData.adminToken,
          currentAccountId: impersonationData.adminUser.account_id || impersonationData.adminUser.accounts?.[0]?.id || null,
          impersonation: null,
        });
      }
    },
  };
});
