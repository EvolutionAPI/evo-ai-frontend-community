import React from 'react';
import { Button } from '@evoapi/design-system/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@evoapi/design-system/dialog';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface AIResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  originalMessage?: string;
  generatedMessage?: string;
  isLoading: boolean;
  actionLabel?: string;
}

const AIResultModal: React.FC<AIResultModalProps> = ({
  isOpen,
  onClose,
  onApply,
  originalMessage,
  generatedMessage,
  isLoading,
  actionLabel,
}) => {
  const { t } = useLanguage('chat');
  const displayActionLabel = actionLabel || t('aiAssistance.button.fallbackLabel');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (generatedMessage) {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      toast.success(t('aiAssistance.resultModal.copy.success'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('aiAssistance.resultModal.title', { actionLabel: displayActionLabel })}</DialogTitle>
          <DialogDescription>
            {isLoading
              ? t('aiAssistance.resultModal.description.loading')
              : t('aiAssistance.resultModal.description.ready')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {originalMessage && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {t('aiAssistance.resultModal.originalMessage')}
              </h4>
              <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                {originalMessage}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('aiAssistance.resultModal.generatedResult')}
              </h4>
              {generatedMessage && !isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="ml-1 text-xs">
                    {copied
                      ? t('aiAssistance.resultModal.copy.copied')
                      : t('aiAssistance.resultModal.copy.label')}
                  </span>
                </Button>
              )}
            </div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-sm min-h-[100px] whitespace-pre-wrap">
              {isLoading ? (
                <div className="flex items-center justify-center h-[100px]">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    {t('aiAssistance.resultModal.processing')}
                  </span>
                </div>
              ) : generatedMessage ? (
                generatedMessage
              ) : (
                <span className="text-muted-foreground italic">
                  {t('aiAssistance.resultModal.noContent')}
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('aiAssistance.resultModal.actions.cancel')}
          </Button>
          <Button onClick={onApply} disabled={isLoading || !generatedMessage}>
            {t('aiAssistance.resultModal.actions.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIResultModal;
