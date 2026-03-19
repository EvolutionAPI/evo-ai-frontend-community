import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function StripeForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="STRIPE_OAUTH_CLIENT_ID"
        label={t('integrations.stripe.clientId')}
        value={getValue('stripeClientId')}
        onChange={(value) => onConfigChange('stripeClientId', value)}
        placeholder={t('integrations.stripe.placeholders.clientId')}
        description={t('integrations.stripe.clientIdDescription')}
      />
      <FormField
        id="STRIPE_OAUTH_CLIENT_SECRET"
        label={t('integrations.stripe.clientSecret')}
        value={getValue('stripeClientSecret')}
        onChange={(value) => onConfigChange('stripeClientSecret', value)}
        placeholder={t('integrations.stripe.placeholders.clientSecret')}
        type="password"
        description={t('integrations.stripe.clientSecretDescription')}
      />
      <FormField
        id="STRIPE_OAUTH_REDIRECT_URI"
        label={t('integrations.stripe.redirectUri')}
        value={getValue('stripeRedirectUri')}
        onChange={(value) => onConfigChange('stripeRedirectUri', value)}
        placeholder={t('integrations.stripe.placeholders.redirectUri')}
        type="url"
        description={t('integrations.stripe.redirectUriDescription')}
      />
      <FormField
        id="STRIPE_OAUTH_AUTHORIZATION_URL"
        label={t('integrations.stripe.authorizationUrl')}
        value={getValue('stripeAuthorizationUrl')}
        onChange={(value) => onConfigChange('stripeAuthorizationUrl', value)}
        placeholder={t('integrations.stripe.placeholders.authorizationUrl')}
        type="url"
        description={t('integrations.stripe.authorizationUrlDescription')}
      />
    </div>
  );
}

