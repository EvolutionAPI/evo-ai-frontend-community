import { apiAuth } from '@/services/core';
import { extractData } from '@/utils/apiHelpers';
import type {
  ResourceActionsResponse,
  ResourceActionsData,
  PermissionDetail
} from '@/types/auth';

/**
 * Service para gerenciar permissões do evo-auth-service
 * Usa os endpoints específicos de permissões
 */
class PermissionsService {
  private cache: ResourceActionsResponse | null = null;
  private cacheExpiry: number = 0;
  // ⚡ OTIMIZAÇÃO: Aumentado cache de 5min para 30min
  // Permissões mudam raramente, não é necessário revalidar a cada 5 minutos
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (antes: 5 minutos)

  // Cache para permissões do usuário (global)
  private userPermissionsCache: string[] | null = null;
  private permissionsCacheExpiry: number = 0;

  // Cache para permissões de account
  private accountPermissionsData: { permissions: string[]; expiry: number } | null = null;

  // ⚡ Proteção: Promise em cache para evitar múltiplas requisições simultâneas
  private userPermissionsPromise: Promise<string[]> | null = null;
  private accountPermissionsPromise: Promise<string[]> | null = null;

  /**
   * Busca todas as configurações de recursos e permissões do backend
   */
  async getResourceActions(forceRefresh = false): Promise<ResourceActionsResponse> {
    const now = Date.now();

    // Usar cache se válido e não forçar refresh
    if (!forceRefresh && this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const response = await apiAuth.get<ResourceActionsResponse>('/resource_actions');

      const responseData = extractData<ResourceActionsData>(response);
      this.cache = {
        success: true,
        data: responseData,
        meta: response.data.meta || { timestamp: new Date().toISOString() },
        message: response.data.message || 'Resource actions configuration retrieved successfully'
      } as ResourceActionsResponse;
      this.cacheExpiry = now + this.CACHE_DURATION;

      return this.cache;
    } catch (error) {
      console.error('Erro ao buscar configurações de permissões:', error);

      // Se tiver cache antigo, usar como fallback
      if (this.cache) {
        console.warn('Usando cache antigo de permissões');
        return this.cache;
      }

      throw error;
    }
  }

  /**
   * Busca permissões do usuário logado (nível global)
   */
  async getUserPermissions(forceRefresh = false): Promise<string[]> {
    const now = Date.now();

    // Usar cache se válido e não forçar refresh
    if (!forceRefresh && this.userPermissionsCache && now < this.permissionsCacheExpiry) {
      return this.userPermissionsCache;
    }

    // ⚡ Proteção: Se já existe uma requisição em andamento, aguardar ela
    if (this.userPermissionsPromise && !forceRefresh) {
      return this.userPermissionsPromise;
    }

    // Criar nova Promise e armazenar
    this.userPermissionsPromise = (async () => {
    try {
      const response = await apiAuth.get('/permissions');

      const responseData = extractData<{ permissions: string[] }>(response);
      this.userPermissionsCache = responseData.permissions || [];
      this.permissionsCacheExpiry = now + this.CACHE_DURATION;

        // Limpar Promise após sucesso
        this.userPermissionsPromise = null;

      return this.userPermissionsCache || [];
    } catch (error) {
        // Limpar Promise em caso de erro
        this.userPermissionsPromise = null;

      console.error('Erro ao buscar permissões do usuário:', error);

      // Se tiver cache antigo, usar como fallback
      if (this.userPermissionsCache) {
        console.warn('Usando cache antigo de permissões do usuário');
        return this.userPermissionsCache;
      }

      return [];
    }
    })();

    return this.userPermissionsPromise;
  }

