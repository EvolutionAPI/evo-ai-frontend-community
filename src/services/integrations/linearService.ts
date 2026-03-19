import api from '@/services/core/api';
import type {
  LinearConfig,
  LinearOAuthResponse,
  LinearConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const LinearService = {
  /**
   * Generate Linear OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<LinearOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/linear/authorization`
      );
      return data;
    } catch (error) {
      console.error('LinearService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Linear OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<LinearConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/linear/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('LinearService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Linear integration configuration
   */
  async getConfiguration(agentId: string): Promise<LinearConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/linear`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('LinearService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Linear integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<LinearConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/linear`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('LinearService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Linear integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/linear`
      );
      return data;
    } catch (error) {
      console.error('LinearService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Linear
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/linear/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('LinearService.discoverTools error:', error);
      throw error;
    }
  },
};

export default LinearService;

