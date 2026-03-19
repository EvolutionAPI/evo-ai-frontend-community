import { useLanguage } from '@/hooks/useLanguage';
import { BaseHeader, HeaderAction, HeaderFilter } from '@/components/base';

interface MCPServersHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSelection: () => void;
  activeFilters?: HeaderFilter[];
}

export default function MCPServersHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onClearSelection,
  activeFilters = [],
}: MCPServersHeaderProps) {
  const { t } = useLanguage('mcpServers');
  const primaryAction: HeaderAction | undefined = undefined; // MCP Servers are read-only

  return (
    <BaseHeader
      title={t('header.title')}
      subtitle={t('header.subtitle')}
      totalCount={totalCount}
      selectedCount={selectedCount}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('header.searchPlaceholder')}
      primaryAction={primaryAction}
      filters={activeFilters}
      onFilterClick={undefined}
      showFilters={false}
      onClearSelection={onClearSelection}
    />
  );
}
