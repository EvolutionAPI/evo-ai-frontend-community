import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';
import { Account } from '@/types/auth';
export interface OrganizationData {
  id: string;
  name: string;
  status: string;
  role: string;
  availability: string;
  auto_offline: boolean;
}

interface OrganizationsContextProps {
  organizations: OrganizationData[];
  addOrganization: (org: OrganizationData) => void;
  organizationSelectedId: string;
  setOrganizationSelectedId: (id: string) => void;
  organizationSelected: OrganizationData | undefined;
  loadAccountsFromUser: (
    userAccounts: Array<Account>,
  ) => void;
  switchAccount: (accountId: string) => Promise<void>;
}

const OrganizationsContext = createContext<OrganizationsContextProps | undefined>(undefined);

const OrganizationsProviderInner = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const { currentAccountId } = useAuthStore();
  const [organizationSelectedId, setOrganizationSelectedId] = useState<string>(
    currentAccountId || ''
  );
  const { initializeAccount, user } = useAuth();

  // Inicializar organizationSelectedId com o currentAccountId do authStore (que vem do localStorage)
  useEffect(() => {
    if (currentAccountId) {
      setOrganizationSelectedId(currentAccountId);
    } else if (user?.account_id) {
      setOrganizationSelectedId(String(user.account_id));
    }
  }, [currentAccountId, user]);

  const addOrganization = (org: OrganizationData) => {
    setOrganizations(prev => {
      // Se for a primeira organização, já seleciona ela
      if (prev.length === 0) setOrganizationSelectedId(org.id);
      return [...prev, org];
    });
    setOrganizationSelectedId(org.id); // Sempre seleciona a última criada
  };

  const loadAccountsFromUser = useCallback(
    (userAccounts: Array<Account>) => {
      if (!userAccounts || userAccounts.length === 0) return;

      const formattedAccounts: OrganizationData[] = userAccounts.map(account => ({
        id: String(account.id),
        name: account.name,
        status: account.status || '',
        role: typeof account.role === 'string' ? account.role : ((account.role as any)?.name || ''),
        availability: account.availability || '',
        auto_offline: account.auto_offline || false,
      }));

      setOrganizations(prevOrgs => {
        // Verificar se as contas realmente mudaram para evitar re-renders
        const currentIds = prevOrgs.map(org => org.id).sort();
        const newIds = formattedAccounts.map(acc => acc.id).sort();

        const changed =
          currentIds.length !== newIds.length ||
          !currentIds.every((id, index) => id === newIds[index]);

        return changed ? formattedAccounts : prevOrgs;
      });

      // Selecionar account baseado na prioridade:
      // 1. currentAccountId do authStore (salvo no localStorage)
      // 2. account_id do user
      // 3. primeira conta disponível
      setOrganizationSelectedId(prevSelected => {
        if (prevSelected) return prevSelected; // Manter seleção atual se já existe
        
        const savedAccountId = useAuthStore.getState().currentAccountId;
        if (savedAccountId && formattedAccounts.some(acc => acc.id === savedAccountId)) {
          return savedAccountId;
        }
        
        if (user?.account_id && formattedAccounts.some(acc => acc.id === String(user.account_id))) {
          return String(user.account_id);
        }
        
        if (formattedAccounts.length > 0) {
          return formattedAccounts[0].id;
        }
        
        return prevSelected;
      });
    },
    [],
  ); // Sem dependências para evitar loops

  const switchAccount = useCallback(
    async (accountId: string) => {
      if (accountId === organizationSelectedId) return; // Não fazer nada se já está na conta

      try {
        // Atualizar a conta selecionada no estado local
        setOrganizationSelectedId(accountId);

        // Inicializar a nova conta via AuthContext (atualiza localStorage e WebSocket)
        await initializeAccount(accountId);

        // Forçar reload da página para garantir que todos os dados sejam atualizados
        window.location.reload();
      } catch (error) {
        console.error('Error switching account:', error);
        // Reverter o estado local em caso de erro
        setOrganizationSelectedId(organizationSelectedId);
      }
    },
    [organizationSelectedId, initializeAccount],
  );

  const organizationSelected = organizations.find(org => org.id === organizationSelectedId);

  return (
    <OrganizationsContext.Provider
      value={{
        organizations,
        addOrganization,
        organizationSelectedId,
        setOrganizationSelectedId,
        organizationSelected,
        loadAccountsFromUser,
        switchAccount,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};

export const useOrganizations = () => {
  const context = useContext(OrganizationsContext);
  if (!context) {
    throw new Error('useOrganizations must be used within OrganizationsProvider');
  }
  return context;
};

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  try {
    return <OrganizationsProviderInner>{children}</OrganizationsProviderInner>;
  } catch (error) {
    console.warn('OrganizationsProvider: AuthContext not available yet');
    return <>{children}</>;
  }
};
