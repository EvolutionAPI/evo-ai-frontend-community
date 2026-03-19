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
import { AlertTriangle, Users, Settings, BarChart3 } from 'lucide-react';
import { Pipeline } from '@/types/analytics';

interface DeletePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: Pipeline | null;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeletePipelineModal({
  open,
  onOpenChange,
  pipeline,
  onConfirm,
  loading,
}: DeletePipelineModalProps) {
  const { t } = useLanguage('pipelines');

  if (!pipeline) return null;

  const itemCount = pipeline.item_count || 0;
  const stageCount = pipeline.stages?.length || 0;
  const hasItems = itemCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>{t('deletePipeline.title')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('deletePipeline.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('deletePipeline.confirmMessage')}{' '}
            <span className="font-medium text-foreground">"{pipeline.name}"</span>?
          </p>

          {/* Pipeline Info */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border mb-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {pipeline.name}
                </h4>
                {pipeline.description && (
                  <p className="text-xs text-muted-foreground">
                    {pipeline.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{itemCount}</div>
                    <div className="text-xs text-muted-foreground">{t('deletePipeline.info.conversations')}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{stageCount}</div>
                    <div className="text-xs text-muted-foreground">{t('deletePipeline.info.stages')}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{pipeline.pipeline_type}</div>
                    <div className="text-xs text-muted-foreground">{t('deletePipeline.info.type')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning about data loss */}
          {hasItems ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-2">
                    {t('deletePipeline.warningTitle')}
                  </p>
                  <p className="text-destructive/80 mb-3">
                    {t('deletePipeline.warningMessage', { count: itemCount, plural: itemCount !== 1 ? 's' : '' })}
                  </p>
                  <div className="text-xs text-destructive/70">
                    {t('deletePipeline.note')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border mb-4">
              <p className="text-sm text-muted-foreground">
                {t('deletePipeline.safeToDelete')}
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">{t('deletePipeline.willDelete')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('deletePipeline.effects.remove')}</li>
              <li>{t('deletePipeline.effects.deleteStages', { count: stageCount, plural: stageCount !== 1 ? 's' : '' })}</li>
              {hasItems && (
                <li>{t('deletePipeline.effects.removeConversations', { count: itemCount, plural: itemCount !== 1 ? 's' : '' })}</li>
              )}
              <li>{t('deletePipeline.effects.deleteHistory')}</li>
              <li>{t('deletePipeline.effects.invalidateReports')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('deletePipeline.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('deletePipeline.deleting') : t('deletePipeline.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
