import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function HubSpotForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="HUBSPOT_OAUTH_CLIENT_ID"
        label={t('integrations.hubspot.clientId')}
        value={getValue('hubspotClientId')}
        onChange={(value) => onConfigChange('hubspotClientId', value)}
        placeholder={t('integrations.hubspot.placeholders.clientId')}
        description={t('integrations.hubspot.clientIdDescription')}
      />
      <FormField
        id="HUBSPOT_OAUTH_CLIENT_SECRET"
        label={t('integrations.hubspot.clientSecret')}
        value={getValue('hubspotClientSecret')}
        onChange={(value) => onConfigChange('hubspotClientSecret', value)}
        placeholder={t('integrations.hubspot.placeholders.clientSecret')}
        type="password"
        description={t('integrations.hubspot.clientSecretDescription')}
      />
      <FormField
        id="HUBSPOT_OAUTH_REDIRECT_URI"
        label={t('integrations.hubspot.redirectUri')}
        value={getValue('hubspotRedirectUri')}
        onChange={(value) => onConfigChange('hubspotRedirectUri', value)}
        placeholder={t('integrations.hubspot.placeholders.redirectUri')}
        type="url"
        description={t('integrations.hubspot.redirectUriDescription')}
      />
      <FormField
        id="HUBSPOT_MCP_REDIRECT_URI"
        label={t('integrations.hubspot.mcpRedirectUri')}
        value={getValue('hubspotMcpRedirectUri')}
        onChange={(value) => onConfigChange('hubspotMcpRedirectUri', value)}
        placeholder={t('integrations.hubspot.placeholders.mcpRedirectUri')}
        type="url"
        description={t('integrations.hubspot.mcpRedirectUriDescription')}
      />
    </div>
  );
}
