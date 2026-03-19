import { LockIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '@evoapi/design-system/button';
import { ReplyMode } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';

interface ReplyModeToggleProps {
  currentMode: ReplyMode;
  onModeChange: (mode: ReplyMode) => void;
  disabled?: boolean;
  forcedMode?: ReplyMode;
}

export const ReplyModeToggle = ({
  currentMode,
  onModeChange,
  disabled = false,
  forcedMode,
}: ReplyModeToggleProps) => {
  const { t } = useLanguage('chat');
  const effectiveMode = forcedMode || currentMode;
  const isReplyMode = effectiveMode === ReplyMode.REPLY;
  const isNoteMode = effectiveMode === ReplyMode.NOTE;

  return (
    <div className="flex items-center justify-start">
      {/* Toggle Container - Tamanho fixo, alinhado à esquerda */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border w-fit">
        {/* Botão Resposta Pública */}
        <Button
          variant={isReplyMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(ReplyMode.REPLY)}
          disabled={disabled || (forcedMode && forcedMode !== ReplyMode.REPLY)}
          className={`
            h-7 px-3 text-xs font-medium transition-all duration-200 flex items-center gap-1.5
            ${
              isReplyMode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
            ${forcedMode && forcedMode !== ReplyMode.REPLY ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <MessageSquareIcon className="h-3 w-3" />
          {t('replyModeToggle.reply')}
        </Button>

        {/* Botão Nota Privada */}
        <Button
          variant={isNoteMode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(ReplyMode.NOTE)}
          disabled={disabled || (forcedMode && forcedMode !== ReplyMode.NOTE)}
          className={`
            h-7 px-3 text-xs font-medium transition-all duration-200 flex items-center gap-1.5
            ${
              isNoteMode
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
          `}
        >
          <LockIcon className="h-3 w-3" />
          {t('replyModeToggle.privateNote')}
        </Button>
      </div>

      {/* Indicador de modo ativo - Separado do toggle */}
      {isNoteMode && (
        <div className="ml-3 flex items-center text-xs text-muted-foreground">
          <span className="font-medium">{t('replyModeToggle.visibleOnlyToAgents')}</span>
        </div>
      )}
    </div>
  );
};

export default ReplyModeToggle;
