import api from '@/services/core/api';
import type { EmailOAuthConfig, EmailChannel, EmailChannelPayload } from '@/types/channels/inbox';

const EmailOauthService = {
  /**
   * Generate Google OAuth authorization URL (like Vue)
   */
  async generateGoogleAuthorization(email: string): Promise<{ url: string }> {
    try {
      const { data } = await api.post(`/google/authorization`, { email });
      return data;
    } catch (error) {
      console.error('EmailOauthService.generateGoogleAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Google OAuth flow
   */
  async completeGoogleAuth(config: EmailOAuthConfig): Promise<EmailChannel> {
    try {
      const { data } = await api.post(`/google/callback`, {
        code: config.code,
        state: config.state,
      });
      return data;
    } catch (error) {
      console.error('EmailOauthService.completeGoogleAuth error:', error);
      throw error;
    }
  },

  /**
   * Generate Microsoft OAuth authorization URL (like Vue)
   */
  async generateMicrosoftAuthorization(email: string): Promise<{ url: string }> {
    try {
      const { data } = await api.post(`/microsoft/authorization`, { email });
      return data;
    } catch (error) {
      console.error('EmailOauthService.generateMicrosoftAuthorization error:', error);
      throw error;
    }
  },

  /**
   * Complete Microsoft OAuth flow
   */
  async completeMicrosoftAuth(config: EmailOAuthConfig): Promise<EmailChannel> {
    try {
      const { data } = await api.post(`/microsoft/callback`, {
        code: config.code,
        state: config.state,
      });
      return data;
    } catch (error) {
      console.error('EmailOauthService.completeMicrosoftAuth error:', error);
      throw error;
    }
  },

  /**
   * Create manual email channel (IMAP/SMTP)
   */
  async createEmailChannel(payload: EmailChannelPayload): Promise<EmailChannel> {
    try {
      const { data } = await api.post(`/inboxes`, payload);
      return data;
    } catch (error) {
      console.error('EmailOauthService.createEmailChannel error:', error);
      throw error;
    }
  },

  /**
   * Validate email configuration
   */
  async validateEmailConfig(config: {
    imap_address: string;
    imap_port: number;
    imap_login: string;
    imap_password: string;
    imap_enable_ssl: boolean;
    smtp_address?: string;
    smtp_port?: number;
    smtp_login?: string;
    smtp_password?: string;
  }): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data } = await api.post(`/email/validate`, config);
      return data;
    } catch (error) {
      console.error('EmailOauthService.validateEmailConfig error:', error);
      return { valid: false, error: (error as Error).message };
    }
  },

  /**
   * Get OAuth callback URL for the current domain
   */
  getOAuthCallbackUrl(provider: 'google' | 'microsoft'): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/oauth/${provider}/callback`;
  },

  /**
   * Parse OAuth callback parameters from URL
   */
  parseOAuthCallback(url: string): EmailOAuthConfig {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    return {
      provider: urlObj.pathname.includes('google') ? 'google' : 'microsoft',
      code: params.get('code') || undefined,
      state: params.get('state') || undefined,
      error: params.get('error') || undefined,
    };
  },
};

export default EmailOauthService;
