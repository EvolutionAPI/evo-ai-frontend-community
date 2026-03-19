import { useState, useEffect, useCallback } from 'react';
import { agentIntegrationsService } from '@/services/agents/agentIntegrationsService';

interface ElevenLabsConfig {
  provider?: string;
  connected?: boolean;
  respondInAudio?: 'when_client_asks' | 'always' | 'never';
  voice?: string;
  stability?: number;
  similarity?: number;
}

interface GoogleCalendarConfig {
  provider?: string;
  connected?: boolean;
  calendar_id?: string;
}

interface GoogleSheetsConfig {
  provider?: string;
  connected?: boolean;
  spreadsheet_id?: string;
}

interface UseIntegrationsReturn {
  // Configs
  elevenLabsConfig: ElevenLabsConfig | null;
  googleCalendarConfig: GoogleCalendarConfig | null;
  googleSheetsConfig: GoogleSheetsConfig | null;

  // Status
  credentialsConfigured: Record<string, boolean>;
  isCheckingIntegrations: boolean;

  // Actions
  reloadConfigs: () => Promise<void>;
  isConnected: (integrationId: string) => boolean;
}

/**
 * Sanitize integration config to remove sensitive fields.
 * Security: This is a defense-in-depth measure to prevent sensitive data
 * from being stored in frontend state, even if backend accidentally sends it.
 */
function sanitizeConfig(config: Record<string, unknown>): Record<string, unknown> {
  if (!config) return config;

  const sanitized = { ...config };

  // Remove sensitive fields
  const sensitiveFields = [
    'apiKey',
    'api_key',
    'access_token',
    'client_secret',
    'refresh_token',
    'token',
    'code_verifier',
    'pkce_verifiers',
  ];

  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });

  // Remove any token-like values (REST API keys: sk_, rk_, pk_)
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    if (typeof value === 'string' && value.match(/^(sk_|rk_|pk_)/)) {
      delete sanitized[key];
    }
  });

  return sanitized;
}

export function useIntegrations(agentId: string): UseIntegrationsReturn {
  const [elevenLabsConfig, setElevenLabsConfig] = useState<ElevenLabsConfig | null>(null);
  const [googleCalendarConfig, setGoogleCalendarConfig] = useState<GoogleCalendarConfig | null>(null);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig | null>(null);

  const [isCheckingIntegrations, setIsCheckingIntegrations] = useState(true);
  const [credentialsConfigured, setCredentialsConfigured] = useState<Record<string, boolean>>({
    elevenlabs: false,
    'google-calendar': false,
    'google-sheets': false,
  });

  const loadConfigs = useCallback(async () => {
    if (!agentId) return;

    setIsCheckingIntegrations(true);

    try {
      // Same endpoint as MCP integrations - returns configs and credentials_configured
      const {
        configs,
        credentials_configured,
      } = await agentIntegrationsService.getAgentIntegrations(agentId);

      // Normalize credentials_configured to use hyphen format (google-calendar instead of google_calendar)
      const normalizedCredentials: Record<string, boolean> = {};
      if (credentials_configured) {
        Object.entries(credentials_configured).forEach(([key, value]) => {
          // Convert underscore to hyphen (google_calendar -> google-calendar)
          const normalizedKey = key.replace(/_/g, '-');
          normalizedCredentials[normalizedKey] = value;
        });
      }
      setCredentialsConfigured(normalizedCredentials);

      // Sanitize configs before storing (defense-in-depth security measure)
      if (configs.elevenlabs) {
        setElevenLabsConfig(sanitizeConfig(configs.elevenlabs) as unknown as ElevenLabsConfig);
      }
      // Accept both hyphen and underscore formats (google-calendar or google_calendar)
      if (configs['google-calendar'] || configs['google_calendar']) {
        const googleCalendarData = configs['google-calendar'] || configs['google_calendar'];
        setGoogleCalendarConfig(sanitizeConfig(googleCalendarData) as unknown as GoogleCalendarConfig);
      }
      if (configs['google-sheets'] || configs['google_sheets']) {
        const googleSheetsData = configs['google-sheets'] || configs['google_sheets'];
        setGoogleSheetsConfig(sanitizeConfig(googleSheetsData) as unknown as GoogleSheetsConfig);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      setCredentialsConfigured({
        elevenlabs: false,
        'google-calendar': false,
        'google-sheets': false,
      });
    } finally {
      setIsCheckingIntegrations(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const isConnected = useCallback(
    (integrationId: string): boolean => {
      const configMap: Record<string, ElevenLabsConfig | GoogleCalendarConfig | GoogleSheetsConfig | null> = {
        elevenlabs: elevenLabsConfig,
        'google-calendar': googleCalendarConfig,
        'google-sheets': googleSheetsConfig,
      };

      const config = configMap[integrationId];
      return config?.connected === true;
    },
    [elevenLabsConfig, googleCalendarConfig, googleSheetsConfig]
  );

  return {
    elevenLabsConfig,
    googleCalendarConfig,
    googleSheetsConfig,
    credentialsConfigured,
    isCheckingIntegrations,
    reloadConfigs: loadConfigs,
    isConnected,
  };
}
