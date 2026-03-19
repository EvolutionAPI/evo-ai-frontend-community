import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@evoapi/design-system';
import { Plus } from 'lucide-react';
import PrimaryActionButton from './PrimaryActionButton';

import { BaseFilter as BaseFilterType, FilterType } from '@/types/core';
import BaseFilterRow from './BaseFilterRow';

interface BaseFilterProps<T extends BaseFilterType> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: T[];
  onFiltersChange: (filters: T[]) => void;
  onApplyFilters: (filters: T[]) => void;
  onClearFilters: () => void;
  filterTypes: FilterType[];
  defaultFilter: T;
  title?: string;
  description?: string;
  applyButtonText?: string;
  clearButtonText?: string;
  addFilterText?: string;
  className?: string;
  translationNamespace?: string;
}

function useFilterTranslations() {
  const { t } = useLanguage('common');
  return {
    title: t('base.filter.title'),
    description: t('base.filter.description'),
    applyButtonText: t('base.filter.applyFilters'),
    clearButtonText: t('base.filter.clearFilters'),
    addFilterText: t('base.filter.addFilter'),
    cancel: t('base.filter.cancel'),
  };
}

export default function BaseFilter<T extends BaseFilterType>({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  filterTypes,
  defaultFilter,
  title,
  description,
  applyButtonText,
  clearButtonText,
  addFilterText,
  className = '',
  translationNamespace = 'common',
}: BaseFilterProps<T>) {
  const translations = useFilterTranslations();
  const finalTitle = title || translations.title;
  const finalDescription = description || translations.description;
  const finalApplyText = applyButtonText || translations.applyButtonText;
  const finalClearText = clearButtonText || translations.clearButtonText;
  const finalAddText = addFilterText || translations.addFilterText;
  const [localFilters, setLocalFilters] = useState<T[]>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters.length > 0 ? [...filters] : [{ ...defaultFilter } as T]);
    }
  }, [open, filters, defaultFilter]);

  const updateFilter = (index: number, field: keyof T, value: any) => {
    const newFilters = [...localFilters];

    // Se mudou o attributeKey, resetar o operador e valor
    if (field === 'attributeKey') {
      const filterType = filterTypes.find(ft => ft.attributeKey === value);
      newFilters[index] = {
        ...newFilters[index],
        attributeKey: value,
        filterOperator: filterType?.filterOperators[0]?.key || 'equal_to',
        values: '',
      } as T;
    } else {
      newFilters[index] = { ...newFilters[index], [field]: value };
    }

    setLocalFilters(newFilters);
  };

  const addFilter = () => {
    setLocalFilters([...localFilters, { ...defaultFilter } as T]);
  };

  const removeFilter = (index: number) => {
    if (localFilters.length === 1) {
      handleClear();
    } else {
      const newFilters = localFilters.filter((_, i) => i !== index);
      setLocalFilters(newFilters);
    }
  };

  const handleApply = () => {
    // Validar filtros antes de aplicar
    const validFilters = localFilters.filter(filter => {
      const needsValue = !['is_present', 'is_not_present'].includes(filter.filterOperator);
      return !needsValue || (filter.values && filter.values.toString().trim() !== '');
    });

    if (validFilters.length > 0) {
      onFiltersChange(validFilters);
      onApplyFilters(validFilters);
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setLocalFilters([{ ...defaultFilter } as T]);
    onClearFilters();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl bg-sidebar border-sidebar-border ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-sidebar-foreground">{finalTitle}</DialogTitle>
          <DialogDescription className="text-sidebar-foreground/70">
            {finalDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {localFilters.map((filter, index) => (
            <BaseFilterRow
              key={`filter-${index}`}
              filter={filter}
              index={index}
              showQueryOperator={index > 0}
              filterTypes={filterTypes}
              onUpdate={updateFilter}
              onRemove={removeFilter}
              translationNamespace={translationNamespace}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addFilter}
            className="w-full bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            {finalAddText}
          </Button>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleClear}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {finalClearText}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {translations.cancel}
            </Button>
            <PrimaryActionButton label={finalApplyText} onClick={handleApply} size="default" />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
