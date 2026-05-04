import { useRef, useEffect } from 'react';
import { Badge } from '@evoapi/design-system';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAgentChat } from '@/contexts/agents/AgentChatContext';
import { AgentChatMessageList } from './AgentChatMessageList';
import { AgentMessageInput } from './AgentMessageInput';
import { Agent } from '@/types/agents';

interface AgentChatAreaProps {
  agent: Agent;
}

export function AgentChatArea({ agent }: AgentChatAreaProps) {
  const { t } = useLanguage('aiAgents');
  const { messages, selectedSessionId, isLoading, isSending, sendMessage, sessions } =
    useAgentChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame and setTimeout for reliable scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      });
    }
  }, [messages, isSending]);

  const getSessionInfo = () => {
    if (!selectedSessionId) return null;
    // Session ID is now a UUID from backend, use it directly
    // Try to find session in sessions list to get metadata
    const session = sessions.find(s => s.id === selectedSessionId);
    if (session) {
      const updateDate = new Date(session.update_time);
      return {
        externalId: session.id.substring(0, 8), // Show first 8 chars of UUID
        displayDate: updateDate.toLocaleDateString('pt-BR'),
      };
    }
    return {
      externalId: selectedSessionId.substring(0, 8),
      displayDate: 'Session',
    };
  };

  const sessionInfo = getSessionInfo();

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 pr-12 border-b bg-card">
        <div className="flex justify-between items-center gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="p-1 rounded-full bg-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            {selectedSessionId
              ? `${t('chat.session') || 'Sessão'} ${sessionInfo?.externalId || selectedSessionId}`
              : t('chat.newConversation') || 'Nova Conversa'}
          </h2>
          <Badge variant="outline">{agent.name}</Badge>
        </div>
      </div>

      {/* Messages - Scrollable area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{t('chat.loading') || 'Carregando conversa...'}</p>
          </div>
        ) : !selectedSessionId ? (
          <div className="flex flex-col h-full min-h-[400px] items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-5">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t('chat.selectOrCreateSession') || 'Selecione uma conversa ou crie uma nova'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {t('chat.selectSessionMessage') ||
                'Escolha uma conversa existente na lista ao lado ou clique em "Nova Conversa" para começar.'}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full min-h-[400px] items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-5">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t('chat.chatWithAgent', { name: agent.name }) || `Chat com ${agent.name}`}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {t('chat.startConversation') || 'Digite sua mensagem abaixo para começar a conversa.'}
            </p>
          </div>
        ) : (
          <div className="p-4">
            <AgentChatMessageList messages={messages} isSending={isSending} />
          </div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      {selectedSessionId && (
        <div className="flex-shrink-0 px-4 pt-4 pb-6 border-t bg-card">
          <AgentMessageInput
            onSendMessage={sendMessage}
            isDisabled={isSending || isLoading || !agent?.id}
          />
        </div>
      )}
    </div>
  );
}
