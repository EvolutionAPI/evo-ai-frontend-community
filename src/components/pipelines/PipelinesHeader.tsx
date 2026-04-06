import { useLanguage } from '@/hooks/useLanguage';
import { Button, Input } from '@evoapi/design-system';
import { Search, Plus } from 'lucide-react';

interface PipelinesHeaderProps {
  totalCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onNewPipeline: () => void;
}

export default function PipelinesHeader({
  totalCount,
  searchValue,
  onSearchChange,
  onNewPipeline,
}: PipelinesHeaderProps) {
  const { t } = useLanguage('pipelines');

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('pipelinesHeader.title')}</h1>
        <p className="text-muted-foreground">
          {totalCount > 0
            ? t('pipelinesHeader.subtitle', { count: totalCount, plural: totalCount !== 1 ? 's' : '' })
            : t('pipelinesHeader.organize')
          }
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('pipelinesHeader.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={onNewPipeline} data-tour="pipelines-new-button">
          <Plus className="h-4 w-4 mr-2" />
          {t('pipelinesHeader.newPipeline')}
        </Button>
      </div>
    </div>
  );
}
