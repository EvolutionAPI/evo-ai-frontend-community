import { useLanguage } from '@/hooks/useLanguage';
import BaseFilter from '@/components/base/BaseFilter';
import {
  BaseFilter as MCPServerFilter,
  MCP_SERVER_FILTER_TYPES,
  DEFAULT_MCP_SERVER_FILTER,
} from '@/types/core';

interface MCPServersFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MCPServerFilter[];
  onFiltersChange: (filters: MCPServerFilter[]) => void;
  onApplyFilters: (filters: MCPServerFilter[]) => void;
  onClearFilters: () => void;
}

export default function MCPServersFilter({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: MCPServersFilterProps) {
  const { t } = useLanguage('mcpServers');

  return (
    <BaseFilter
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      filterTypes={MCP_SERVER_FILTER_TYPES}
      defaultFilter={DEFAULT_MCP_SERVER_FILTER}
      title={t('filter.title')}
      description={t('filter.description')}
      applyButtonText={t('filter.buttons.apply')}
      clearButtonText={t('filter.buttons.clear')}
      addFilterText={t('filter.buttons.addFilter')}
    />
  );
}
