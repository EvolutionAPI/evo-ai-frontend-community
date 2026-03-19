import api from '@/services/core/api';
import type {
  HubSpotConfig,
  HubSpotOAuthResponse,
  HubSpotConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const HubSpotService = {
  /**
   * Generate HubSpot OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<HubSpotOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/hubspot/authorization`
      );
      return data;
    } catch (error) {
      console.error('HubSpotService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete HubSpot OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<HubSpotConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/hubspot/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('HubSpotService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get HubSpot integration configuration
   */
  async getConfiguration(agentId: string): Promise<HubSpotConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/hubspot`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('HubSpotService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save HubSpot integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<HubSpotConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/hubspot`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('HubSpotService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect HubSpot integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/hubspot`
      );
      return data;
    } catch (error) {
      console.error('HubSpotService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from HubSpot
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/hubspot/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('HubSpotService.discoverTools error:', error);
      throw error;
    }
  },
};

export default HubSpotService;

