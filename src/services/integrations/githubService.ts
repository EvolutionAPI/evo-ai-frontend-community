import api from '@/services/core/api';
import type {
  GitHubConfig,
  GitHubOAuthResponse,
  GitHubConnectionResponse,
  DiscoverToolsResponse
} from '@/types/integrations';

const GitHubService = {
  /**
   * Generate GitHub OAuth authorization URL
   */
  async generateAuthorization(agentId: string): Promise<GitHubOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/github/authorization`
      );
      return data;
    } catch (error) {
      console.error('GitHubService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete GitHub OAuth flow
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<GitHubConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/github/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('GitHubService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get GitHub integration configuration
   */
  async getConfiguration(agentId: string): Promise<GitHubConfig | null> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/github`
      );
      return data.config || null;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as { response?: { status?: number } };
        if (httpError.response?.status === 404) {
          return null;
        }
      }
      console.error('GitHubService.getConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Save GitHub integration configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<GitHubConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/github`,
        { config }
      );
      return data;
    } catch (error) {
      console.error('GitHubService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect GitHub integration
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/github`
      );
      return data;
    } catch (error) {
      console.error('GitHubService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Discover available MCP tools from GitHub
   * Uses backend endpoint that handles access_token internally
   */
  async discoverTools(agentId: string): Promise<DiscoverToolsResponse> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/github/discover-tools`
      );
      return data;
    } catch (error) {
      console.error('GitHubService.discoverTools error:', error);
      throw error;
    }
  },
};

export default GitHubService;

