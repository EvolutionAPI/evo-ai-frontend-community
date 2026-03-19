import { useNavigate } from 'react-router-dom';
import DashboardAppsList from '@/components/integrations/providers/dashboard/DashboardAppsList';

export default function DashboardAppsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return <DashboardAppsList onBack={handleBack} />;
}