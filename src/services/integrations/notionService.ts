import api from '@/services/core/api';
import type {
  NotionConfig,
  NotionOAuthResponse,
  NotionConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const NotionService = {
  /**
   * Generate Notion OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<NotionOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/notion/authorization`
      );
      return data;
    } catch (error) {
      console.error('NotionService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Notion OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<NotionConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/notion/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('NotionService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Notion integration configuration
   */
  async getConfiguration(agentId: string): Promise<NotionConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/notion`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('NotionService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Notion integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<NotionConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/notion`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('NotionService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Notion integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/notion`
      );
      return data;
    } catch (error) {
      console.error('NotionService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Notion
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/notion/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('NotionService.discoverTools error:', error);
      throw error;
    }
  },
};

export default NotionService;

