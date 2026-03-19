import BaseFilter from '@/components/base/BaseFilter';
import {
  BaseFilter as ToolFilter,
  TOOL_FILTER_TYPES,
  DEFAULT_TOOL_FILTER,
} from '@/types/core';
import { useLanguage } from '@/hooks/useLanguage';

interface ToolsFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ToolFilter[];
  onFiltersChange: (filters: ToolFilter[]) => void;
  onApplyFilters: (filters: ToolFilter[]) => void;
  onClearFilters: () => void;
}

export default function ToolsFilter({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: ToolsFilterProps) {
  const { t } = useLanguage('tools');

  return (
    <BaseFilter
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      filterTypes={TOOL_FILTER_TYPES}
      defaultFilter={DEFAULT_TOOL_FILTER}
      title={t('filter.title')}
      description={t('filter.description')}
      applyButtonText={t('filter.applyFilters')}
      clearButtonText={t('filter.clearFilters')}
      addFilterText={t('filter.addFilter')}
    />
  );
}
