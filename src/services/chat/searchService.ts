import api from '@/services/core/api';
import { withRetry } from '@/utils/retry/retryHelper';
import type {
  SearchAllResult,
  SearchConversationsResult,
  SearchContactsResult,
  SearchMessagesResult,
  SearchRequestParams,
} from '@/types/chat/search';

interface ChatwootPayloadEnvelope<T> {
  payload: T;
}

const unwrap = <T>(data: unknown): T => {
  const envelope = data as ChatwootPayloadEnvelope<T> | T;
  if (envelope && typeof envelope === 'object' && 'payload' in envelope) {
    return (envelope as ChatwootPayloadEnvelope<T>).payload;
  }
  return envelope as T;
};

class SearchService {
  async searchAll(
    params: SearchRequestParams,
    signal?: AbortSignal,
  ): Promise<SearchAllResult> {
    return withRetry(async () => {
      const response = await api.get('/search', {
        params: { q: params.q, page: params.page ?? 1 },
        signal,
      });
      return unwrap<SearchAllResult>(response.data);
    });
  }

  async searchConversations(
    params: SearchRequestParams,
    signal?: AbortSignal,
  ): Promise<SearchConversationsResult> {
    return withRetry(async () => {
      const response = await api.get('/search/conversations', {
        params: { q: params.q, page: params.page ?? 1 },
        signal,
      });
      return unwrap<SearchConversationsResult>(response.data);
    });
  }

  async searchContacts(
    params: SearchRequestParams,
    signal?: AbortSignal,
  ): Promise<SearchContactsResult> {
    return withRetry(async () => {
      const response = await api.get('/search/contacts', {
        params: { q: params.q, page: params.page ?? 1 },
        signal,
      });
      return unwrap<SearchContactsResult>(response.data);
    });
  }

  async searchMessages(
    params: SearchRequestParams,
    signal?: AbortSignal,
  ): Promise<SearchMessagesResult> {
    return withRetry(async () => {
      const response = await api.get('/search/messages', {
        params: { q: params.q, page: params.page ?? 1 },
        signal,
      });
      return unwrap<SearchMessagesResult>(response.data);
    });
  }
}

export const searchService = new SearchService();
export default searchService;
