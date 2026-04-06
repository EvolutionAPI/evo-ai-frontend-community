import { useLanguage } from '@/hooks/useLanguage';
import { Plus, X } from 'lucide-react';
import { BaseHeader, HeaderAction } from '@/components/base';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ScheduledActionsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewAction: () => void;
  onBulkCancel: () => void;
  onClearSelection: () => void;
  statusFilter?: string | null;
  onStatusFilter?: (status: string | null) => void;
}

export default function ScheduledActionsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewAction,
  onBulkCancel,
  onClearSelection,
}: ScheduledActionsHeaderProps) {
  const { t } = useLanguage('contacts');
  const { can, isReady } = useUserPermissions();

  // Uses 'contacts' resource — no dedicated 'scheduled_actions' permission exists in the system
  const primaryAction: HeaderAction | undefined = isReady && can('contacts', 'create') ? {
    label: t('scheduledActions.newAction'),
    icon: <Plus className="h-4 w-4" />,
    onClick: onNewAction,
    dataTour: 'scheduled-actions-new-button',
  } : undefined;

  const bulkActions: HeaderAction[] = isReady && can('contacts', 'update') ? [
    {
      label: t('scheduledActions.bulkCancel'),
      icon: <X className="h-4 w-4" />,
      onClick: onBulkCancel,
      variant: 'destructive',
    },
  ] : [];

  return (
    <BaseHeader
      title={t('scheduledActions.label')}
      subtitle={t('scheduledActions.subtitle', { count: totalCount })}
      totalCount={totalCount}
      selectedCount={selectedCount}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('scheduledActions.searchPlaceholder')}
      searchDataTour="scheduled-actions-search"
      primaryAction={primaryAction}
      bulkActions={bulkActions}
      onClearSelection={onClearSelection}
    />
  );
}

