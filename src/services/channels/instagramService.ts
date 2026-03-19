import api from '@/services/core/api';
import type { InstagramAuthorizationResponse } from '@/types/channels/inbox';

class InstagramService {
  /**
   * Generates Instagram OAuth authorization URL
   */
  async generateAuthorization(): Promise<InstagramAuthorizationResponse> {
    const { data } = await api.post<InstagramAuthorizationResponse>(`/instagram/authorization`);
    return data;
  }

  /**
   * Gets the Instagram OAuth callback URL for reference
   */
  getCallbackUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/instagram/callback`;
  }

  /**
   * Gets Instagram App configuration from global config
   */
  getInstagramConfig() {
    return {
      appId: (window as any).__GLOBAL_CONFIG__?.instagramAppId || '',
    };
  }

  /**
   * Validates if Instagram is properly configured
   */
  isConfigured(): boolean {
    const config = this.getInstagramConfig();
    return !!config.appId;
  }
}

export const instagramService = new InstagramService();
export default instagramService;
