import api from '@/services/core/api';
import type {
  StripeConfig,
  StripeOAuthResponse,
  StripeConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const StripeService = {
  /**
   * Generate Stripe OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<StripeOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/stripe/authorization`
      );
      return data;
    } catch (error) {
      console.error('StripeService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Stripe OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<StripeConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/stripe/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('StripeService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Stripe integration configuration
   */
  async getConfiguration(agentId: string): Promise<StripeConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/stripe`
      );
      return data.config || null;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          return null;
        }
      }
      console.error('StripeService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Stripe integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<StripeConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/stripe`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('StripeService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Stripe integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/stripe`
      );
      return data;
    } catch (error) {
      console.error('StripeService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Stripe
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/stripe/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('StripeService.discoverTools error:', error);
      throw error;
    }
  },
};

export default StripeService;

