import React from 'react';
import { Card, CardContent } from '@evoapi/design-system';
import { ArrowLeft } from 'lucide-react';
import { ChannelIcon } from '@/components/channels';
import { useLanguage } from '@/hooks/useLanguage';

export interface Provider {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
  popular?: boolean;
}

interface ProviderGridProps {
  channelType:
    | 'web_widget'
    | 'whatsapp'
    | 'facebook'
    | 'instagram'
    | 'telegram'
    | 'sms'
    | 'email'
    | 'api';
  providers: Provider[];
  isDisabled?: (providerId: string) => boolean;
  onSelect: (provider: Provider) => void;
}

const ProviderGrid: React.FC<ProviderGridProps> = ({
  channelType,
  providers,
  isDisabled,
  onSelect,
}) => {
  const { t } = useLanguage('channels');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map(provider => {
        const disabled = isDisabled ? isDisabled(provider.id) : false;
        return (
          <Card
            key={provider.id}
            className={`h-full transition-all duration-200 border-sidebar-border rounded-lg relative ${
              disabled
                ? 'opacity-60 cursor-not-allowed bg-sidebar'
                : 'cursor-pointer bg-sidebar hover:bg-sidebar-accent/50 hover:border-sidebar-border hover:shadow-md'
            }`}
            onClick={() => !disabled && onSelect(provider)}
          >
            {provider.recommended && (
              <div className="absolute -top-2 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {t('newChannel.providers.badges.recommended')}
              </div>
            )}

            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ChannelIcon channelType={channelType} provider={provider.id} size="lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-sidebar-foreground mb-1">
                    {provider.name}
                  </h4>
                  <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
                    {provider.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <ArrowLeft className="w-5 h-5 text-sidebar-foreground/60 rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProviderGrid;
