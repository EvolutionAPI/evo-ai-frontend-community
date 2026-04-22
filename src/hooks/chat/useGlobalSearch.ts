import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import searchService from '@/services/chat/searchService';
import type {
  SearchAllResult,
  SearchConversationResult,
  SearchContactResult,
  SearchMessageResult,
} from '@/types/chat/search';

const MIN_QUERY_LENGTH = 2;

export type GlobalSearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseGlobalSearchResult {
  status: GlobalSearchStatus;
  error: string | null;
  conversations: SearchConversationResult[];
  contacts: SearchContactResult[];
  messages: SearchMessageResult[];
  isEmpty: boolean;
  term: string;
}

const EMPTY_RESULT: SearchAllResult = {
  conversations: [],
  contacts: [],
  messages: [],
};

export const useGlobalSearch = (searchTerm: string): UseGlobalSearchResult => {
  const [status, setStatus] = useState<GlobalSearchStatus>('idle');
  const [result, setResult] = useState<SearchAllResult>(EMPTY_RESULT);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelInFlight = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();

    if (term.length < MIN_QUERY_LENGTH) {
      cancelInFlight();
      setStatus('idle');
      setResult(EMPTY_RESULT);
      setError(null);
      return;
    }

    cancelInFlight();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);

    searchService
      .searchAll({ q: term, page: 1 }, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setResult({
          conversations: data.conversations ?? [],
          contacts: data.contacts ?? [],
          messages: data.messages ?? [],
        });
        setStatus('success');
      })
      .catch(err => {
        if (axios.isCancel(err) || err?.name === 'CanceledError' || err?.name === 'AbortError') {
          return;
        }
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
        setStatus('error');
        setResult(EMPTY_RESULT);
      });

    return () => {
      controller.abort();
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    };
  }, [searchTerm, cancelInFlight]);

  const isEmpty =
    status === 'success' &&
    result.conversations.length === 0 &&
    result.contacts.length === 0 &&
    result.messages.length === 0;

  return {
    status,
    error,
    conversations: result.conversations,
    contacts: result.contacts,
    messages: result.messages,
    isEmpty,
    term: searchTerm.trim(),
  };
};

export default useGlobalSearch;
