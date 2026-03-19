import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import OAuthIntegrationSettings from '@/components/integrations/providers/OAuthIntegrationSettings';

export default function LinearPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return (
    <OAuthIntegrationSettings
      integrationId="linear"
      displayName={t('providers.linear.name')}
      description={t('providers.linear.description')}
      icon={GitBranch}
      onBack={handleBack}
    />
  );
}