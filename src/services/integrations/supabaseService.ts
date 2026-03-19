import api from '@/services/core/api';
import type {
  SupabaseConfig,
  SupabaseOAuthResponse,
  SupabaseConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const SupabaseService = {
  /**
   * Generate Supabase OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<SupabaseOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/supabase/authorization`
      );
      return data;
    } catch (error) {
      console.error('SupabaseService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Supabase OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<SupabaseConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/supabase/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('SupabaseService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get Supabase integration configuration
   */
  async getConfiguration(agentId: string): Promise<SupabaseConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/supabase`
      );
      return data.config || null;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          return null;
        }
      }
      console.error('SupabaseService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save Supabase integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<SupabaseConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/supabase`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('SupabaseService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Supabase integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/supabase`
      );
      return data;
    } catch (error) {
      console.error('SupabaseService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from Supabase
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/supabase/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('SupabaseService.discoverTools error:', error);
      throw error;
    }
  },
};

export default SupabaseService;
