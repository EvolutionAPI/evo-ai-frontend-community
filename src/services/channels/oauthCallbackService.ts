import api from '@/services/core/api';

interface OAuthCallbackPayload {
  code: string;
  state: string;
}

interface OAuthCallbackResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * OAuth Callback Service
 * Handles OAuth callback API calls for social media integrations
 */
class OAuthCallbackService {
  /**
   * Handle Google OAuth callback
   * @param code - Authorization code from Google
   * @param state - JWT state token
   * @returns OAuth callback response
   */
  async handleGoogleCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResponse> {
    const response = await api.post<OAuthCallbackResponse>(
      `/google/callback`,
      {
        code,
        state,
      },
    );

    return response.data;
  }

  /**
   * Handle Instagram OAuth callback
   * @param code - Authorization code from Instagram
   * @param state - JWT state token
   * @returns OAuth callback response
   */
  async handleInstagramCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResponse> {
    const response = await api.post<OAuthCallbackResponse>(
      `/instagram/callback`,
      {
        code,
        state,
      },
    );

    return response.data;
  }

  /**
   * Handle Microsoft OAuth callback
   * @param code - Authorization code from Microsoft
   * @param state - JWT state token
   * @returns OAuth callback response
   */
  async handleMicrosoftCallback(
    code: string,
    state: string,
  ): Promise<OAuthCallbackResponse> {
    const response = await api.post<OAuthCallbackResponse>(
      `/microsoft/callback`,
      {
        code,
        state,
      },
    );

    return response.data;
  }
}

export default new OAuthCallbackService();
export type { OAuthCallbackPayload, OAuthCallbackResponse };
