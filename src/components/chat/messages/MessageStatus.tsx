import React from 'react';
import { Button } from '@evoapi/design-system/button';
import { Check, CheckCheck, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Message } from '@/types/chat/api';
import { formatMessageTime } from '@/utils/time/timeHelpers';
import { useLanguage } from '@/hooks/useLanguage';

interface MessageStatusProps {
  message: Message;
  isOwn: boolean;
  onRetry?: () => void;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ message, isOwn, onRetry }) => {
  const { t } = useLanguage('chat');

  const getStatusIcon = () => {
    if (!isOwn) return null;

    // CORREÇÃO: Tratar mensagens privadas sempre como enviadas com sucesso
    if (message.private) {
      // Mensagens privadas são sempre "bem-sucedidas" (salvas no banco)
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }

    // CORREÇÃO: Em ambiente de desenvolvimento, canais podem não estar configurados
    // Se for uma mensagem pública com status 'failed', pode ser problema de configuração
    if (message.status === 'failed' && !message.private) {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="h-auto p-0 text-orange-500 hover:text-orange-600"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();

            // Mostrar toast explicativo sobre o problema do webhook
            toast.warning(t('messages.messageStatus.statusUnavailable'), {
              description: t('messages.messageStatus.statusUnavailableDescription'),
            });
            toast.info(t('messages.messageStatus.checkChannelConfig'), {
              description: t('messages.messageStatus.webhookIssue'),
            });

            // Se existe função onRetry, também executar (para tentar reenviar)
            if (onRetry) {
              setTimeout(() => {
                onRetry();
              }, 1000); // Delay para que o usuário veja o toast primeiro
            }
          }}
          title={t('messages.messageStatus.deliveryStatusUnavailable')}
        >
          <AlertCircle className="h-3 w-3" />
          <span className="ml-1 text-xs">{t('messages.messageStatus.statusUnavailableText')}</span>
        </Button>
      );
    }

    switch (message.status) {
      case 'sent':
        // Para mensagens privadas, 'sent' é o status final correto
        // Para mensagens públicas, 'sent' indica que foi enviada para o canal
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'progress':
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'failed':
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-auto p-0 text-destructive hover:text-destructive/80"
            onClick={() => {
              if (onRetry) {
                onRetry();
              } else {
                toast.error(t('messages.messageStatus.retryInDevelopment'));
              }
            }}
            title={t('messages.messageStatus.sendFailed')}
          >
            <AlertCircle className="h-3 w-3" />
            <span className="ml-1 text-xs">{t('messages.messageStatus.tryAgain')}</span>
          </Button>
        );
      default:
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <span className="text-muted-foreground">{formatMessageTime(message.created_at)}</span>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;
