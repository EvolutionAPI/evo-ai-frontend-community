import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function SlackForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="SLACK_CLIENT_ID"
        label={t('integrations.slack.clientId')}
        value={getValue('slackClientId')}
        onChange={(value) => onConfigChange('slackClientId', value)}
        placeholder={t('integrations.slack.placeholders.clientId')}
      />
      <FormField
        id="SLACK_CLIENT_SECRET"
        label={t('integrations.slack.clientSecret')}
        value={getValue('slackClientSecret')}
        onChange={(value) => onConfigChange('slackClientSecret', value)}
        placeholder={t('integrations.slack.placeholders.clientSecret')}
        type="password"
      />
    </div>
  );
}

