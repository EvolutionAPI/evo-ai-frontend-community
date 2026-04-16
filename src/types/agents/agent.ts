import { CustomTool } from '@/types/ai';
// Response types
import type { PaginatedResponse, StandardResponse } from '@/types/core';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  role?: string;
  goal?: string;
  client_id: string;
  type: string; // Agent type: llm, a2a, sequential, parallel, loop, workflow, task, external
  model?: string;
  api_key_id?: string;
  instruction?: string;
  agent_card_url?: string;
  folder_id?: string;
  config?: AgentConfig;
  created_at: string;
  updated_at?: string;
  // Metadata de compartilhamento
  is_shared?: boolean;
  permission_level?: PermissionLevel;
  shared_by?: string;
}

export interface AgentConfig {
  // Common config
  output_key?: string;
  output_schema?: Record<
    string,
    {
      type?: string;
      description?: string;
    }
  >;

  // Advanced bot config (Evolution integration)
  message_wait_time?: number; // Tempo de espera de mensagens (segundos)
  message_signature?: string; // Assinatura da mensagem
  enable_text_segmentation?: boolean; // Habilitar segmentação de texto
  max_characters_per_segment?: number; // Máximo de caracteres por segmento
  min_segment_size?: number; // Tamanho mínimo do segmento
  character_delay_ms?: number; // Delay por caractere (milissegundos)

  // LLM config
  tools?: Record<string, unknown>[];
  custom_tools?: {
    http_tools: CustomTool[];
  };
  custom_tool_ids?: string[];
  mcp_servers?: Record<string, unknown>[];
  custom_mcp_servers?: Record<string, unknown>[];
  custom_mcp_server_ids?: string[];
  load_memory?: boolean;
  preload_memory?: boolean;
  memory_short_term_max_messages?: number; // Maximum messages in short-term memory (default: 50, min: 10, max: 500)
  memory_medium_term_compression_interval?: number; // Compress every N messages to medium-term (default: 10, min: 5, max: 100)
  memory_base_config_id?: string; // UUID of the knowledge base configuration to use for memory operations (uses memory_index_name/memory_collection_name from the config)
  planner?: boolean;
  load_knowledge?: boolean;
  preload_knowledge?: boolean;
  knowledge_tags?: string[];
  knowledge_base_config_id?: string; // UUID of the knowledge base configuration to use
  knowledge_max_results?: number; // Maximum number of knowledge search results (default: 5, max: 20)

  // Integrations config
  integrations?: Record<string, any>;
  
  // External agent config
  provider?: string; // Provider name: flowise, n8n, typebot, dify, openai

  // A2A external sharing config
  external_sharing?: {
    enabled: boolean;
    allowlist?: string[]; // Lista de domínios/IPs permitidos
    callback_url?: string; // URL de callback para notificações
    publish_state?: 'draft' | 'published' | 'archived'; // Estado de publicação
  };

  // Other agent types config
  sub_agents?: string[];
  agent_tools?: string[];
  max_iterations?: number;
  agents_exit_loop?: string[];
  workflow?: Record<string, unknown>;
  tasks?: Record<string, unknown>[];
}

export interface AgentCreate {
  name?: string;
  description?: string;
  role?: string;
  goal?: string;
  client_id?: string;
  type: string; // Agent type: llm, a2a, sequential, parallel, loop, workflow, task, external
  model?: string;
  api_key_id?: string;
  instruction?: string;
  agent_card_url?: string; // Frontend field name
  card_url?: string; // Backend field name
  folder_id?: string;
  config?: AgentConfig;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface FolderCreate {
  name: string;
  description: string;
  client_id: string;
}

export interface FolderUpdate {
  name?: string;
  description?: string;
}

export type PermissionLevel = 'read' | 'write' | 'admin';

export interface ApiKey {
  id: string;
  name: string;
  provider: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ApiKeyCreate {
  name: string;
  provider: string;
  key_value?: string;
  base_url?: string;
}

export interface ApiKeyUpdate {
  name?: string;
  provider?: string;
  key_value?: string;
  base_url?: string;
  is_active?: boolean;
}

// ============================================
// Chat & Sessions
// ============================================

export interface ChatSession {
  id: string;
  app_name: string;
  user_id: string;
  state: Record<string, unknown>;
  events: unknown[];
  last_update_time: number;
  update_time: string;
  create_time: string;
  created_at: string;
  agent_id: string;
  client_id: string;
}

export interface ChatPart {
  text?: string;
  functionCall?: unknown;
  function_call?: unknown;
  functionResponse?: unknown;
  function_response?: unknown;
  inline_data?: {
    data: string;
    mime_type: string;
    metadata?: {
      filename?: string;
      [key: string]: unknown;
    };
    fileId?: string;
  };
  videoMetadata?: unknown;
  thought?: unknown;
  codeExecutionResult?: unknown;
  executableCode?: unknown;
  file_data?: {
    filename?: string;
    fileId?: string;
    [key: string]: unknown;
  };
}

export interface ChatMessage {
  id: string;
  content: {
    parts: ChatPart[];
    role: string;
    inlineData?: unknown[];
    files?: unknown[];
  };
  author: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface ChatRequest {
  message: string;
  files?: unknown[];
}

export interface ChatResponse {
  response: string;
  message_history: unknown[];
  status: string;
  timestamp: string;
}

export interface AgentDeleteResponse extends StandardResponse<{ message: string }> {}

export interface FolderDeleteResponse extends StandardResponse<{ message: string }> {}

export interface AgentListResponse extends PaginatedResponse<Agent> {}

export interface ApiKeyDeleteResponse extends StandardResponse<{ message: string }> {}

export interface ApiKeyModelInfo {
  value: string;
  label: string;
  provider: string;
}

export interface ApiKeyModelsResponse {
  provider: string;
  supported: boolean;
  models: ApiKeyModelInfo[];
}
