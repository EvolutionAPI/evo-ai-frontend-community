import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import GenericIntegrationSettings from '@/components/integrations/providers/GenericIntegrationSettings';
import LeadSquaredModal from '@/components/integrations/providers/leadsquared/LeadSquaredModal';

export default function LeadSquaredPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return (
    <GenericIntegrationSettings
      appId="leadsquared"
      displayName={t('providers.leadsquared.name')}
      description={t('providers.leadsquared.description')}
      icon={Building2}
      configComponent={LeadSquaredModal}
      onBack={handleBack}
    />
  );
}