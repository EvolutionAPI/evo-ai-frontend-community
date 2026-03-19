import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function GoogleOAuthForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="GOOGLE_OAUTH_CLIENT_ID"
        label={t('integrations.googleOAuth.clientId') || 'Google Client ID'}
        value={getValue('googleOauthClientId')}
        onChange={(value) => onConfigChange('googleOauthClientId', value)}
        placeholder="xxx.apps.googleusercontent.com"
      />
      <FormField
        id="GOOGLE_OAUTH_CLIENT_SECRET"
        label={t('integrations.googleOAuth.clientSecret') || 'Google Client Secret'}
        value={getValue('googleOauthClientSecret')}
        onChange={(value) => onConfigChange('googleOauthClientSecret', value)}
        placeholder="GOCSPX-xxx"
        type="password"
      />
      <FormField
        id="GOOGLE_OAUTH_CALLBACK_URL"
        label={t('integrations.googleOAuth.callbackUrl') || 'Callback URL'}
        value={getValue('googleOauthCallbackUrl')}
        onChange={(value) => onConfigChange('googleOauthCallbackUrl', value)}
        placeholder="https://your-domain.com/auth/google/callback"
        type="url"
        description={t('integrations.googleOAuth.callbackUrlDescription') || 'Callback URL configured in Google Cloud Console'}
      />
      <FormField
        id="GCP_PROJECT_ID"
        label={t('integrations.googleOAuth.gcpProjectId') || 'GCP Project ID'}
        value={getValue('gcpProjectId')}
        onChange={(value) => onConfigChange('gcpProjectId', value)}
        placeholder="your-project-id"
        description={t('integrations.googleOAuth.gcpProjectIdDescription') || 'Google Cloud Platform Project ID for Gmail Pub/Sub integration'}
      />
      <FormField
        id="GMAIL_PUBSUB_TOPIC"
        label={t('integrations.googleOAuth.gmailPubsubTopic') || 'Gmail Pub/Sub Topic'}
        value={getValue('gmailPubsubTopic')}
        onChange={(value) => onConfigChange('gmailPubsubTopic', value)}
        placeholder="gmail-topic"
        description={t('integrations.googleOAuth.gmailPubsubTopicDescription') || 'Gmail Pub/Sub topic name for receiving email notifications'}
      />
    </div>
  );
}

