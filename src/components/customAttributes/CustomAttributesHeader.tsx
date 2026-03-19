import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2 } from 'lucide-react';
import BaseHeader from '@/components/base/BaseHeader';
import { AttributeModel, ATTRIBUTE_TABS } from '@/types/settings';

interface CustomAttributesHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewAttribute: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  showBulkActions: boolean;
  activeTab: AttributeModel;
}

export default function CustomAttributesHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewAttribute,
  onBulkDelete,
  onClearSelection,
  showBulkActions,
  activeTab,
}: CustomAttributesHeaderProps) {
  const { t } = useLanguage('customAttributes');
  const currentTab = ATTRIBUTE_TABS.find(tab => tab.key === activeTab);

  return (
    <BaseHeader
      title={t('header.title')}
      subtitle={t(totalCount === 1 ? 'header.subtitleSingular' : 'header.subtitle', {
        count: totalCount,
        tabName: currentTab?.name.toLowerCase(),
      })}
      searchPlaceholder={t('header.searchPlaceholder')}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      primaryAction={
        !showBulkActions
          ? {
              label: t('header.newAttribute'),
              icon: <Plus className="h-4 w-4" />,
              onClick: onNewAttribute,
            }
          : undefined
      }
      bulkActions={
        showBulkActions
          ? [
              {
                label: t('header.bulkDelete'),
                icon: <Trash2 className="h-4 w-4" />,
                onClick: onBulkDelete,
                variant: 'destructive' as const,
              },
            ]
          : []
      }
    />
  );
}
