import React from 'react';
import { Button, Card, CardContent } from '@evoapi/design-system';
import { ArrowLeft } from 'lucide-react';
import ProviderGrid, { Provider } from './ProviderGrid';
import { useLanguage } from '@/hooks/useLanguage';

interface ChannelProviderPageProps {
  title: string;
  description: string;
  channelType: 'web_widget' | 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'sms' | 'email' | 'api';
  providers: Provider[];
  selectedProvider?: string | null;
  isDisabled?: (providerId: string) => boolean;
  onProviderSelect: (provider: Provider) => void;
  onBack: () => void;
  children?: React.ReactNode; // For custom content after provider selection
  className?: string;
}

const ChannelProviderPage: React.FC<ChannelProviderPageProps> = ({
  title,
  description,
  channelType,
  providers,
  selectedProvider,
  isDisabled,
  onProviderSelect,
  onBack,
  children,
  className = '',
}) => {
  const { t } = useLanguage('channels');

  return (
    <div className={`mx-auto w-full max-w-4xl px-4 md:px-6 py-6 ${className}`}>
      {/* Breadcrumb/Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
          <span className="cursor-pointer hover:text-sidebar-foreground" onClick={onBack}>
            {t('navigation.channels')}
          </span>
          <span>/</span>
          <span className="text-sidebar-foreground">{t('navigation.createChannel')}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground mb-2">
          {title}
        </h1>
        <p className="text-sidebar-foreground/70">
          {description}
        </p>
      </div>

      {/* Provider Selection or Custom Content */}
      {!selectedProvider ? (
        <Card className="border-sidebar-border bg-sidebar rounded-lg">
          <CardContent className="p-5 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">
                {t('provider.chooseProvider')}
              </h2>
              <p className="text-sm text-sidebar-foreground/70">
                {t('provider.selectProviderDescription')}
              </p>
            </div>

            <ProviderGrid
              channelType={channelType}
              providers={providers}
              isDisabled={isDisabled}
              onSelect={onProviderSelect}
            />
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </div>
  );
};

export default ChannelProviderPage;
