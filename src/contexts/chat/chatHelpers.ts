import { useChatContext } from '@/contexts/chat/ChatContext';

// Legacy exports for backward compatibility
export function useChatMessages() {
  const context = useChatContext();
  return context.messages;
}

export function useChatConversations() {
  const context = useChatContext();
  return context.conversations;
}

export function useChatFilters() {
  const context = useChatContext();
  return context.filters;
}

export function useChatWebSocket() {
  const context = useChatContext();
  return context.websocket;
}

export function useChatUI() {
  const context = useChatContext();
  return context.ui;
}
