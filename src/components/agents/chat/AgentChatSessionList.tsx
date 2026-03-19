import { useState } from 'react';
import { Button, Input, ScrollArea } from '@evoapi/design-system';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAgentChat } from '@/contexts/agents/AgentChatContext';
import { formatDateTime } from '@/utils/time/formatDateTime';

export function AgentChatSessionList() {
  const { t } = useLanguage('aiAgents');
  const { sessions, selectedSessionId, isLoading, selectSession, createNewSession, deleteSession } = useAgentChat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const updateTimeA = new Date(a.update_time).getTime();
    const updateTimeB = new Date(b.update_time).getTime();
    return updateTimeB - updateTimeA;
  });

  const getExternalId = (sessionId: string) => {
    // Session ID is now a UUID from backend, show first 8 chars
    return sessionId.substring(0, 8);
  };

  return (
    <div className="w-64 border-r bg-muted/50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={createNewSession} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('chat.newConversation') || 'Nova Conversa'}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('chat.searchConversations') || 'Buscar conversas...'}
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : sortedSessions.length > 0 ? (
          <div className="px-4 pt-2 space-y-2">
            {sortedSessions.map(session => {
              const externalId = getExternalId(session.id);
              const isSelected = selectedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-primary/20 border border-primary/40'
                      : 'bg-background hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => selectSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0"></div>
                      <div className="text-sm font-medium truncate">{externalId}</div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground ml-4">
                    {formatDateTime(session.update_time)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('chat.noConversations') || 'Nenhuma conversa'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

