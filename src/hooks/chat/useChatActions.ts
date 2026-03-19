import { useCallback } from 'react';
import { useChatContext } from '@/contexts/chat/ChatContext';

export const useChatActions = () => {
  const {
    conversations,
    messages,
    filters,
    ui,
    loadConversationsWithFilters,
    selectConversationAndLoadMessages,
    applyFiltersAndReload,
    applySearchAndReload,
  } = useChatContext();

  // Convenience methods
  const openConversation = useCallback(
    async (conversationId: string) => {
      await selectConversationAndLoadMessages(conversationId);
    },
    [selectConversationAndLoadMessages],
  );

  const closeConversation = useCallback(() => {
    conversations.selectConversation(null);
  }, [conversations]);

  const refreshConversations = useCallback(async () => {
    if (filters.state.activeFilters.length > 0) {
      await applyFiltersAndReload(filters.state.activeFilters);
    } else {
      await loadConversationsWithFilters();
    }
  }, [filters.state.activeFilters, applyFiltersAndReload, loadConversationsWithFilters]);

  const clearFilters = useCallback(async () => {
    await applyFiltersAndReload([]);
  }, [applyFiltersAndReload]);

  const performSearch = useCallback(
    async (searchTerm: string) => {
      await applySearchAndReload(searchTerm);
    },
    [applySearchAndReload],
  );

  const sendMessageAction = useCallback(
    async (conversationId: string, content: string, isPrivate?: boolean) => {
      return await messages.sendMessage(conversationId, content, isPrivate);
    },
    [messages],
  );

  const sendMessageWithFilesAction = useCallback(
    async (
      conversationId: string,
      content: string,
      files: File[],
      isPrivate?: boolean,
      onUploadProgress?: (progress: number, fileName: string) => void,
    ) => {
      return await messages.sendMessageWithFiles(
        conversationId,
        content,
        files,
        isPrivate,
        null, // 👈 cannedResponseId
        onUploadProgress, // 👈 agora na posição certa
      );
    },
    [messages],
  );

  return {
    // Combined State Access
    conversationsState: conversations.state,
    messagesState: messages.state,
    filtersState: filters.state,
    uiState: ui.state,

    // Conversation actions
    loadConversations: loadConversationsWithFilters,
    selectConversation: conversations.selectConversation,
    updateConversationStatus: conversations.updateConversationStatus,
    openConversation,
    closeConversation,
    refreshConversations,

    // Message actions
    loadMessages: messages.loadMessages,
    sendMessage: sendMessageAction,
    sendMessageWithFiles: sendMessageWithFilesAction,
    onReplyToMessage: messages.onReplyToMessage,
    onCancelReply: messages.onCancelReply,
    onCopyMessage: messages.onCopyMessage,
    onDeleteMessage: messages.onDeleteMessage,

    // Filter actions
    applyFilters: applyFiltersAndReload,
    applySearch: applySearchAndReload,
    clearFilters,
    performSearch,
    setQuickFilter: filters.setQuickFilter,
    setSearchTerm: filters.setSearchTerm,

    // UI actions
    toggleContactDrawer: ui.toggleContactDrawer,
    setContactDrawer: ui.setContactDrawer,
    toggleSidebar: ui.toggleSidebar,
    setSidebarCollapsed: ui.setSidebarCollapsed,
  };
};
