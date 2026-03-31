import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AxiosError } from 'axios';
import notificationsService, { Notification } from '@/services/notifications/NotificationsService';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalWebSocket } from '@/hooks/useGlobalWebSocket';
import { playNotificationSound, getAudioSettings } from '@/utils/audioNotificationUtils';

interface NotificationsMeta {
  count: number;
  currentPage: number;
  unreadCount: number;
}

interface NotificationsUIFlags {
  isFetching: boolean;
  isFetchingItem: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingUnreadCount: boolean;
  isAllNotificationsLoaded: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  meta: NotificationsMeta;
  uiFlags: NotificationsUIFlags;
  notificationFilters: Record<string, any>;
}

type NotificationsAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; data: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_META'; payload: Partial<NotificationsMeta> }
  | { type: 'SET_UI_FLAGS'; payload: Partial<NotificationsUIFlags> }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'MARK_AS_READ'; payload: { id: string; read_at: string } }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SET_FILTERS'; payload: Record<string, any> };

const initialState: NotificationsState = {
  notifications: [],
  meta: {
    count: 0,
    currentPage: 1,
    unreadCount: 0,
  },
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isUpdating: false,
    isDeleting: false,
    isUpdatingUnreadCount: false,
    isAllNotificationsLoaded: false,
  },
  notificationFilters: {},
};

function notificationsReducer(
  state: NotificationsState,
  action: NotificationsAction,
): NotificationsState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };

    case 'ADD_NOTIFICATION': {
      // 🔒 PROTEÇÃO: Verificar se notificação já existe para evitar duplicação
      const notificationExists = state.notifications.some(n => n.id === action.payload.id);
      if (notificationExists) {
        return state;
      }

      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        meta: {
          ...state.meta,
          count: state.meta.count + 1,
          unreadCount: !action.payload.read_at
            ? state.meta.unreadCount + 1
            : state.meta.unreadCount,
        },
      };
    }

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.data }
            : notification,
        ),
      };

    case 'DELETE_NOTIFICATION': {
      const deletedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        meta: {
          ...state.meta,
          count: state.meta.count - 1,
          unreadCount:
            deletedNotification && !deletedNotification.read_at
              ? state.meta.unreadCount - 1
              : state.meta.unreadCount,
        },
      };
    }

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        meta: {
          ...state.meta,
          count: 0,
        },
      };

    case 'SET_META':
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.payload,
        },
      };

    case 'SET_UI_FLAGS':
      return {
        ...state,
        uiFlags: {
          ...state.uiFlags,
          ...action.payload,
        },
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        meta: {
          ...state.meta,
          unreadCount: action.payload,
        },
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, read_at: action.payload.read_at }
            : notification,
        ),
        meta: {
          ...state.meta,
          unreadCount: Math.max(0, state.meta.unreadCount - 1),
        },
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        })),
        meta: {
          ...state.meta,
          unreadCount: 0,
        },
      };

    case 'SET_FILTERS':
      return {
        ...state,
        notificationFilters: action.payload,
      };

    default:
      return state;
  }
}

interface NotificationsContextType {
  state: NotificationsState & { isWebSocketConnected?: boolean };
  actions: {
    fetchNotifications: (params?: {
      page?: number;
      status?: string;
      type?: string;
    }) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notification: Notification) => Promise<void>;
    markAsUnread: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllNotifications: (type?: 'all' | 'read') => Promise<void>;
    snoozeNotification: (id: string, snoozedUntil?: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
    updateNotification: (id: string, data: Partial<Notification>) => void;
    setFilters: (filters: Record<string, any>) => void;
  };
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: React.ReactNode;
}

