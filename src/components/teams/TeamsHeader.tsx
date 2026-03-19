import {
  Plus,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { BaseHeader, HeaderAction, HeaderFilter } from '@/components/base';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useLanguage } from '@/hooks/useLanguage';

interface TeamsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewTeam: () => void;
  onImport: () => void;
  onExport: () => void;
  onFilter: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  activeFilters?: HeaderFilter[];
  showFilters?: boolean;
}

export default function TeamsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewTeam,
  onImport,
  onExport,
  onFilter,
  onBulkDelete,
  onClearSelection,
  activeFilters = [],
  showFilters = true,
}: TeamsHeaderProps) {
  const { can } = useUserPermissions();
  const { t } = useLanguage('teams');

  const primaryAction: HeaderAction | undefined = can('teams', 'create') ? {
    label: t('header.newTeam'),
    icon: <Plus className="h-4 w-4" />,
    onClick: onNewTeam,
  } : undefined;

  const secondaryActions: HeaderAction[] = [
    {
      label: t('header.export'),
      icon: <Download className="h-4 w-4" />,
      onClick: onExport,
      variant: 'outline',
    },
    {
      label: t('header.import'),
      icon: <Upload className="h-4 w-4" />,
      onClick: onImport,
      variant: 'outline',
    },
  ];

  const bulkActions: HeaderAction[] = can('teams', 'delete') ? [
    {
      label: t('header.delete'),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onBulkDelete,
      variant: 'destructive' as const,
    },
  ] : [];

  return (
    <BaseHeader
      title={t('title')}
      subtitle={t('subtitle')}
      totalCount={totalCount}
      selectedCount={selectedCount}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('header.searchPlaceholder')}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      bulkActions={bulkActions}
      filters={activeFilters}
      onFilterClick={onFilter}
      showFilters={showFilters}
      onClearSelection={onClearSelection}
    />
  );
}
