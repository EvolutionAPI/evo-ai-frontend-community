export interface UsageData {
  usage: {
    agents: string;
    sessions_this_month: string;
    active_sessions: string;
    knowledge_files: string;
    knowledge_size_mb: string;
    memory_retention_days: string;
    old_memory_entries: number;
  };
  warnings: string[];
}

export interface ParsedUsage {
  current: number;
  limit: number;
  percentage: number;
  isOverLimit: boolean;
  isNearLimit: boolean; // > 80%
}

export interface UsageIndicatorProps {
  label: string;
  usage: string;
  icon: React.ReactNode;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface UsageStats {
  agents_used: number;
  custom_tools_used: number;
  mcp_servers_used: number;
  api_keys_used: number;
  storage_used_mb: number;
  sessions_this_month: number;
}

export interface PlanLimits {
  plan_name: string;
  agents: {
    max_agents_per_client: number;
    max_tools_per_agent: number;
    max_workflows_per_agent: number;
    memory_retention_days: number;
    advanced_features_enabled: boolean;
  };
  tools_and_integrations: {
    custom_tools_max: number;
    custom_mcp_servers_max: number;
    api_keys_max: number;
    allowed_tools: string[];
  };
  custom_tools: {
    max_custom_tools: number;
    complex_logic_enabled: boolean;
    external_api_enabled: boolean;
  };
  mcp_servers: {
    max_custom_mcp_servers: number;
    community_servers_enabled: boolean;
    custom_protocols_enabled: boolean;
  };
  api_keys: {
    max_api_keys: number;
    rate_limiting_enabled: boolean;
    webhook_enabled: boolean;
  };
  memory_and_storage: {
    max_sessions_stored: number;
    session_retention_days: number;
    max_memory_entries: number;
    max_knowledge_entries: number;
    max_document_size_mb: number;
    total_storage_mb: number;
    storage_memory_enabled: boolean;
    memory_preloading_enabled: boolean;
    knowledge_search_enabled: boolean;
  };
  usage_and_performance: {
    sessions_per_month: number;
    concurrent_sessions: number;
    requests_per_minute: number;
    streaming_enabled: boolean;
    push_notifications_enabled: boolean;
    live_audio_enabled: boolean;
  };
  collaboration: {
    folder_sharing_enabled: boolean;
    max_shared_folders: number;
    permission_levels: string[];
    team_members_max: number;
  };
  storage: {
    max_storage_mb: number;
    backup_enabled: boolean;
    export_enabled: boolean;
  };
}

export interface ProfileData {
  id: string;
  client_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PreferencesData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_enabled: boolean;
  auto_save: boolean;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface PreferencesUpdate {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sound_enabled?: boolean;
  auto_save?: boolean;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
