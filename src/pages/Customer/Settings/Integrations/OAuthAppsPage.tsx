import { useNavigate } from 'react-router-dom';
import { OAuthAppsList } from '@/components/integrations/providers/oauth';

export default function OAuthAppsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return <OAuthAppsList onBack={handleBack} />;
}