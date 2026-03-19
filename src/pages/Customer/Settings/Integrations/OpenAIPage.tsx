import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import GenericIntegrationSettings from '@/components/integrations/providers/GenericIntegrationSettings';
import OpenAIModal from '@/components/integrations/providers/openai/OpenAIModal';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';
import { toast } from 'sonner';

export default function OpenAIPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();
  const { openaiConfigured } = useGlobalConfig();

  useEffect(() => {
    if (openaiConfigured) {
      toast.info(t('providers.openai.globallyConfigured'));
      navigate('/settings/integrations', { replace: true });
    }
  }, [openaiConfigured, navigate, t]);

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  if (openaiConfigured) {
    return null;
  }

  return (
    <GenericIntegrationSettings
      appId="openai"
      displayName={t('providers.openai.name')}
      description={t('providers.openai.description')}
      icon={Brain}
      configComponent={OpenAIModal}
      onBack={handleBack}
    />
  );
}