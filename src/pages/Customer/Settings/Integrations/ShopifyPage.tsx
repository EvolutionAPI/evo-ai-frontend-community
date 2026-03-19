import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import OAuthIntegrationSettings from '@/components/integrations/providers/OAuthIntegrationSettings';

export default function ShopifyPage() {
  const { t } = useLanguage('integrations');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings/integrations');
  };

  return (
    <OAuthIntegrationSettings
      integrationId="shopify"
      displayName={t('providers.shopify.name')}
      description={t('providers.shopify.description')}
      icon={ShoppingBag}
      onBack={handleBack}
    />
  );
}