const NotificationsProviderInner: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);
  const { user } = useAuth();
  const unreadCountRequestInFlightRef = React.useRef(false);
  const unreadCountBlockedUntilRef = React.useRef(0);

  const actions = {
    fetchNotifications: async (params: { page?: number; status?: string; type?: string } = {}) => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isFetching: true } });

      try {
        const response = await notificationsService.getNotifications(params);
        const notifications = response.data || [];
        const meta = response.meta;

        if (params.page === 1) {
          dispatch({ type: 'CLEAR_NOTIFICATIONS' });
        }

        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_META', payload: meta });

        if (notifications.length < 15) {
          dispatch({ type: 'SET_UI_FLAGS', payload: { isAllNotificationsLoaded: true } });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isFetching: false } });
      }
    },

    fetchUnreadCount: async () => {
      const now = Date.now();
      if (unreadCountRequestInFlightRef.current) return;
      if (unreadCountBlockedUntilRef.current > now) return;

      unreadCountRequestInFlightRef.current = true;
      dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdatingUnreadCount: true } });

      try {
        const response = await notificationsService.getUnreadCount();
        dispatch({ type: 'SET_UNREAD_COUNT', payload: response.count });
      } catch (error) {
        const status = (error as AxiosError)?.response?.status;
        if (status === 401) {
          // Prevent websocket/event storms from spamming unread_count while session is invalid.
          unreadCountBlockedUntilRef.current = Date.now() + 30_000;
        }
        console.error('❌ Error fetching unread count:', error);
      } finally {
        unreadCountRequestInFlightRef.current = false;
        dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdatingUnreadCount: false } });
      }
    },

    markAsRead: async (notification: Notification) => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: true } });

      try {
        await notificationsService.markAsRead('Conversation', notification.primary_actor_id);
        dispatch({
          type: 'MARK_AS_READ',
          payload: { id: notification.id, read_at: new Date().toISOString() },
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: false } });
      }
    },

    markAsUnread: async (id: string) => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: true } });

      try {
        await notificationsService.markAsUnread(id);
        dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, data: { read_at: null } } });
      } catch (error) {
        console.error('Error marking notification as unread:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: false } });
      }
    },

    markAllAsRead: async () => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: true } });

      try {
        await notificationsService.markAllAsRead();
        dispatch({ type: 'MARK_ALL_AS_READ' });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: false } });
      }
    },

    deleteNotification: async (id: string) => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isDeleting: true } });

      try {
        await notificationsService.deleteNotification(id);
        dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
      } catch (error) {
        console.error('Error deleting notification:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isDeleting: false } });
      }
    },

    deleteAllNotifications: async (type: 'all' | 'read' = 'all') => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isDeleting: true } });

      try {
        await notificationsService.deleteAll(type);
        if (type === 'all') {
          dispatch({ type: 'CLEAR_NOTIFICATIONS' });
          dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
        } else {
          // Remove only read notifications
          const unreadNotifications = state.notifications.filter(n => !n.read_at);
          dispatch({ type: 'SET_NOTIFICATIONS', payload: unreadNotifications });
          dispatch({ type: 'SET_META', payload: { count: unreadNotifications.length } });
        }
      } catch (error) {
        console.error('Error deleting all notifications:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isDeleting: false } });
      }
    },

    snoozeNotification: async (id: string, snoozedUntil?: string) => {
      dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: true } });

      try {
        const response = await notificationsService.snoozeNotification(id, snoozedUntil);
        dispatch({
          type: 'UPDATE_NOTIFICATION',
          payload: { id, data: { snoozed_until: response.snoozed_until } as any },
        });
      } catch (error) {
        console.error('Error snoozing notification:', error);
      } finally {
        dispatch({ type: 'SET_UI_FLAGS', payload: { isUpdating: false } });
      }
    },

    addNotification: (notification: Notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },

    updateNotification: (id: string, data: Partial<Notification>) => {
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, data } });
    },

    setFilters: (filters: Record<string, any>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    },
  };

  // Callbacks for WebSocket events (usando useCallback para evitar re-criação)
  const handleNotificationCreated = useCallback(
    (data: any) => {
      // Mapear dados do WebSocket para o formato Notification
      // O WebSocket pode enviar dados em diferentes formatos (data.notification ou data direto)
      const notificationData = data.notification || data;

      const notification: Notification = {
        id: notificationData.id || notificationData.notification_id || '',
        notification_type: notificationData.notification_type || notificationData.type || '',
        primary_actor_id:
          notificationData.primary_actor_id || notificationData.conversation_id || '',
        primary_actor:
          notificationData.primary_actor ||
          (notificationData.primary_actor_id ? { id: notificationData.primary_actor_id } : null),
        push_message_title:
          notificationData.push_message_title ||
          notificationData.message ||
          notificationData.content ||
          notificationData.title ||
          '',
        last_activity_at:
          notificationData.last_activity_at ||
          notificationData.created_at ||
          notificationData.updated_at ||
          new Date().toISOString(),
        read_at: notificationData.read_at || null,
        primary_actor_meta: notificationData.primary_actor_meta || null,
      };

      actions.addNotification(notification);
      actions.fetchUnreadCount();

      // Verificar se a conversa relacionada à notificação está aberta
      // A notificação pode ter primary_actor_id (ID da conversa) ou conversation_id
      const conversationId =
        notificationData.primary_actor_id ||
        notificationData.conversation_id ||
        data.conversation_id ||
        data.primary_actor_id ||
        null;

      const isConversationOpen = (() => {
        if (!conversationId) {
          // Se não há conversationId, não podemos verificar - permitir notificação
          return false;
        }

        // Verificar URL primeiro (fonte da verdade)
        const urlPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const urlMatch = urlPath.match(/\/conversations\/(\d+)/);
        const urlConversationId = urlMatch ? urlMatch[1] : null;

        // Comparar IDs normalizados (ambos como string)
        if (urlConversationId && String(urlConversationId) === String(conversationId)) {
          return true;
        }

        return false;
      })();

      if (isConversationOpen) {
        return; // Não tocar som nem mostrar notificação se a conversa está aberta
      }

      // Play notification sound if enabled
      const audioSettings = getAudioSettings();

      if (audioSettings.enable_audio_alerts) {
        // Check if notification is for an assigned conversation
        // Notification types that indicate assigned conversations:
        const assignedConversationTypes = [
          'assigned_conversation_new_message',
          'conversation_assignment',
          'conversation_mention',
        ];

        const notificationType =
          data.notification_type || data.notification?.notification_type || '';
        const isAssignedConversationNotification =
          assignedConversationTypes.includes(notificationType);

        // Check if there are unread assigned conversations
        // This function is used to check the condition "alert_if_unread_assigned_conversation_exist"
        const checkUnreadConversations = () => {
          // If this is an assigned conversation notification, we know there's an unread assigned conversation
          if (isAssignedConversationNotification) {
            return true;
          }
          // For other notification types, check if there are unread notifications
          // Note: This is a simplified check - ideally we'd check specifically for assigned conversations
          const hasUnread = state.meta.unreadCount > 0;
          return hasUnread;
        };

        // Use setTimeout to ensure state is updated before checking
        setTimeout(() => {
          playNotificationSound(audioSettings, checkUnreadConversations).catch(error => {
            console.error('❌ Error playing notification sound:', error);
          });
        }, 100);
      }
    },
    [state.meta.unreadCount, actions],
  );

  const handleNotificationDeleted = useCallback((data: any) => {
    if (data.id) {
      actions.deleteNotification(data.id);
    }
  }, []);

  const handleNotificationUpdated = useCallback((data: any) => {
    if (data.id) {
      actions.updateNotification(data.id, data);
    }
  }, []);

  // Initialize global WebSocket connection for real-time notifications and messages
  const { isConnected } = useGlobalWebSocket({
    onNotificationCreated: handleNotificationCreated,
    onNotificationDeleted: handleNotificationDeleted,
    onNotificationUpdated: handleNotificationUpdated,
    onMessageCreated: (data: any) => {
      // When a new message arrives, refresh notifications and play sound if needed
      actions.fetchUnreadCount();

      // Play sound if conversation is assigned to current user
      if (user && data.conversation_id) {
        // We'll handle sound playing in ChatContext, but we can trigger notification refresh here
        // The sound will be played by ChatContext when it processes the message
      }
    },
    onConversationUpdated: (_data: any) => {
      // Refresh notifications when conversation is updated
      actions.fetchUnreadCount();
    },
  });

  // Fetch unread count on mount
  useEffect(() => {
    if (user) {
      actions.fetchUnreadCount();
    }
  }, [user?.id]);

  const value = {
    state: {
      ...state,
      isWebSocketConnected: isConnected,
    },
    actions,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  // Always render the inner provider, but handle errors gracefully
  // The inner provider will handle cases where auth/organization are not available
  return <NotificationsProviderInner>{children}</NotificationsProviderInner>;
};
