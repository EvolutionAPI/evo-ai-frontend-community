import BaseFilter from '@/components/base/BaseFilter';
import { USER_FILTER_TYPES, DEFAULT_USER_FILTER } from '@/types/users';
import { BaseFilter as UserFilter } from '@/types/core';
import { useLanguage } from '@/hooks/useLanguage';

interface UsersFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: UserFilter[];
  onFiltersChange: (filters: UserFilter[]) => void;
  onApplyFilters: (filters: UserFilter[]) => void;
  onClearFilters: () => void;
}

export default function UsersFilter({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: UsersFilterProps) {
  const { t } = useLanguage('users');

  return (
    <BaseFilter
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      filterTypes={USER_FILTER_TYPES}
      defaultFilter={DEFAULT_USER_FILTER}
      title={t('filter.title')}
      description={t('filter.description')}
      applyButtonText={t('filter.applyFilters')}
      clearButtonText={t('filter.clearFilters')}
      addFilterText={t('filter.addFilter')}
    />
  );
}
