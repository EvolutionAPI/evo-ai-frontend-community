import evoaiApi from '@/services/core/apiEvoAI';
import { extractData } from '@/utils/apiHelpers';

/**
 * Agent Integrations Service
 * Centraliza todas as chamadas de API relacionadas às integrações dos agentes
 */

export interface IntegrationsResponse {
  configs: Record<string, Record<string, unknown>>;
  credentials_configured: Record<string, boolean>;
}

class AgentIntegrationsService {
  /**
   * Get all integrations for an agent
   * @param agentId - ID do agente
   * @returns Configurações de integrações e status de credenciais
   */
  async getAgentIntegrations(agentId: string): Promise<IntegrationsResponse> {
    const response = await evoaiApi.get(`/agents/${agentId}/integrations`);
    return extractData<IntegrationsResponse>(response);
  }
}

export const agentIntegrationsService = new AgentIntegrationsService();
export default agentIntegrationsService;
