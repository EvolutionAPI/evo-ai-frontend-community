import { useLanguage } from '@/hooks/useLanguage';
import { FormField, FormSwitch } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function InstagramForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  const getBoolean = (key: string, defaultValue = false) => {
    const value = config[key];
    return typeof value === 'boolean' ? value : defaultValue;
  };

  // Generate redirect URI dynamically based on current origin
  const redirectUri = `${window.location.origin}/instagram/callback`;

  return (
    <div className="space-y-4">
      <FormField
        id="INSTAGRAM_APP_ID"
        label={t('integrations.instagram.appId')}
        value={getValue('igAppId')}
        onChange={(value) => onConfigChange('igAppId', value)}
        placeholder={t('integrations.instagram.placeholders.appId')}
      />
      <FormField
        id="INSTAGRAM_APP_SECRET"
        label={t('integrations.instagram.appSecret')}
        value={getValue('igAppSecret')}
        onChange={(value) => onConfigChange('igAppSecret', value)}
        placeholder={t('integrations.instagram.placeholders.appSecret')}
        type="password"
      />
      <FormField
        id="INSTAGRAM_VERIFY_TOKEN"
        label={t('integrations.instagram.verifyToken')}
        value={getValue('igVerifyToken')}
        onChange={(value) => onConfigChange('igVerifyToken', value)}
        placeholder={t('integrations.instagram.placeholders.verifyToken')}
        type="password"
      />
      <FormField
        id="INSTAGRAM_API_VERSION"
        label={t('integrations.instagram.apiVersion')}
        value={getValue('igApiVersion', 'v23.0')}
        onChange={(value) => onConfigChange('igApiVersion', value)}
        placeholder={t('integrations.instagram.placeholders.apiVersion')}
      />
      <FormField
        id="INSTAGRAM_REDIRECT_URI"
        label={t('integrations.instagram.redirectUri')}
        value={redirectUri}
        onChange={() => {}}
        placeholder={redirectUri}
        type="url"
        readOnly={true}
        description={t('integrations.instagram.redirectUriDescription')}
      />
      <FormSwitch
        id="ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT"
        label={t('integrations.instagram.enableHumanAgent')}
        checked={getBoolean('igEnableHumanAgent', false)}
        onCheckedChange={(checked) => onConfigChange('igEnableHumanAgent', checked)}
        description={t('integrations.instagram.enableHumanAgentDescription')}
      />
    </div>
  );
}

