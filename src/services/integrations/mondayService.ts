import api from '@/services/core/api';
import type {
  MondayConfig,
  MondayOAuthResponse,
  MondayConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const MondayService = {
  /**
   * Generate Monday OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<MondayOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/monday/authorization`
      );
      return data;
    } catch (error) {
      console.error('MondayService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Monday OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<MondayConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/monday/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('MondayService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Monday integration configuration
   */
  async getConfiguration(agentId: string): Promise<MondayConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/monday`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('MondayService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Monday integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<MondayConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/monday`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('MondayService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Monday integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/monday`
      );
      return data;
    } catch (error) {
      console.error('MondayService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Monday.com
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/monday/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('MondayService.discoverTools error:', error);
      throw error;
    }
  },
};

export default MondayService;

