import {
  Plus,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { BaseHeader, HeaderAction } from '@/components/base';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { IntegrationBackButton } from '../../shared';

interface WebhooksHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewWebhook: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onBack?: () => void;
}

export default function WebhooksHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewWebhook,
  onBulkDelete,
  onClearSelection,
  onBack,
}: WebhooksHeaderProps) {
  const { t } = useLanguage('integrations');
  const { can, isReady } = useUserPermissions();

  const primaryAction: HeaderAction | undefined = isReady && can('webhooks', 'create') ? {
    label: t('webhooks.header.newWebhook'),
    icon: <Plus className="h-4 w-4" />,
    onClick: onNewWebhook,
  } : undefined;

  const bulkActions: HeaderAction[] = isReady && can('webhooks', 'delete') ? [
    {
      label: t('webhooks.header.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onBulkDelete,
      variant: 'destructive',
    },
  ] : [];

  return (
    <div>
      <IntegrationBackButton onBack={onBack} />

      <BaseHeader
        title={t('webhooks.header.title')}
        subtitle={t('webhooks.header.subtitle')}
        totalCount={totalCount}
        selectedCount={selectedCount}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('webhooks.header.searchPlaceholder')}
        primaryAction={primaryAction}
        bulkActions={bulkActions}
        showFilters={false}
        onClearSelection={onClearSelection}
      />
    </div>
  );
}
