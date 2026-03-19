import { createContext } from 'react';
import { ConversationsContextValue } from '@/types/chat/conversations';

export const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);
