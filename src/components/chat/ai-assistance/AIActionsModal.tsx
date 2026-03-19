import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@evoapi/design-system/dialog';
import { Button } from '@evoapi/design-system/button';
import { Sparkles, FileText, Type, Minimize2, Maximize2, Smile, Briefcase, Lightbulb, Shield } from 'lucide-react';
import { AIAction, AIActionType } from '@/types/chat/ai-assistance';
import { useLanguage } from '@/hooks/useLanguage';

interface AIActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: AIActionType) => void;
  actions: readonly AIAction[];
  hasMessage: boolean;
}

const getActionIcon = (actionType: AIActionType) => {
  const iconProps = { className: 'h-4 w-4' };

  switch (actionType) {
    case 'rephrase':
      return <Sparkles {...iconProps} />;
    case 'fix_spelling_grammar':
      return <FileText {...iconProps} />;
    case 'expand':
      return <Maximize2 {...iconProps} />;
    case 'shorten':
      return <Minimize2 {...iconProps} />;
    case 'make_friendly':
      return <Smile {...iconProps} />;
    case 'make_formal':
      return <Briefcase {...iconProps} />;
    case 'simplify':
      return <Lightbulb {...iconProps} />;
    case 'reply_suggestion':
      return <Sparkles {...iconProps} />;
    case 'summarize':
      return <Type {...iconProps} />;
    case 'analyze_sentiment':
      return <Shield {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

const AIActionsModal: React.FC<AIActionsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  actions,
  hasMessage,
}) => {
  const { t } = useLanguage('chat');
  const handleActionClick = (actionType: AIActionType) => {
    onSelectAction(actionType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('aiAssistance.title')}
          </DialogTitle>
          <DialogDescription>
            {hasMessage
              ? t('aiAssistance.description.withMessage')
              : t('aiAssistance.description.withoutMessage')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {actions.map(action => (
            <Button
              key={action.key}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-colors"
              onClick={() => handleActionClick(action.key)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">{getActionIcon(action.key)}</div>
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-medium">
                    {t(`aiAssistance.actions.${action.key}.label`)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {t(`aiAssistance.actions.${action.key}.description`)}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIActionsModal;
