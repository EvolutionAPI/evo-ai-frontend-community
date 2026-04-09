import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import {
  ConversationMetric,
  AgentStatus,
  HeatmapData,
  LiveReportsResponse,
  ConversationMetricsParams,
  GroupedConversationResponse,
  AgentReport as Agent,
  GroupedConversationMetric,
  AgentConversationMetric,
  TeamConversationMetric,
  ReportSummary,
  ReportMetric,
  ReportData,
  AgentSummaryReport,
  LabelSummaryReport
} from '@/types/analytics';

class ReportsService {
  // Get conversation metrics (overview stats) - Using live_reports API v2
  async getConversationMetrics(params: ConversationMetricsParams = {}): Promise<ConversationMetric> {
    const response = await api.get(`/api/v2/live_reports/conversation_metrics`, {
      params,
    });
    return extractData<any>(response);
  }

  // Get agent status metrics - Calculate from agents list like Vue dashboard
  async getAgentStatus(): Promise<AgentStatus> {
    const response = await api.get(`/users`);
    const agents = response.data;

    // Calculate status like Vue dashboard does in agents/getAgentStatus getter
    const status = {
      online: agents.filter((agent: Agent) => agent.availability_status === 'online').length,
      busy: agents.filter((agent: Agent) => agent.availability_status === 'busy').length,
      offline: agents.filter((agent: Agent) => agent.availability_status === 'offline').length,
    };

    return status;
  }

  // Get grouped conversation metrics (agents/teams)
  async getGroupedConversations(groupBy: 'assignee_id' | 'team_id' = 'assignee_id'): Promise<GroupedConversationResponse> {
    const [groupedResponse, agentsResponse] = await Promise.all([
      api.get(`/api/v2/live_reports/grouped_conversation_metrics`, {
        params: { group_by: groupBy },
      }),
      api.get(`/users`) // Get agents list to merge data
    ]);

    const groupedData: GroupedConversationMetric[] = groupedResponse.data;
    const agents: Agent[] = agentsResponse.data;

    if (groupBy === 'assignee_id') {
      // Combine agent data with metrics
      const agentMetrics: AgentConversationMetric[] = groupedData
        .filter(metric => metric.assignee_id !== null) // Filter out unassigned
        .map(metric => {
          const agent = agents.find(a => a.id === metric.assignee_id);
          return {
            id: metric.assignee_id!,
            name: agent?.available_name || agent?.name || 'Unknown Agent',
            thumbnail: agent?.thumbnail || '',
            availability_status: agent?.availability_status || 'offline',
            open: metric.open,
            unattended: metric.unattended,
            unassigned: metric.unassigned
          };
        });

      return { agents: agentMetrics };
    } else {
      // For teams - check if we have team data
      const teamData = groupedData.filter(metric => metric.team_id !== null);

      if (teamData.length === 0) {
        // No team data available, return empty array
        return { teams: [] };
      }

      const teamMetrics: TeamConversationMetric[] = teamData.map(metric => ({
        id: metric.team_id!,
        name: `Team ${metric.team_id}`, // TODO: Get actual team names from teams API
        open: metric.open,
        unattended: metric.unattended,
        unassigned: metric.unassigned
      }));

      return { teams: teamMetrics };
    }
  }

    // Get conversation heatmap data - Use exact same parameters as Vue
  async getConversationHeatmap(daysBefore: number = 6): Promise<HeatmapData[]> {
    try {
      const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

      // Calculate dates exactly like Vue
      const to = new Date();
      to.setHours(23, 59, 59, 999); // End of day
      const from = new Date();
      from.setDate(from.getDate() - daysBefore);
      from.setHours(0, 0, 0, 0); // Start of day

      const toUnix = Math.floor(to.getTime() / 1000);
      const fromUnix = Math.floor(from.getTime() / 1000);

      const response = await api.get(`/api/v2/reports`, {
        params: {
          metric: 'conversations_count',
          since: fromUnix,
          until: toUnix,
          type: 'account',
          group_by: 'hour',
          business_hours: false,
          timezone_offset: getTimeOffset()
        },
      });

      const data = response.data;

      // Check if data is a string (CSV format)
      if (typeof data === 'string') {
        return this.parseCSVHeatmapData(data);
      }

      // If data is already array format
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return [];
    }
  }

  // Parse CSV heatmap data to {timestamp, value} format
  private parseCSVHeatmapData(csvData: string): HeatmapData[] {
    const lines = csvData.trim().split('\n');
    const result: HeatmapData[] = [];

    // Skip first line (timezone info) and second line (headers)
    if (lines.length < 3) return [];

    const headers = lines[1].split(',');
    const dates = headers.slice(1); // Remove "Start of the hour" column

    // Process each hour row
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(',');
      const hour = values[0]; // e.g., "14:00"

      // Process each date column
      for (let j = 1; j < values.length; j++) {
        const dateStr = dates[j - 1]; // e.g., "2025-08-08"
        const value = parseInt(values[j]) || 0;

        if (dateStr) {
          // Create timestamp for this date + hour
          const dateTime = new Date(`${dateStr}T${hour}:00`);
          const timestamp = Math.floor(dateTime.getTime() / 1000); // Unix timestamp

          result.push({
            timestamp,
            value
          });
        }
      }
    }

