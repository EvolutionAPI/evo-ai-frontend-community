import { useLanguage } from '@/hooks/useLanguage';
import { FormField, FormSelect } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function PayPalForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormSelect
        id="PAYPAL_ENVIRONMENT"
        label={t('integrations.paypal.environment')}
        value={getValue('paypalEnvironment', 'production')}
        onChange={value => onConfigChange('paypalEnvironment', value)}
        options={[
          { value: 'production', label: t('integrations.paypal.environments.production') },
          { value: 'sandbox', label: t('integrations.paypal.environments.sandbox') },
        ]}
        description={t('integrations.paypal.environmentDescription')}
      />
      <FormField
        id="PAYPAL_OAUTH_CLIENT_ID"
        label={t('integrations.paypal.clientId')}
        value={getValue('paypalClientId')}
        onChange={value => onConfigChange('paypalClientId', value)}
        placeholder={t('integrations.paypal.placeholders.clientId')}
        description={t('integrations.paypal.clientIdDescription')}
      />
      <FormField
        id="PAYPAL_OAUTH_CLIENT_SECRET"
        label={t('integrations.paypal.clientSecret')}
        value={getValue('paypalClientSecret')}
        onChange={value => onConfigChange('paypalClientSecret', value)}
        placeholder={t('integrations.paypal.placeholders.clientSecret')}
        type="password"
        description={t('integrations.paypal.clientSecretDescription')}
      />
      <FormField
        id="PAYPAL_OAUTH_REDIRECT_URI"
        label={t('integrations.paypal.redirectUri')}
        value={getValue('paypalRedirectUri')}
        onChange={value => onConfigChange('paypalRedirectUri', value)}
        placeholder={t('integrations.paypal.placeholders.redirectUri')}
        type="url"
        description={t('integrations.paypal.redirectUriDescription')}
      />
    </div>
  );
}
