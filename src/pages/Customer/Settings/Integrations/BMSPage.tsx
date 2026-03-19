import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import GenericIntegrationSettings from '@/components/integrations/providers/GenericIntegrationSettings';
import BMSModal from '@/components/integrations/providers/bms/BMSModal';

export default function BMSPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return (
    <GenericIntegrationSettings
      appId="bms"
      displayName={t('providers.bms.name')}
      description={t('providers.bms.description')}
      icon={MessageSquare}
      configComponent={BMSModal}
      onBack={handleBack}
    />
  );
}