    return result;
  }

  // Get all live reports data in one call
  async getLiveReports(params: ConversationMetricsParams = {}): Promise<LiveReportsResponse> {
    const [conversationMetric, agentStatus, groupedAgents, groupedTeams, heatmapData] = await Promise.all([
      this.getConversationMetrics(params),
      this.getAgentStatus(),
      this.getGroupedConversations('assignee_id'),
      this.getGroupedConversations('team_id'),
      this.getConversationHeatmap(),
    ]);

    return {
      conversationMetric,
      agentStatus,
      teamConversationMetric: groupedTeams.teams || [],
      agentConversationMetric: groupedAgents.agents || [],
      heatmapData,
    };
  }
}

class ExtendedReportsService extends ReportsService {
  // Get report summary data
  async getReportSummary(
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportSummary> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports/summary`, {
        params: {
          since: from,
          until: to,
          type: 'account',
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error('Error fetching report summary:', error);
      throw error;
    }
  }

  // Get report chart data for specific metric
  async getReportData(
    metric: ReportMetric,
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportData[]> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports`, {
        params: {
          metric,
          since: from,
          until: to,
          type: 'account',
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error(`Error fetching report data for metric ${metric}:`, error);
      throw error;
    }
  }

  // Get agent summary reports
  async getAgentSummaryReports(
    from: number,
    to: number,
    businessHours: boolean = false
  ): Promise<AgentSummaryReport[]> {
    try {
      const response = await api.get(`/api/v2/summary_reports/agent`, {
        params: {
          since: from,
          until: to,
          business_hours: businessHours,
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error('Error fetching agent summary reports:', error);
      throw error;
    }
  }

  // Get individual agent report data (for specific metrics)
  async getAgentReportData(
    agentId: string,
    metric: ReportMetric,
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportData[]> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports`, {
        params: {
          metric,
          since: from,
          until: to,
          type: 'agent',
          id: agentId,
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error(`Error fetching agent report data for metric ${metric}:`, error);
      throw error;
    }
  }

  // Get individual agent summary
  async getAgentReportSummary(
    agentId: string,
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportSummary> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports/summary`, {
        params: {
          since: from,
          until: to,
          type: 'agent',
          id: agentId,
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error('Error fetching agent report summary:', error);
      throw error;
    }
  }

  // Get label summary reports
  async getLabelSummaryReports(
    from: number,
    to: number,
    businessHours: boolean = false
  ): Promise<LabelSummaryReport[]> {
    try {
      const response = await api.get(`/api/v2/reports/labels`, {
        params: {
          since: from,
          until: to,
          business_hours: businessHours,
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error('Error fetching label summary reports:', error);
      throw error;
    }
  }

  // Get individual label report data (for specific metrics)
  async getLabelReportData(
    labelId: string,
    metric: ReportMetric,
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportData[]> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports`, {
        params: {
          metric,
          since: from,
          until: to,
          type: 'label',
          id: labelId,
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error(`Error fetching label report data for metric ${metric}:`, error);
      throw error;
    }
  }

  // Get individual label summary
  async getLabelReportSummary(
    labelId: string,
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<ReportSummary> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports/summary`, {
        params: {
          since: from,
          until: to,
          type: 'label',
          id: labelId,
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
        },
      });

      return extractData<any>(response);
    } catch (error) {
      console.error('Error fetching label report summary:', error);
      throw error;
    }
  }

  // Download conversation reports CSV
  async downloadConversationReports(
    from: number,
    to: number,
    groupBy: string = 'day',
    businessHours: boolean = false
  ): Promise<void> {
    const getTimeOffset = () => -new Date().getTimezoneOffset() / 60;

    try {
      const response = await api.get(`/api/v2/reports/conversation_traffic`, {
        params: {
          since: from,
          until: to,
          group_by: groupBy,
          business_hours: businessHours,
          timezone_offset: getTimeOffset(),
          type: 'account'
        },
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with date range
      const startDate = new Date(from * 1000).toLocaleDateString('pt-BR').replace(/\//g, '-');
      const endDate = new Date(to * 1000).toLocaleDateString('pt-BR').replace(/\//g, '-');
      link.download = `relatorio-conversas-${startDate}-a-${endDate}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading conversation reports:', error);
      throw error;
    }
  }
}

export const reportsService = new ExtendedReportsService();
