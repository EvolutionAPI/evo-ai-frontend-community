import { useNavigate } from 'react-router-dom';
import { WebhooksList } from '@/components/integrations/providers/webhooks';

export default function WebhooksPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return <WebhooksList onBack={handleBack} />;
}