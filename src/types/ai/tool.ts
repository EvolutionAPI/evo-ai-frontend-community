import type { PaginationMeta } from '@/types/core';

// ============================================
// Built-in Tools (from toolsService)
// ============================================

export interface ToolConfig {
  required_fields: string[];
  optional_fields: string[];
  default_values: Record<string, unknown>;
  field_types?: Record<
    string,
    | string
    | {
        type: string;
        enum?: string[];
        description?: string;
      }
  >;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
  inputModes: string[];
  outputModes: string[];
  config: ToolConfig;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  tools: string[];
}

export interface ToolsResponse {
  tools: Tool[];
  categories: ToolCategory[];
  metadata: {
    version: string;
    last_updated: string;
    total_tools: number;
    total_categories: number;
  };
}

export interface ToolsState {
  tools: Tool[];
  selectedToolIds: string[];
  meta: {
    pagination: PaginationMeta;
  };
  loading: {
    list: boolean;
  };
  filters: unknown[];
  searchQuery: string;
}

export interface ToolsListParams {
  limit?: number;
  category?: string;
  tags?: string;
  search?: string;
  skip?: number;
}
