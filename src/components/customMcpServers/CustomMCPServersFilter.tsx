import { useLanguage } from '@/hooks/useLanguage';
import BaseFilter from '@/components/base/BaseFilter';
import {
  BaseFilter as CustomMCPServerFilter,
  CUSTOM_MCP_SERVER_FILTER_TYPES,
  DEFAULT_CUSTOM_MCP_SERVER_FILTER,
} from '@/types/core';

interface CustomMCPServersFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomMCPServerFilter[];
  onFiltersChange: (filters: CustomMCPServerFilter[]) => void;
  onApplyFilters: (filters: CustomMCPServerFilter[]) => void;
  onClearFilters: () => void;
}

export default function CustomMCPServersFilter({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: CustomMCPServersFilterProps) {
  const { t } = useLanguage('customMcpServers');

  return (
    <BaseFilter
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      filterTypes={CUSTOM_MCP_SERVER_FILTER_TYPES}
      defaultFilter={DEFAULT_CUSTOM_MCP_SERVER_FILTER}
      title={t('filter.title')}
      description={t('filter.description')}
      applyButtonText={t('filter.apply')}
      clearButtonText={t('filter.clear')}
      addFilterText={t('filter.add')}
    />
  );
}
