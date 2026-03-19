import { useCallback } from 'react';
import { ConversationFilter, QuickFilterTab } from '@/types/chat/api';

interface PersistedChatState {
  selectedConversationId?: string | null;
  activeFilters?: ConversationFilter[];
  quickFilterTab?: QuickFilterTab;
  searchTerm?: string;
}

const STORAGE_KEY = 'crm-chat-state';

export const usePersistence = () => {
  const saveState = useCallback((state: Partial<PersistedChatState>) => {
    try {
      const currentState = loadState();
      const newState = { ...currentState, ...state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save chat state to localStorage:', error);
    }
  }, []);

  const loadState = useCallback((): PersistedChatState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load chat state from localStorage:', error);
      return {};
    }
  }, []);

  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear chat state from localStorage:', error);
    }
  }, []);

  return {
    saveState,
    loadState,
    clearState,
  };
};
