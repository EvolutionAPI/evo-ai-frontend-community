import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import OAuthIntegrationSettings from '@/components/integrations/providers/OAuthIntegrationSettings';

export default function HubSpotPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return (
    <OAuthIntegrationSettings
      integrationId="hubspot"
      displayName={t('providers.hubspot.name')}
      description={t('providers.hubspot.description')}
      icon={Package}
      onBack={handleBack}
    />
  );
}