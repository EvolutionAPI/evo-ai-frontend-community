import { BaseHeader, HeaderAction, HeaderFilter } from '@/components/base';
import { useLanguage } from '@/hooks/useLanguage';

interface ToolsHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilter: () => void;
  onClearSelection: () => void;
  activeFilters?: HeaderFilter[];
  showFilters?: boolean;
}

export default function ToolsHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onFilter,
  onClearSelection,
  activeFilters = [],
  showFilters = true,
}: ToolsHeaderProps) {
  const { t } = useLanguage('tools');
  const primaryAction: HeaderAction | undefined = undefined; // Tools are read-only

  const secondaryActions: HeaderAction[] = [];

  const bulkActions: HeaderAction[] = []; // No bulk actions for read-only tools

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
