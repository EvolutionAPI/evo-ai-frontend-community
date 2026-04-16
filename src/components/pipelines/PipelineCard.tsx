import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@evoapi/design-system';
import { Button } from '@evoapi/design-system';
import { GitBranch, Eye, Edit, Trash2, Copy, CopyPlus, Power, MoreVertical, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import { Pipeline } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface PipelineCardProps {
  pipeline: Pipeline;
  onView: (pipeline: Pipeline) => void;
  onEdit: (pipeline: Pipeline) => void;
  onDelete: (pipeline: Pipeline) => void;
  onDuplicate: (pipeline: Pipeline) => void;
  onToggleStatus: (pipeline: Pipeline) => void;
  onSetAsDefault: (pipeline: Pipeline) => void;
}

export default function PipelineCard({
  pipeline,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onSetAsDefault,
}: PipelineCardProps) {
  const { t } = useLanguage('pipelines');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getPipelineTypeLabel = (type: string) => {
    return t(`pipelineCard.types.${type}`, { defaultValue: t('pipelineCard.types.custom') });
  };

  const getPipelineColor = (id: string) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const pipelineColor = getPipelineColor(pipeline.id);

  return (
    <Card className="group relative bg-sidebar border-sidebar-border hover:bg-sidebar-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 border-b border-sidebar-border cursor-pointer"
          onClick={() => onView(pipeline)}
        >
          {/* Pipeline icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{
              backgroundColor:
                pipelineColor === 'blue'
                  ? '#3b82f6'
                  : pipelineColor === 'green'
                  ? '#10b981'
                  : pipelineColor === 'purple'
                  ? '#8b5cf6'
                  : pipelineColor === 'orange'
                  ? '#f97316'
                  : pipelineColor === 'pink'
                  ? '#ec4899'
                  : '#6366f1',
            }}
          >
            <GitBranch className="w-4 h-4" />
          </div>

          {/* Pipeline info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate text-sidebar-foreground">
                {pipeline.name}
              </h3>

              {/* Default badge */}
              {pipeline.is_default && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {t('pipelineCard.default')}
                </span>
              )}

              {/* Status badge */}
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  pipeline.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                )}
              >
                {pipeline.is_active ? t('pipelineCard.active') : t('pipelineCard.inactive')}
              </span>
            </div>

            {pipeline.description && (
              <p className="text-xs text-sidebar-foreground/60 truncate">{pipeline.description}</p>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onEdit(pipeline);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('pipelineCard.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDuplicate(pipeline);
                }}
              >
                <CopyPlus className="h-4 w-4 mr-2" />
                {t('pipelineCard.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async e => {
                  e.stopPropagation();
                  await navigator.clipboard.writeText(String(pipeline.id));
                  toast.success(t('pipelineCard.idCopied'));
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('pipelineCard.copyId')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onToggleStatus(pipeline);
                }}
              >
                <Power className="h-4 w-4 mr-2" />
                {pipeline.is_active ? t('pipelineCard.deactivate') : t('pipelineCard.activate')}
              </DropdownMenuItem>
              {!pipeline.is_default && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    onSetAsDefault(pipeline);
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t('pipelineCard.setAsDefault')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDelete(pipeline);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('pipelineCard.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 text-xs text-sidebar-foreground/70">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span>{t('pipelineCard.stats.items')}</span>
                <span className="font-semibold">{pipeline.item_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('pipelineCard.stats.stages')}</span>
                <span className="font-semibold">{pipeline.stages?.length || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span>{t('pipelineCard.stats.type')}</span>
                <span className="font-semibold">
                  {getPipelineTypeLabel(pipeline.pipeline_type)}
                </span>
              </div>
            </div>
          </div>

          {pipeline?.services_info && parseInt(pipeline.services_info.total_value.toString(), 10) > 0 && pipeline.services_info.has_services && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-sidebar-border">
              <span>{t('pipelineCard.stats.totalValue')}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                R$ {formatCurrency(pipeline.services_info.total_value)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex border-t border-sidebar-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            className="flex-1 rounded-none h-12 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            onClick={() => onView(pipeline)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('pipelineCard.view')}
          </Button>
          <div className="w-px bg-sidebar-border" />
          <Button
            variant="ghost"
            className="rounded-none h-12 px-4 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            onClick={() => onEdit(pipeline)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('pipelineCard.edit')}
          </Button>
          <div className="w-px bg-sidebar-border" />
          <Button
            variant="ghost"
            className="rounded-none h-12 px-4 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={() => onDelete(pipeline)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
