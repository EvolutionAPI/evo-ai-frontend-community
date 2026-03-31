// Contact Events Types - Based on evo-campaign implementation

import type { StandardResponse } from '@/types/core';

export enum EventType {
  IDENTIFY = 'identify',
  TRACK = 'track',
  PAGE = 'page',
  SCREEN = 'screen',
  SEGMENT = 'segment',
}

export interface ContactEvent {
  id: string;
  contactId: string;
  eventType: EventType;
  eventName: string;
  properties: Record<string, any>;
  traits: Record<string, any>;
  anonymousId?: string;
  messageId?: string;
  occurredAt: string; // ISO date string
  processingTime: string; // ISO date string
  source: 'postgres' | 'clickhouse' | 'evo-ai-crm';
}

export interface ContactEventsQueryParams {
  eventType?: EventType;
  eventName?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  page?: number;
  limit?: number;
  source?: 'auto' | 'postgres' | 'clickhouse';
}

export interface ContactEventsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactEventsMetadata {
  source: 'postgres' | 'clickhouse' | 'hybrid';
  queryTime: number;
  cachedUntil?: string; // ISO date string
}

export interface ContactEventsResponse extends StandardResponse<ContactEvent[]> {
  pagination: ContactEventsPagination;
  metadata: ContactEventsMetadata;
}

export interface ContactEventStats {
  totalEvents: number;
  firstEvent?: string; // ISO date string
  lastEvent?: string; // ISO date string
  eventsByType: Record<string, number>;
  eventsByName: Record<string, number>;
  eventsLast7Days: number;
  eventsLast30Days: number;
  avgEventsPerDay: number;
}

export interface ContactEventStatsResponse extends StandardResponse<ContactEventStats> {
  metadata: ContactEventsMetadata;
}

// Event display helpers
export interface EventDisplayConfig {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const EVENT_TYPE_CONFIGS: Record<EventType, EventDisplayConfig> = {
  [EventType.IDENTIFY]: {
    icon: 'User',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  [EventType.TRACK]: {
    icon: 'Activity',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  [EventType.PAGE]: {
    icon: 'Globe',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  [EventType.SCREEN]: {
    icon: 'Smartphone',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  [EventType.SEGMENT]: {
    icon: 'Users',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

// Event name specific configs
export const EVENT_NAME_CONFIGS: Record<string, Partial<EventDisplayConfig>> = {
  contact_created: {
    icon: 'UserPlus',
    color: 'text-blue-600',
  },
  contact_updated: {
    icon: 'UserCheck',
    color: 'text-blue-500',
  },
  label_added: {
    icon: 'Tag',
    color: 'text-green-600',
  },
  label_removed: {
    icon: 'X',
    color: 'text-red-600',
  },
  custom_attribute_changed: {
    icon: 'Settings',
    color: 'text-purple-600',
  },
  conversation_created: {
    icon: 'MessageCircle',
    color: 'text-blue-600',
  },
  conversation_updated: {
    icon: 'MessageSquare',
    color: 'text-blue-500',
  },
  message_created: {
    icon: 'Send',
    color: 'text-green-600',
  },
  pipeline_conversation_created: {
    icon: 'GitBranch',
    color: 'text-purple-600',
  },
  pipeline_conversation_updated: {
    icon: 'GitMerge',
    color: 'text-purple-500',
  },
};
