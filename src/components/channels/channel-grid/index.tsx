import { useMemo, useState } from 'react';
import { Input } from '@evoapi/design-system';
import { Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ChannelCard } from './ChannelCard';
import { ChannelType } from '@/hooks/channels/useChannelForm';

interface ChannelGridProps {
  channels: ChannelType[];
  onChannelSelect: (channel: ChannelType) => void;
  canFB: boolean;
}

export const ChannelGrid = ({ channels, onChannelSelect, canFB }: ChannelGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage('channels');

  const filteredChannels = useMemo(
    () =>
      channels.filter(
        channel =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          channel.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, channels],
  );

  const pageContainer = 'mx-auto w-full max-w-6xl px-4 md:px-6';

  const renderHeader = (title: string, subtitle?: string) => (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground mb-2">{title}</h1>
      {subtitle && <p className="text-sidebar-foreground/70">{subtitle}</p>}
    </div>
  );

  return (
    <div className={pageContainer}>
      <div data-tour="channel-grid-header">
        {renderHeader(t('newChannel.channelGrid.title'), t('newChannel.channelGrid.subtitle'))}
      </div>

      {/* Search */}
      <div className="mb-8" data-tour="channel-grid-search">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60 h-5 w-5" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('newChannel.channelGrid.searchPlaceholder')}
            className="pl-10 bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:border-sidebar-border"
          />
        </div>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-8" data-tour="channel-grid-list">
        {filteredChannels.map((channel, index) => {
          const disabled =
            channel.type === 'facebook' || channel.type === 'instagram' ? !canFB : false;

          return (
            <ChannelCard
              key={channel.id}
              channel={channel}
              disabled={disabled}
              disabledTooltip={disabled ? t('newChannel.channelGrid.notConfiguredTooltip') : undefined}
              onClick={() => onChannelSelect(channel)}
              data-tour={index === 0 ? 'channel-grid-first-card' : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};
