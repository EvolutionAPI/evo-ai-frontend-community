import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function GitHubForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="GITHUB_OAUTH_CLIENT_ID"
        label={t('integrations.github.clientId')}
        value={getValue('githubClientId')}
        onChange={(value) => onConfigChange('githubClientId', value)}
        placeholder={t('integrations.github.placeholders.clientId')}
        description={t('integrations.github.clientIdDescription')}
      />
      <FormField
        id="GITHUB_OAUTH_CLIENT_SECRET"
        label={t('integrations.github.clientSecret')}
        value={getValue('githubClientSecret')}
        onChange={(value) => onConfigChange('githubClientSecret', value)}
        placeholder={t('integrations.github.placeholders.clientSecret')}
        type="password"
        description={t('integrations.github.clientSecretDescription')}
      />
      <FormField
        id="GITHUB_OAUTH_REDIRECT_URI"
        label={t('integrations.github.redirectUri')}
        value={getValue('githubRedirectUri')}
        onChange={(value) => onConfigChange('githubRedirectUri', value)}
        placeholder={t('integrations.github.placeholders.redirectUri')}
        type="url"
        description={t('integrations.github.redirectUriDescription')}
      />
    </div>
  );
}

