import type { StandardResponse, ResponseMeta } from '@/types/core';

/**
 * Tipos para o sistema de permissões
 * Baseado no ResourceActionsConfig do evo-auth-service
 */

// Detalhes de uma permissão específica
export interface PermissionDetail {
  key: string;
  resource: string;
  action: string;
  display_name: string;
  resource_name: string;
  action_name: string;
  description: string;
}

// Configuração de um recurso
export interface ResourceConfig {
  name: string;
  description: string;
  actions: Record<string, {
    name: string;
    description: string;
  }>;
}

export interface ResourceActionsData {
  resources: Record<string, ResourceConfig>;
  all_permissions: PermissionDetail[];
}

// Resposta do endpoint /api/v1/resource_actions (seguindo padrão StandardResponse)
export interface ResourceActionsResponse extends StandardResponse<ResourceActionsData> {
  meta: ResponseMeta & {
    total_resources: number;
    total_permissions: number;
    last_updated: string;
  };
}

// Resposta de validação de permissão
export interface ValidatePermissionResponse {
  permission_key: string;
  valid: boolean;
  display_name?: string;
  resource?: string;
  action?: string;
  resource_name?: string;
  action_name?: string;
  description?: string;
}
