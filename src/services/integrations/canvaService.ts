import api from '@/services/core/api';
import type {
  CanvaConfig,
  CanvaOAuthResponse,
  CanvaConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const CanvaService = {
  /**
   * Generate Canva OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<CanvaOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/canva/authorization`
      );
      return data;
    } catch (error) {
      console.error('CanvaService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Canva OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<CanvaConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/canva/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('CanvaService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Canva integration configuration
   */
  async getConfiguration(agentId: string): Promise<CanvaConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/canva`
      );
      return data.config || null;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          return null;
        }
      }
      console.error('CanvaService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Canva integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<CanvaConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/canva`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('CanvaService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Canva integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/canva`
      );
      return data;
    } catch (error) {
      console.error('CanvaService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Canva
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/canva/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('CanvaService.discoverTools error:', error);
      throw error;
    }
  },
};

export default CanvaService;
