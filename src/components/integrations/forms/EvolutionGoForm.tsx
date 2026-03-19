import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function EvolutionGoForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="EVOLUTION_GO_API_URL"
        label={t('integrations.evolutionGo.apiUrl')}
        value={getValue('evolutionGoApiUrl')}
        onChange={(value) => onConfigChange('evolutionGoApiUrl', value)}
        placeholder={t('integrations.evolutionGo.placeholders.apiUrl')}
        type="url"
      />
      <FormField
        id="EVOLUTION_GO_ADMIN_TOKEN"
        label={t('integrations.evolutionGo.adminToken')}
        value={getValue('evolutionGoAdminToken')}
        onChange={(value) => onConfigChange('evolutionGoAdminToken', value)}
        placeholder={t('integrations.evolutionGo.placeholders.adminToken')}
        type="password"
      />
      <FormField
        id="EVOLUTION_GO_INSTANCE_ID"
        label={t('integrations.evolutionGo.instanceId')}
        value={getValue('evolutionGoInstanceId')}
        onChange={(value) => onConfigChange('evolutionGoInstanceId', value)}
        placeholder={t('integrations.evolutionGo.placeholders.instanceId')}
      />
      <FormField
        id="EVOLUTION_GO_INSTANCE_TOKEN"
        label={t('integrations.evolutionGo.instanceToken')}
        value={getValue('evolutionGoInstanceToken')}
        onChange={(value) => onConfigChange('evolutionGoInstanceToken', value)}
        placeholder={t('integrations.evolutionGo.placeholders.instanceToken')}
        type="password"
      />
    </div>
  );
}

