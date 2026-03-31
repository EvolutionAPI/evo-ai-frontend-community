import { PaginationMeta } from '@/types/core';

// Notification metadata
export interface NotificationMeta {
  assignee?: {
    name: string;
    thumbnail: string;
  };
}

// Notification entity
export interface Notification {
  id: string;
  notification_type: string;
  primary_actor_id: string;
  primary_actor: { id: string } | null;
  push_message_title: string;
  last_activity_at: string;
  read_at: string | null;
  primary_actor_meta?: NotificationMeta | null;
}

// Notification list response
export interface NotificationsResponse {
  data: Notification[];
  meta: PaginationMeta & {
    count: number;
    currentPage: number;
    unreadCount: number;
  };
}

// Unread count response
export interface UnreadCountResponse {
  count: number;
}

// Notification settings
export interface NotificationSettings {
  id: string;
  user_id: string;
  all_email_flags: string[];
  selected_email_flags: string[];
  all_push_flags: string[];
  selected_push_flags: string[];
}

// Response types
import type { StandardResponse } from '@/types/core';

export interface NotificationDeleteResponse extends StandardResponse<{ message: string }> {}
