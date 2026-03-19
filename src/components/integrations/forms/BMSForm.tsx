import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function BMSForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="BMS_API_KEY"
        label={t('integrations.bms.apiKey')}
        value={getValue('bmsApiKey')}
        onChange={(value) => onConfigChange('bmsApiKey', value)}
        placeholder={t('integrations.bms.placeholders.apiKey')}
        type="password"
      />
      <FormField
        id="BMS_IPPOOL"
        label={t('integrations.bms.ipPool')}
        value={getValue('bmsIpPool', 'evoapicloud')}
        onChange={(value) => onConfigChange('bmsIpPool', value)}
        placeholder={t('integrations.bms.placeholders.ipPool')}
        description={t('integrations.bms.ipPoolDescription')}
      />
      <FormField
        id="MAILER_SENDER_EMAIL"
        label={t('integrations.bms.senderEmail')}
        value={getValue('mailerSenderEmail')}
        onChange={(value) => onConfigChange('mailerSenderEmail', value)}
        placeholder={t('integrations.bms.placeholders.senderEmail')}
        type="email"
        description={t('integrations.bms.senderEmailDescription')}
      />
    </div>
  );
}

