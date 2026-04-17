import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function WhatsAppForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="WP_APP_ID"
        label={t('integrations.whatsapp.appId')}
        value={getValue('wpAppId')}
        onChange={(value) => onConfigChange('wpAppId', value)}
        placeholder={t('integrations.whatsapp.placeholders.appId')}
        required
      />
      <FormField
        id="WP_APP_SECRET"
        label={t('integrations.whatsapp.appSecret')}
        value={getValue('wpAppSecret')}
        onChange={(value) => onConfigChange('wpAppSecret', value)}
        placeholder={t('integrations.whatsapp.placeholders.appSecret')}
        type="password"
      />
      <FormField
        id="WP_WHATSAPP_CONFIG_ID"
        label={t('integrations.whatsapp.configId')}
        value={getValue('wpWhatsappConfigId')}
        onChange={(value) => onConfigChange('wpWhatsappConfigId', value)}
        placeholder={t('integrations.whatsapp.placeholders.configId')}
        required
      />
      <FormField
        id="WP_VERIFY_TOKEN"
        label={t('integrations.whatsapp.verifyToken')}
        value={getValue('wpVerifyToken')}
        onChange={(value) => onConfigChange('wpVerifyToken', value)}
        placeholder={t('integrations.whatsapp.placeholders.verifyToken')}
        type="password"
      />
      <FormField
        id="WP_API_VERSION"
        label={t('integrations.whatsapp.apiVersion')}
        value={getValue('wpApiVersion', 'v23.0')}
        onChange={(value) => onConfigChange('wpApiVersion', value)}
        placeholder={t('integrations.whatsapp.placeholders.apiVersion')}
      />
    </div>
  );
}

