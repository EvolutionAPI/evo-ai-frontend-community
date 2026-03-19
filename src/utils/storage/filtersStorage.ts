import { BaseFilter, DEFAULT_CONVERSATION_FILTER } from '@/types/core';

const STORAGE_KEY = 'evoai:conversation:filters';

export const saveConversationFilters = (filters: BaseFilter[]): void => {
  try {
    const storageKey = `${STORAGE_KEY}`;
    localStorage.setItem(storageKey, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving conversation filters to localStorage:', error);
  }
};

export const loadConversationFilters = (): BaseFilter[] | null => {
  try {
    const storageKey = `${STORAGE_KEY}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading conversation filters from localStorage:', error);
    return null;
  }
};

export const clearConversationFilters = (): void => {
  try {
    const storageKey = `${STORAGE_KEY}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing conversation filters from localStorage:', error);
  }
};

export const getDefaultFilter = (): BaseFilter[] => {
  return [DEFAULT_CONVERSATION_FILTER];
};
