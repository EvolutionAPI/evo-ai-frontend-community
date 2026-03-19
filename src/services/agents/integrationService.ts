import evoaiApi from '@/services/core/apiEvoAI';
import { extractData } from '@/utils/apiHelpers';

export interface AgentIntegration {
  id: string;
  account_id: string;
  agent_id: string;
  provider: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentIntegrationRequest {
  provider: string;
  config: Record<string, any>;
}

class IntegrationService {
  /**
   * List all integrations for an agent
   */
  async listIntegrations(agentId: string): Promise<AgentIntegration[]> {
    const response = await evoaiApi.get(`/agents/${agentId}/integrations`);
    return extractData<AgentIntegration[]>(response);
  }

  /**
   * Get integration by provider
   */
  async getIntegration(agentId: string, provider: string): Promise<AgentIntegration> {
    const response = await evoaiApi.get(`/agents/${agentId}/integrations/${provider}`);
    return extractData<AgentIntegration>(response);
  }

  /**
   * Create or update an integration
   */
  async upsertIntegration(
    agentId: string,
    data: AgentIntegrationRequest
  ): Promise<AgentIntegration> {
    const response = await evoaiApi.post(`/agents/${agentId}/integrations`, data);
    return extractData<AgentIntegration>(response);
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(agentId: string, provider: string): Promise<void> {
    await evoaiApi.delete(`/agents/${agentId}/integrations/${provider}`);
  }
}

export default new IntegrationService();
