import api from '@/services/core/api';
import type {
  PayPalConfig,
  PayPalOAuthResponse,
  PayPalConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const PayPalService = {
  /**
   * Generate PayPal OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<PayPalOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/paypal/authorization`
      );
      return data;
    } catch (error) {
      console.error('PayPalService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete PayPal OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<PayPalConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/paypal/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('PayPalService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get PayPal integration configuration
   */
  async getConfiguration(agentId: string): Promise<PayPalConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/paypal`
      );
      return data.config || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('PayPalService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save PayPal integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<PayPalConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/paypal`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('PayPalService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect PayPal integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/paypal`
      );
      return data;
    } catch (error) {
      console.error('PayPalService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from PayPal
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/paypal/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('PayPalService.discoverTools error:', error);
      throw error;
    }
  },
};

export default PayPalService;
