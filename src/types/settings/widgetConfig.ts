export interface WorkingHours {
  day_of_week: number; // 0-6 (Sunday to Saturday)
  closed_all_day: boolean;
  open_all_day: boolean;
  open_hour: number;
  open_minutes: number;
  close_hour: number;
  close_minutes: number;
}

export interface WidgetConfiguration {
  // Basic Config
  avatarUrl: string;
  hasAConnectedAgentBot: string;
  locale: string;
  websiteName: string;
  websiteToken: string;
  welcomeTagline: string;
  welcomeTitle: string;
  widgetColor: string;
  
  // Feature Flags
  enabledFeatures: string[]; // ['emoji_picker', 'attachments', 'end_conversation', 'use_inbox_avatar_for_bot']
  enabledLanguages: Array<{name: string, iso_639_1_code: string}>;
  
  // Reply & Availability
  replyTime: 'in_a_few_minutes' | 'in_a_few_hours' | 'in_a_day';
  workingHoursEnabled: boolean;
  workingHours: WorkingHours[];
  outOfOfficeMessage: string;
  utcOffset: string; // e.g., "-03:00"
  timezone: string;   // e.g., "America/Sao_Paulo"
  
  // Forms
  preChatFormEnabled: boolean;
  preChatFormOptions: {
    pre_chat_message: string;
    pre_chat_fields: Array<{
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      required: boolean;
      enabled: boolean;
      field_type: 'contact_attribute' | 'conversation_attribute';
      values?: string[];
      regex_pattern?: string;
      regex_cue?: string;
    }>;
  };
  
  // Conversation Settings
  allowMessagesAfterResolved: boolean;
  csatSurveyEnabled: boolean;
  
  // Branding
  disableBranding: boolean;
  
  // Portal (Help Center)
  portal?: {
    name?: string;
    slug?: string;
    custom_domain?: string;
  };
}

// Conversation status constants (from Vue widget)
export const CONVERSATION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  PENDING: 'pending', 
  SNOOZED: 'snoozed',
} as const;

export type ConversationStatus = typeof CONVERSATION_STATUS[keyof typeof CONVERSATION_STATUS];

export interface WidgetConfigHook {
  // Feature flags helpers
  hasEmojiPickerEnabled: boolean;
  hasAttachmentsEnabled: boolean;
  hasEndConversationEnabled: boolean;
  useInboxAvatarForBot: boolean;
  
  // Availability helpers
  isInBusinessHours: boolean;
  replyWaitMessage: string;
  outOfOfficeMessage: string;
  
  // Pre-chat helpers
  shouldShowPreChatForm: boolean;
  
  // Working hours helpers
  currentDayAvailability: {
    closedAllDay: boolean;
    openAllDay: boolean;
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
  };
  
  // Conversation helpers
  hideReplyBox: boolean;
  showEmailTranscriptButton: boolean;
  canEndConversation: boolean;
}

// ============================================
// Widget Messages
// ============================================

export interface WidgetMessage {
  id?: string | number;
  conversation_id?: string;
  content: string;
  created_at?: string;
  message_type?: number; // 0=incoming, 1=outgoing, 2=activity, 3=template
  attachments?: unknown[];
  sender?: {
    name?: string;
    avatar_url?: string;
    available_name?: string;
  };
  content_attributes?: {
    in_reply_to?: string | number;
    deleted?: boolean;
    submitted_values?: unknown[];
    submitted_email?: string;
  };
}