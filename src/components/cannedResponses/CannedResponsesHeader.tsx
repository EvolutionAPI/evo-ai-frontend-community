import { useLanguage } from '@/hooks/useLanguage';
import { Button, Input } from '@evoapi/design-system';
import { Plus, Search, Trash2, X } from 'lucide-react';
import BaseHeader from '@/components/base/BaseHeader';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface CannedResponsesHeaderProps {
  totalCount: number;
  selectedCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewCannedResponse: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  showBulkActions: boolean;
}

export default function CannedResponsesHeader({
  totalCount,
  selectedCount,
  searchValue,
  onSearchChange,
  onNewCannedResponse,
  onBulkDelete,
  onClearSelection,
  showBulkActions,
}: CannedResponsesHeaderProps) {
  const { t } = useLanguage('cannedResponses');
  const { can, isReady } = useUserPermissions();

  return (
    <BaseHeader
      title={t('header.title')}
      totalCount={totalCount}
    >
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('header.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('header.selected', { count: selectedCount })}
            </span>
            {isReady && can('canned_responses', 'delete') && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                {t('header.bulkDelete')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* New Canned Response Button */}
        {!showBulkActions && isReady && can('canned_responses', 'create') && (
          <Button onClick={onNewCannedResponse}>
            <Plus className="h-4 w-4 mr-2" />
            {t('header.newResponse')}
          </Button>
        )}
      </div>
    </BaseHeader>
  );
}
