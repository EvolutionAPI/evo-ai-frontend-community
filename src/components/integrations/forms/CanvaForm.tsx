import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function CanvaForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="CANVA_OAUTH_REDIRECT_URI"
        label={t('integrations.canva.redirectUri')}
        value={getValue('canvaRedirectUri')}
        onChange={(value) => onConfigChange('canvaRedirectUri', value)}
        placeholder={t('integrations.canva.placeholders.redirectUri')}
        type="url"
        description={t('integrations.canva.redirectUriDescription')}
      />
    </div>
  );
}
