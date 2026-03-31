// Reports related types
export interface ConversationMetric {
  open: number;
  unattended: number;
  unassigned: number;
  pending: number;
}

export interface AgentStatus {
  online: number;
  busy: number;
  offline: number;
}

export interface TeamConversationMetric {
  id: string;
  name: string;
  open: number;
  unattended: number;
  unassigned: number;
}

export interface AgentConversationMetric {
  id: string;
  name: string;
  thumbnail?: string;
  availability_status: 'online' | 'busy' | 'offline';
  open: number;
  unattended: number;
  unassigned: number;
}

export interface HeatmapData {
  timestamp: number;
  value: number;
}

// Raw API response types
export interface AgentReport {
  id: string;
  availability_status: 'online' | 'busy' | 'offline';
  auto_offline: boolean;
  confirmed: boolean;
  email: string;
  available_name: string;
  name: string;
  role: string;
  thumbnail: string;
}

export interface GroupedConversationMetric {
  open: number;
  unattended: number;
  unassigned: number;
  assignee_id: string | null;
  team_id?: string | null;
}

export interface LiveReportsResponse {
  conversationMetric: ConversationMetric;
  agentStatus: AgentStatus;
  teamConversationMetric: TeamConversationMetric[];
  agentConversationMetric: AgentConversationMetric[];
  heatmapData: HeatmapData[];
}

export interface ConversationMetricsParams {
  team_id?: string;
}

export interface GroupedConversationParams {
  group_by: 'assignee_id' | 'team_id';
}

export interface GroupedConversationResponse {
  agents?: AgentConversationMetric[];
  teams?: TeamConversationMetric[];
}

// API Response interfaces
export interface ConversationMetricResponse {
  data: ConversationMetric;
}

export interface AgentStatusResponse {
  data: AgentStatus;
}

export interface GroupedConversationMetricResponse {
  data: GroupedConversationResponse;
}

export interface HeatmapDataResponse {
  data: HeatmapData[];
}

// Report summary interfaces
export interface ReportSummary {
  conversations_count: number;
  incoming_messages_count: number;
  outgoing_messages_count: number;
  avg_first_response_time: number;
  avg_resolution_time: number;
  resolutions_count: number;
  reply_time: number;
  previous: {
    conversations_count: number;
    incoming_messages_count: number;
    outgoing_messages_count: number;
    avg_first_response_time: number;
    avg_resolution_time: number;
    resolutions_count: number;
    reply_time: number;
  };
}

export interface ReportData {
  timestamp: number;
  value: number;
  count?: number;
}

export type ReportMetric =
  | 'conversations_count'
  | 'incoming_messages_count'
  | 'outgoing_messages_count'
  | 'avg_first_response_time'
  | 'avg_resolution_time'
  | 'resolutions_count'
  | 'reply_time';

// Agent summary report interfaces
export interface AgentSummaryReport {
  id: string;
  name: string;
  email: string;
  thumbnail: string;
  availability_status: string;
  conversations_count: number;
  incoming_messages_count?: number;
  outgoing_messages_count: number;
  avg_first_response_time: number;
  avg_resolution_time: number | null;
  resolutions_count: number;
  reply_time: number;
}

// Label summary report interfaces
export interface LabelSummaryReport {
  id: string;
  title: string;
  description?: string;
  color: string;
  show_on_sidebar: boolean;
  conversations_count: number;
  outgoing_messages_count: number;
  avg_first_response_time: number;
  avg_resolution_time: number | null;
  resolutions_count: number;
  reply_time: number;
}