  /**
   * Busca permissões do usuário para o account atual
   */
  async getAccountPermissions(forceRefresh = false): Promise<string[]> {
    const now = Date.now();

    // Verificar cache
    if (!forceRefresh && this.accountPermissionsData && now < this.accountPermissionsData.expiry) {
      return this.accountPermissionsData.permissions;
    }

    // ⚡ Proteção: Se já existe uma requisição em andamento, aguardar ela
    if (this.accountPermissionsPromise && !forceRefresh) {
      return this.accountPermissionsPromise;
    }

    // Criar nova Promise e armazenar
    const promise = (async () => {
      try {
        const response = await apiAuth.get('/permissions');

        const responseData = extractData<{ permissions: string[] }>(response);
        const permissions = responseData.permissions || [];
        this.accountPermissionsData = {
          permissions,
          expiry: now + this.CACHE_DURATION
        };

        // Limpar Promise após sucesso
        this.accountPermissionsPromise = null;

        return permissions;
      } catch (error) {
        // Limpar Promise em caso de erro
        this.accountPermissionsPromise = null;

        console.error('Erro ao buscar permissões do account:', error);

        // Se tiver cache antigo, usar como fallback
        if (this.accountPermissionsData) {
          console.warn('Usando cache antigo de permissões do account');
          return this.accountPermissionsData.permissions;
        }

        return [];
      }
    })();

    this.accountPermissionsPromise = promise;
    return promise;
  }

  /**
   * Obtém lista de todos os recursos disponíveis
   */
  async getResources(): Promise<string[]> {
    const config = await this.getResourceActions();
    return Object.keys(config.data.resources);
  }

  /**
   * Obtém lista de todas as ações disponíveis (extrai de todos os recursos)
   */
  async getActions(): Promise<string[]> {
    const config = await this.getResourceActions();
    const actionsSet = new Set<string>();

    Object.values(config.data.resources).forEach(resource => {
      Object.keys(resource.actions).forEach(action => {
        actionsSet.add(action);
      });
    });

    return Array.from(actionsSet).sort();
  }

  /**
   * Obtém lista de todas as permissões possíveis
   */
  async getAllPermissions(): Promise<string[]> {
    const config = await this.getResourceActions();
    return config.data.all_permissions.map(p => p.key);
  }

  /**
   * Obtém detalhes de todas as permissões
   */
  async getPermissionsWithDetails(): Promise<PermissionDetail[]> {
    const config = await this.getResourceActions();
    return config.data.all_permissions as PermissionDetail[];
  }

  /**
   * Cria uma permissão no formato resource.action
   */
  createPermission(resource: string, action: string): string {
    return `${resource}.${action}`;
  }

  /**
   * Verifica se uma permissão é válida baseado no cache local
   */
  async isValidPermission(permissionKey: string): Promise<boolean> {
    try {
      const permissions = await this.getAllPermissions();
      return permissions.includes(permissionKey);
    } catch {
      return false;
    }
  }

  /**
   * Obtém nome de exibição de uma permissão
   */
  async getPermissionDisplayName(permissionKey: string): Promise<string> {
    try {
      const permissionsWithDetails = await this.getPermissionsWithDetails();
      const permission = permissionsWithDetails.find(p => p.key === permissionKey);
      return permission?.display_name || permissionKey;
    } catch {
      return permissionKey;
    }
  }

  /**
   * Limpa o cache de permissões
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
    this.userPermissionsCache = null;
    this.permissionsCacheExpiry = 0;
    this.userPermissionsPromise = null;
    this.accountPermissionsData = null;
    this.accountPermissionsPromise = null;
  }

  /**
   * Limpa apenas o cache de permissões (mantém configurações)
   */
  clearPermissionsCache(): void {
    this.userPermissionsCache = null;
    this.permissionsCacheExpiry = 0;
    this.userPermissionsPromise = null;
    this.accountPermissionsData = null;
    this.accountPermissionsPromise = null;
  }

  /**
   * Obtém status do cache
   */
  getCacheStatus(): { cached: boolean; expiresIn: number; permissionsCached: boolean } {
    const now = Date.now();
    return {
      cached: this.cache !== null && now < this.cacheExpiry,
      expiresIn: Math.max(0, this.cacheExpiry - now),
      permissionsCached: this.userPermissionsCache !== null && now < this.permissionsCacheExpiry
    };
  }
}

// Instância singleton
export const permissionsService = new PermissionsService();
