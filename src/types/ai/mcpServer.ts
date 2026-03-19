import type { PaginationMeta } from '@/types/core';

export interface McpServerToolConfig {
  id?: string;
  name: string;
  description?: string;
}

export interface MCPServer {
  config_json: Record<string, unknown>;
  config_type: string;
  description: string;
  environments: Record<string, unknown>;
  id: string;
  name: string;
  tools: Array<{
    config: Record<string, unknown>;
    description: string;
    name: string;
    tags: string[];
  }>;
  type: string;
  updated_at: string;
  created_at: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  type: string;
  environments: Record<string, unknown>;
  tools: McpServerToolConfig[];
  toolIds?: string[];
}

export interface MCPServerCreate {
  config_json: Record<string, unknown>;
  config_type: string;
  description: string;
  environments: Record<string, unknown>;
  name: string;
  tools: McpServerToolConfig[];
  type: string;
}

export interface MCPServerUpdate {
  config_json?: Record<string, unknown>;
  config_type?: string;
  description?: string;
  environments?: Record<string, unknown>;
  name?: string;
  tools?: Array<{
    config: Record<string, unknown>;
    description: string;
    name: string;
    tags: string[];
  }>;
  type?: string;
}

// UI State Types
export interface MCPServersState {
  servers: MCPServer[];
  selectedServerIds: string[];
  meta: {
    pagination: PaginationMeta;
  };
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  filters: unknown[];
  searchQuery: string;
}

export interface MCPServersListParams {
  skip?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface MCPServerFormData extends MCPServerCreate {
  // Additional form-specific fields can be added here
}
