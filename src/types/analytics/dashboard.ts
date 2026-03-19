export interface CustomerDashboardParams {
  pipeline_id?: string;
  team_id?: string;
  inbox_id?: string;
  user_id?: string;
  since?: number;
  until?: number;
}

export interface CustomerDashboardPeriod {
  since: number;
  until: number;
  days: number;
}

export interface CustomerDashboardStats {
  total_conversations: number;
  open_conversations: number;
  pending_conversations: number;
  unattended_conversations: number;
  unassigned_conversations: number;
  incoming_messages_count: number;
  outgoing_messages_count: number;
  avg_first_response_time_seconds: number;
  avg_resolution_time_seconds: number;
}

export interface CustomerDashboardFollowUps {
  sent: number;
  pending: number;
  overdue: number;
}

export interface CustomerDashboardCsat {
  total_responses: number;
  avg_rating: number;
  positive_rate: number;
  negative_rate: number;
  neutral_rate: number;
  rating_breakdown: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

export interface CustomerDashboardPipelineStage {
  id: string | null;
  name: string;
  count: number;
  value: number;
}

export interface CustomerDashboardPipeline {
  total: number;
  total_value: number;
  stages: CustomerDashboardPipelineStage[];
}

export interface CustomerDashboardChannel {
  id: string | null;
  name: string;
  conversations: number;
  percentage: number;
  value: number;
}

export interface CustomerDashboardAgent {
  id: string;
  name: string;
  conversations: number;
  percentage: number;
  avg_first_response_time_seconds: number;
  availability_status: string;
}

export interface CustomerDashboardAiAgent {
  id: string;
  name: string;
  messages: number;
  conversations: number;
  percentage: number;
}

export interface CustomerDashboardTrends {
  conversations_daily: Array<{ name: string; value: number }>;
  response_time_daily: Array<{ name: string; value: number }>;
  operation_heatmap: {
    timezone: string;
    days: Array<{ day_index: number; day_label: string; date: string; weekday_index: number; weekday_label: string }>;
    hours: number[];
    cells: Array<{ day_index: number; day_label: string; date: string; hour: number; conversations: number }>;
    max_value: number;
    peak_slot: { day_index: number; day_label: string; date: string | null; hour: number; conversations: number };
    peak_day_of_week: { day_index: number; day_label: string; conversations: number };
    peak_hour: { hour: number; conversations: number };
  };
  peak_day_in_period: {
    date: string | null;
    conversations: number;
  };
}

export interface CustomerDashboardCapabilities {
  has_recovery_metrics: boolean;
  has_ai_contribution_metrics: boolean;
  has_ai_vs_human_response_split: boolean;
}

export interface CustomerDashboardAiVsHuman {
  ai_messages_count: number;
  human_messages_count: number;
  ai_messages_share: number;
  human_messages_share: number;
  ai_conversations_count: number;
  human_conversations_count: number;
  avg_first_response_time_ai_seconds: number;
  avg_first_response_time_human_seconds: number;
}

export interface CustomerDashboardResponse {
  period: CustomerDashboardPeriod;
  filters: {
    pipeline_id?: string;
    team_id?: string;
    inbox_id?: string;
    user_id?: string;
  };
  stats: CustomerDashboardStats;
  csat: CustomerDashboardCsat;
  ai_vs_human: CustomerDashboardAiVsHuman;
  follow_ups: CustomerDashboardFollowUps;
  pipeline: CustomerDashboardPipeline;
  channels: CustomerDashboardChannel[];
  agents: CustomerDashboardAgent[];
  ai_agents: CustomerDashboardAiAgent[];
  trends: CustomerDashboardTrends;
  capabilities: CustomerDashboardCapabilities;
}
