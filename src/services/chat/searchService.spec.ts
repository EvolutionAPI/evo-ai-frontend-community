import { beforeEach, describe, expect, it, vi } from 'vitest';
import searchService from './searchService';
import api from '@/services/core/api';

vi.mock('@/services/core/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/utils/retry/retryHelper', () => ({
  withRetry: <T>(op: () => Promise<T>) => op(),
}));

describe('searchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const samplePayload = {
    conversations: [{ id: 'c-1', display_id: 123 }],
    contacts: [{ id: 1, name: 'Acme' }],
    messages: [{ id: 10, content: 'hello' }],
  };

  it('searchAll hits /search with q + page and unwraps the payload envelope', async () => {
    const getMock = vi.mocked(api.get);
    getMock.mockResolvedValue({ data: { payload: samplePayload } } as never);

    const result = await searchService.searchAll({ q: 'acme', page: 2 });

    expect(getMock).toHaveBeenCalledWith('/search', {
      params: { q: 'acme', page: 2 },
      signal: undefined,
    });
    expect(result).toEqual(samplePayload);
  });

  it('defaults page to 1 when not provided', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { payload: samplePayload } } as never);

    await searchService.searchAll({ q: 'x' });

    expect(api.get).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ params: { q: 'x', page: 1 } }),
    );
  });

  it('searchConversations hits /search/conversations and unwraps payload', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { payload: { conversations: samplePayload.conversations } },
    } as never);

    const result = await searchService.searchConversations({ q: 'acme' });

    expect(api.get).toHaveBeenCalledWith(
      '/search/conversations',
      expect.objectContaining({ params: { q: 'acme', page: 1 } }),
    );
    expect(result.conversations).toEqual(samplePayload.conversations);
  });

  it('searchContacts hits /search/contacts and unwraps payload', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { payload: { contacts: samplePayload.contacts } },
    } as never);

    const result = await searchService.searchContacts({ q: 'acme' });

    expect(api.get).toHaveBeenCalledWith(
      '/search/contacts',
      expect.objectContaining({ params: { q: 'acme', page: 1 } }),
    );
    expect(result.contacts).toEqual(samplePayload.contacts);
  });

  it('searchMessages hits /search/messages and unwraps payload', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { payload: { messages: samplePayload.messages } },
    } as never);

    const result = await searchService.searchMessages({ q: 'hello' });

    expect(api.get).toHaveBeenCalledWith(
      '/search/messages',
      expect.objectContaining({ params: { q: 'hello', page: 1 } }),
    );
    expect(result.messages).toEqual(samplePayload.messages);
  });

  it('forwards the AbortSignal to axios', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { payload: samplePayload } } as never);

    const controller = new AbortController();
    await searchService.searchAll({ q: 'acme' }, controller.signal);

    expect(api.get).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('returns the response data as-is when the payload envelope is absent', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: samplePayload } as never);

    const result = await searchService.searchAll({ q: 'acme' });

    expect(result).toEqual(samplePayload);
  });

  it('rejects when the underlying request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network down'));

    await expect(searchService.searchAll({ q: 'acme' })).rejects.toThrow('network down');
  });
});
