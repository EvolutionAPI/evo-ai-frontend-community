import api from '@/services/core/api';
import type {
  GoogleSheetsConfig,
  GoogleSheetsItem,
  GoogleSheetsOAuthResponse,
  GoogleSheetsConnectionResponse,
} from '@/types/integrations/googleSheets';

const GoogleSheetsService = {
  /**
   * Generate Google Sheets OAuth authorization URL
   */
  async generateAuthorization(agentId: string, email?: string): Promise<GoogleSheetsOAuthResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/google-sheets/authorization`,
        { email }
      );
      return data;
    } catch (error) {
      console.error('GoogleSheetsService.generateAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Google Sheets OAuth flow and get spreadsheets
   */
  async completeAuthorization(
    agentId: string,
    code: string,
    state: string
  ): Promise<GoogleSheetsConnectionResponse> {
    try {
      const { data } = await api.post(
        `/agents/${agentId}/integrations/google-sheets/callback`,
        {
          code,
          state,
        }
      );
      return data;
    } catch (error) {
      console.error('GoogleSheetsService.completeAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Get list of available spreadsheets
   */
  async getSpreadsheets(agentId: string): Promise<GoogleSheetsItem[]> {
    try {
      const { data } = await api.get(
        `/agents/${agentId}/integrations/google-sheets/spreadsheets`
      );
      return data.spreadsheets || [];
    } catch (error) {
      console.error('GoogleSheetsService.getSpreadsheets error:', error);
      throw error;
    }
  },

  /**
   * Save Google Sheets configuration
   */
  async saveConfiguration(
    agentId: string,
    config: Partial<GoogleSheetsConfig>
  ): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put(
        `/agents/${agentId}/integrations/google-sheets`,
        config
      );
      return data;
    } catch (error) {
      console.error('GoogleSheetsService.saveConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Google Sheets
   */
  async disconnect(agentId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.delete(
        `/agents/${agentId}/integrations/google-sheets`
      );
      return data;
    } catch (error) {
      console.error('GoogleSheetsService.disconnect error:', error);
      throw error;
    }
  },

  /**
   * Get OAuth callback URL for the current domain
   */
  getOAuthCallbackUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/oauth/google-sheets/callback`;
  },
};

export default GoogleSheetsService;
