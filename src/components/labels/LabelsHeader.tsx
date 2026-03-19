import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2 } from 'lucide-react';
import BaseHeader from '@/components/base/BaseHeader';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface LabelsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewLabel: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  showBulkActions: boolean;
}

export default function LabelsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewLabel,
  onBulkDelete,
  onClearSelection,
  showBulkActions,
}: LabelsHeaderProps) {
  const { t } = useLanguage('labels');
  const { can } = useUserPermissions();

  return (
    <BaseHeader
      title={t('header.title')}
      subtitle={t('header.subtitle', { count: totalCount, plural: totalCount !== 1 ? 's' : '' })}
      searchPlaceholder={t('header.searchPlaceholder')}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      primaryAction={
        !showBulkActions && can('labels', 'create') ? {
          label: t('header.newLabel'),
          icon: <Plus className="h-4 w-4" />,
          onClick: onNewLabel,
        } : undefined
      }
      bulkActions={
        showBulkActions && can('labels', 'delete') ? [
          {
            label: t('header.bulkDelete'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: onBulkDelete,
            variant: 'destructive' as const,
          }
        ] : []
      }
    />
  );
}
