import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { SlackIntegration } from '@/components/integrations/providers/slack';
import { useIntegrations } from '@/hooks/integrations';
import { Integration } from '@/types/integrations';

export default function SlackIntegrationPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();
  const { loading, getIntegrationById } = useIntegrations();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('loading.title')}</p>
        </div>
      </div>
    );
  }

  const slackIntegration = getIntegrationById('slack');

  // Create a default Slack integration if not found
  const defaultSlackIntegration: Integration = {
    id: 'slack',
    name: t('providers.slack.name'),
    description: t('providers.slack.description'),
    logo: '/integrations/slack.png',
    enabled: false,
    action: '',
    settings: {}
  };

  const integration = slackIntegration || defaultSlackIntegration;

  return (
    <SlackIntegration
      integration={integration}
      onBack={handleBack}
    />
  );
}
