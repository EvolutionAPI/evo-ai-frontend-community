import { beforeEach, describe, expect, it } from 'vitest';
import { conversationsReducer } from './ConversationsContextReducer';
import { initialState } from '@/types/chat/conversations';

const makeConversation = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'conversation-1',
    uuid: 'conversation-1',
    unread_count: 5,
    status: 'open',
    ...overrides,
  }) as any;

describe('ConversationsContext reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes selected conversation id and clears unread count on select', () => {
    const state = {
      ...initialState,
      conversations: [makeConversation()],
      unreadCounts: { 'conversation-1': 5 },
    };

    const nextState = conversationsReducer(state, {
      type: 'SELECT_CONVERSATION',
      payload: 'conversation-1',
    });

    expect(nextState.selectedConversationId).toBe('conversation-1');
    expect(nextState.unreadCounts['conversation-1']).toBe(0);
    expect(nextState.conversations[0].unread_count).toBe(0);
  });

  it('keeps selected conversation unread count at zero on UPDATE_CONVERSATION', () => {
    const state = {
      ...initialState,
      selectedConversationId: 'conversation-1',
      selectedConversationData: makeConversation({ unread_count: 0 }),
      conversations: [makeConversation({ unread_count: 0 })],
      unreadCounts: { 'conversation-1': 0 },
    };

    const nextState = conversationsReducer(state, {
      type: 'UPDATE_CONVERSATION',
      payload: makeConversation({ unread_count: 9 }),
    });

    expect(nextState.conversations[0].unread_count).toBe(0);
    expect(nextState.selectedConversationData?.unread_count).toBe(0);
  });

  it('honors localStorage read state when setting conversations', () => {
    localStorage.setItem(
      'crm-chat-state',
      JSON.stringify({ readConversations: { 'conversation-1': true } }),
    );

    const nextState = conversationsReducer(initialState, {
      type: 'SET_CONVERSATIONS',
      payload: {
        conversations: [makeConversation({ unread_count: 4 })],
        pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
      },
    });

    expect(nextState.conversations[0].unread_count).toBe(0);
  });
});
