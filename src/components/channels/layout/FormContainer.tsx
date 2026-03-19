import { ReactNode } from 'react';
import { ChannelIcon } from '@/components/channels';
import { ChannelType } from '@/hooks/channels/useChannelForm';
import { Provider as ProviderType } from '@/components/channels/ProviderGrid';

interface FormContainerProps {
  selectedChannel: ChannelType;
  selectedProvider?: ProviderType | null;
  children: ReactNode;
  footer?: ReactNode;
}

export const FormContainer = ({
  selectedChannel,
  selectedProvider,
  children,
  footer,
}: FormContainerProps) => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header do formulário */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ChannelIcon
              channelType={selectedChannel?.type || 'web_widget'}
              size="sm"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {selectedChannel?.name}
              {selectedProvider && ` - ${selectedProvider.name}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedChannel?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">{children}</div>

      {/* Footer */}
      {footer}
    </div>
  );
};
