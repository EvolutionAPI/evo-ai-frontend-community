import api from '@/services/core/api';
import type {
  AsanaConfig,
  AsanaOAuthResponse,
  AsanaConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const AsanaService = {
  /**
   * Generate Asana OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<AsanaOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/asana/authorization`
      );
      return data;
    } catch (error) {
      console.error('AsanaService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Asana OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<AsanaConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/asana/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('AsanaService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Asana integration configuration
   */
  async getConfiguration(agentId: string): Promise<AsanaConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/asana`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('AsanaService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Asana integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<AsanaConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/asana`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('AsanaService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Asana integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/asana`
      );
      return data;
    } catch (error) {
      console.error('AsanaService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Asana
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/asana/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('AsanaService.discoverTools error:', error);
      throw error;
    }
  },
};

export default AsanaService;

