import { Plus, Trash2 } from 'lucide-react';
import BaseHeader from '@/components/base/BaseHeader';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTranslation } from '@/hooks/useTranslation';

interface AccessTokensHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewToken: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  showBulkActions: boolean;
}

export default function AccessTokensHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewToken,
  onBulkDelete,
  onClearSelection,
  showBulkActions,
}: AccessTokensHeaderProps) {
  const { can } = useUserPermissions();
  const { t } = useTranslation('accessTokens');
  
  return (
    <BaseHeader
      title={t('title')}
      subtitle={t('header.subtitle', { count: totalCount })}
      searchPlaceholder={t('header.searchPlaceholder')}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      primaryAction={
        !showBulkActions && can('access_tokens', 'create') ? {
          label: t('actions.create'),
          icon: <Plus className="h-4 w-4" />,
          onClick: onNewToken,
        } : undefined
      }
      bulkActions={
        showBulkActions && can('access_tokens', 'delete') ? [
          {
            label: t('actions.delete'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: onBulkDelete,
            variant: 'destructive' as const,
          }
        ] : undefined
      }
    />
  );
}
