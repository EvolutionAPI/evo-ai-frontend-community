import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function FacebookForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="FB_APP_ID"
        label={t('integrations.facebook.appId')}
        value={getValue('fbAppId')}
        onChange={(value) => onConfigChange('fbAppId', value)}
        placeholder={t('integrations.facebook.placeholders.appId')}
      />
      <FormField
        id="FB_APP_SECRET"
        label={t('integrations.facebook.appSecret')}
        value={getValue('fbAppSecret')}
        onChange={(value) => onConfigChange('fbAppSecret', value)}
        placeholder={t('integrations.facebook.placeholders.appSecret')}
        type="password"
      />
      <FormField
        id="FB_VERIFY_TOKEN"
        label={t('integrations.facebook.verifyToken')}
        value={getValue('fbVerifyToken')}
        onChange={(value) => onConfigChange('fbVerifyToken', value)}
        placeholder={t('integrations.facebook.placeholders.verifyToken')}
        type="password"
      />
      <FormField
        id="FACEBOOK_API_VERSION"
        label={t('integrations.facebook.apiVersion')}
        value={getValue('fbApiVersion', 'v23.0')}
        onChange={(value) => onConfigChange('fbApiVersion', value)}
        placeholder={t('integrations.facebook.placeholders.apiVersion')}
      />
    </div>
  );
}

