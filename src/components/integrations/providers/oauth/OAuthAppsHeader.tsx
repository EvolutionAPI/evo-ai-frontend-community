import {
  Plus,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { BaseHeader, HeaderAction } from '@/components/base';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { IntegrationBackButton } from '../../shared';

interface OAuthAppsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewApp: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onBack?: () => void;
}

export default function OAuthAppsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewApp,
  onBulkDelete,
  onClearSelection,
  onBack,
}: OAuthAppsHeaderProps) {
  const { t } = useLanguage('integrations');
  const { can, isReady } = useUserPermissions();

  const primaryAction: HeaderAction | undefined = isReady && can('oauth_applications', 'create') ? {
    label: t('oauth.header.newApp'),
    icon: <Plus className="h-4 w-4" />,
    onClick: onNewApp,
  } : undefined;

  const bulkActions: HeaderAction[] = isReady && can('oauth_applications', 'delete') ? [
    {
      label: t('oauth.header.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onBulkDelete,
      variant: 'destructive',
    },
  ] : [];

  return (
    <div>
      <IntegrationBackButton onBack={onBack} />
      
      <BaseHeader
        title={t('oauth.header.title')}
        subtitle={t('oauth.header.subtitle')}
        totalCount={totalCount}
        selectedCount={selectedCount}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('oauth.header.searchPlaceholder')}
        primaryAction={primaryAction}
        bulkActions={bulkActions}
        showFilters={false}
        onClearSelection={onClearSelection}
      />
    </div>
  );
}