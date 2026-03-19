import api from '@/services/core/api';
import type {
  AtlassianConfig,
  AtlassianOAuthResponse,
  AtlassianConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const AtlassianService = {
  /**
   * Generate Atlassian OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<AtlassianOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/atlassian/authorization`
      );
      return data;
    } catch (error) {
      console.error('AtlassianService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Atlassian OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<AtlassianConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/atlassian/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('AtlassianService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Atlassian integration configuration
   */
  async getConfiguration(agentId: string): Promise<AtlassianConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/atlassian`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('AtlassianService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Atlassian integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<AtlassianConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/atlassian`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('AtlassianService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Atlassian integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/atlassian`
      );
      return data;
    } catch (error) {
      console.error('AtlassianService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Atlassian
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/atlassian/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('AtlassianService.discoverTools error:', error);
      throw error;
    }
  },
};

export default AtlassianService;

