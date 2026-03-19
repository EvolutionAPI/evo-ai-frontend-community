import { useContext } from 'react';
import { ConversationsContext } from '@/contexts/chat/ConversationsContextInstance';
import { ConversationsContextValue } from '@/types/chat/conversations';

export function useConversations(): ConversationsContextValue {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}
