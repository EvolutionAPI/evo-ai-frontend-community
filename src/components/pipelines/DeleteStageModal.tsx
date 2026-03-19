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
import { AlertTriangle } from 'lucide-react';
import { PipelineStage } from '@/types/analytics';

interface DeleteStageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: PipelineStage | null;
  itemCount?: number;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteStageModal({
  open,
  onOpenChange,
  stage,
  itemCount = 0,
  onConfirm,
  loading,
}: DeleteStageModalProps) {
  const { t } = useLanguage('pipelines');

  if (!stage) return null;

  const hasConversations = itemCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{t('deleteStage.title')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('deleteStage.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('deleteStage.confirmMessage')}{' '}
            <span className="font-medium text-foreground">"{stage.name}"</span>?
          </p>
          
          {/* Stage Preview */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {stage.name}
                </h4>
                {stage.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Warning about conversations */}
          {hasConversations ? (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">
                    {t('deleteStage.warningTitle')}
                  </p>
                  <p className="text-destructive/80">
                    {t('deleteStage.warningMessage', { count: itemCount, plural: itemCount !== 1 ? 's' : '', pronoun: itemCount !== 1 ? 'elas' : 'ela', verb: itemCount !== 1 ? 'ão' : '', removed: itemCount !== 1 ? 's' : '' })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                {t('deleteStage.safeToDelete')}
              </p>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            <strong>{t('deleteStage.importantLabel')}</strong> {t('deleteStage.deletionWillLabel')}
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t('deleteStage.deletionWill.removeStage')}</li>
              {hasConversations && (
                <li>{t('deleteStage.deletionWill.removeConversations')}</li>
              )}
              <li>{t('deleteStage.deletionWill.reorderStages')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('deleteStage.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('deleteStage.deleting') : t('deleteStage.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}