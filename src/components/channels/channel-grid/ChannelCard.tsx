import { Card, CardContent } from '@evoapi/design-system';
import { ChannelIcon } from '@/components/channels';
import { ChannelType } from '@/hooks/channels/useChannelForm';

interface ChannelCardProps {
  channel: ChannelType;
  disabled?: boolean;
  onClick: () => void;
}

export const ChannelCard = ({ channel, disabled = false, onClick }: ChannelCardProps) => {
  return (
    <Card
      className={`h-full transition-all duration-200 border-sidebar-border rounded-lg ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-sidebar'
          : 'cursor-pointer bg-sidebar hover:bg-sidebar-accent/50 hover:border-sidebar-border hover:shadow-md'
      }`}
      onClick={() => !disabled && onClick()}
    >
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <ChannelIcon channelType={channel.type} size="xl" />
        </div>
        <h3 className="font-semibold text-sidebar-foreground mb-2">{channel.name}</h3>
        <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
          {channel.description}
        </p>
      </CardContent>
    </Card>
  );
};
