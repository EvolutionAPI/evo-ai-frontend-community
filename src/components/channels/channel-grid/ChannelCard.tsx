import {
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@evoapi/design-system';
import { ChannelIcon } from '@/components/channels';
import { ChannelType } from '@/hooks/channels/useChannelForm';

interface ChannelCardProps {
  channel: ChannelType;
  disabled?: boolean;
  disabledTooltip?: string;
  onClick: () => void;
  'data-tour'?: string;
}

export const ChannelCard = ({
  channel,
  disabled = false,
  disabledTooltip,
  onClick,
  'data-tour': dataTour,
}: ChannelCardProps) => {
  const card = (
    <Card
      className={`h-full transition-all duration-200 border-sidebar-border rounded-lg ${
        disabled
          ? 'opacity-60 cursor-not-allowed bg-sidebar'
          : 'cursor-pointer bg-sidebar hover:bg-sidebar-accent/50 hover:border-sidebar-border hover:shadow-md'
      }`}
      onClick={() => !disabled && onClick()}
      data-tour={dataTour}
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

  if (disabled && disabledTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full">{card}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
};
