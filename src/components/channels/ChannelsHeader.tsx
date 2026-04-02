import { Plus } from 'lucide-react';
import { BaseHeader, HeaderAction } from '@/components/base';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ChannelsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewChannel: () => void;
  onClearSelection: () => void;
}

export default function ChannelsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewChannel,
  onClearSelection,
}: ChannelsHeaderProps) {
  const { t } = useLanguage('channels');
  const { can, isReady } = useUserPermissions();

  const primaryAction: HeaderAction | undefined = isReady && can('channels', 'create') ? {
    label: t('actions.newChannel'),
    icon: <Plus className="h-4 w-4" />,
    onClick: onNewChannel,
    dataTour: 'channels-new-button',
  } : undefined;

  return (
    <BaseHeader
      title={t('title')}
      subtitle={t('subtitle')}
      totalCount={totalCount}
      selectedCount={selectedCount}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('search.placeholder')}
      primaryAction={primaryAction}
      onClearSelection={onClearSelection}
      showFilters={false}
      className="mb-4"
    />
  );
}


