import authApi from '@/services/core/apiAuth';
import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { Account, CreateAccount, UpdateAccount, FormDataOptions, AccountDeleteResponse, AccountUpdateResponse } from '@/types/settings';
import { extractError } from '@/utils/apiHelpers';
import { fetchGlobalConfig } from '@/contexts/GlobalConfigContext';

class AccountService {
  private getAccountPath(accountId: string) {
    return `/accounts/${accountId}`;
  }

  async createAccount(payload: CreateAccount): Promise<{ data: any }> {
    try {
      const response = await authApi.post('/accounts', payload);
      const data = extractData(response);
      return { data };
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);

      const errorInfo = extractError(error);
      throw new Error(errorInfo.message || 'Erro ao criar conta');
    }
  }

  async getAccount(accountId: string): Promise<Account> {
    try {
      const response = await authApi.get<{ account: Account }>(this.getAccountPath(accountId));
      return extractData<Account>(response);
    } catch (error: any) {
      const status = error?.response?.status;

      // Fallback para ambientes onde `/accounts/:id` pode falhar no gateway.
      // Usamos `/accounts/current` para não quebrar o bootstrap após login.
      if (status >= 500 || status === 404) {
        try {
          const fallbackResponse = await authApi.get('/accounts/current');
          const fallbackAccount = extractData<Account>(fallbackResponse);

          if (!fallbackAccount?.id) {
            throw new Error('Conta atual inválida no fallback');
          }

          return fallbackAccount;
        } catch (fallbackError: any) {
          console.error('Erro ao buscar conta (fallback /accounts/current):', fallbackError);
          throw new Error(
            fallbackError?.response?.data?.message ||
              error?.response?.data?.message ||
              'Erro ao buscar conta',
          );
        }
      }

      console.error('Erro ao buscar conta:', error);
      throw new Error(error?.response?.data?.message || 'Erro ao buscar conta');
    }
  }

  async updateAccount(
    accountId: string,
    payload: UpdateAccount,
  ): Promise<Account> {
    try {
      const response = await authApi.patch<AccountUpdateResponse>(this.getAccountPath(accountId), payload);
      return extractData<Account>(response);
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      const errorInfo = extractError(error);
      throw new Error(errorInfo.message || 'Erro ao atualizar conta');
    }
  }

  async deleteAccount(accountId: string): Promise<AccountDeleteResponse> {
    try {
      const response = await authApi.post(`${this.getAccountPath(accountId)}/toggle_deletion`, {
        action_type: 'delete',
      });
      return extractData<AccountDeleteResponse>(response);
    } catch (error: any) {
      console.error('Erro ao marcar conta para exclusão:', error);
      throw new Error(error?.response?.data?.message || 'Erro ao marcar conta para exclusão');
    }
  }

  async undeleteAccount(accountId: string): Promise<AccountDeleteResponse> {
    try {
      const response = await authApi.post(`${this.getAccountPath(accountId)}/toggle_deletion`, {
        action_type: 'undelete',
      });
      return extractData<AccountDeleteResponse>(response);
    } catch (error: any) {
      console.error('Erro ao cancelar exclusão da conta:', error);
      throw new Error(error?.response?.data?.message || 'Erro ao cancelar exclusão da conta');
    }
  }

  // Buscar dados necessários para os formulários
  async getFormData(): Promise<FormDataOptions> {
    try {
      // Padrão: accountId deve estar apenas no header account-id, não na rota
      const [inboxesRes, agentsRes, teamsRes, labelsRes] = await Promise.allSettled([
        api.get('/inboxes'),
        authApi.get('/users'),
        api.get('/teams'),
        api.get('/labels'),
      ]);

      const getResultData = (result: PromiseSettledResult<any>, isAuthService = false) => {
        if (result.status === 'fulfilled') {
          const data = extractData(result.value);
          if (isAuthService) {
            // Auth service may return { users: [...] }
            return (data as any)?.users || data || [];
          }
          return Array.isArray(data) ? data : [];
        }
        return [];
      };

      return {
        inboxes: getResultData(inboxesRes),
        agents: getResultData(agentsRes, true), // true = isAuthService
        teams: getResultData(teamsRes),
        labels: getResultData(labelsRes),
      };
    } catch (error: any) {
      console.error('Erro ao buscar dados do formulário:', error);
      // Retornar dados vazios em caso de erro para não quebrar o formulário
      return {
        inboxes: [],
        agents: [],
        teams: [],
        labels: [],
      };
    }
  }

  // Buscar informações globais do sistema
  // Reutiliza o cache do GlobalConfigContext para evitar chamadas duplicadas
  async getGlobalConfig(): Promise<{
    appVersion?: string;
    gitSha?: string;
    isOnEvolutionCloud?: boolean;
    deploymentEnv?: string;
    brandName?: string;
    installationName?: string;
  }> {
    try {
      // Reutilizar o cache do GlobalConfigContext (evita chamada duplicada)
      const globalConfig = await fetchGlobalConfig();

      // Buscar apenas informações adicionais do sistema (se necessário)
      let systemStatus: { version?: string; gitSha?: string } = {};
      try {
        const res = await api.get('/internal/system/status');
        systemStatus = res?.data || {};
      } catch {
        // Endpoint pode não estar disponível, não é crítico
      }

      // Extrair informações do whitelabel se disponível
      const whitelabel = globalConfig.whitelabel;

      return {
        appVersion: systemStatus.version || import.meta.env.VITE_APP_VERSION || '3.0.0',
        gitSha: systemStatus.gitSha || import.meta.env.VITE_GIT_SHA || 'unknown',
        isOnEvolutionCloud: globalConfig.hasEvolutionConfig === true || globalConfig.hasEvolutionGoConfig === true || false,
        deploymentEnv: import.meta.env.MODE || 'development',
        brandName: whitelabel?.companyName || 'Evolution',
        installationName: whitelabel?.systemName || 'Evolution',
      };
    } catch (error: any) {
      console.error('Erro ao buscar configuração global:', error);
      // Fallback para valores padrão em caso de erro
      return {
        appVersion: import.meta.env.VITE_APP_VERSION || '3.0.0',
        gitSha: import.meta.env.VITE_GIT_SHA || 'unknown',
        isOnEvolutionCloud: false,
        deploymentEnv: import.meta.env.MODE || 'development',
        brandName: 'Evolution',
        installationName: 'Evolution',
      };
    }
  }
}

export const accountService = new AccountService();
