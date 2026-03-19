import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, Badge, Button } from '@evoapi/design-system';
import {
  Clock,
  User,
  Activity,
  Globe,
  Smartphone,
  Users,
  UserPlus,
  UserCheck,
  Tag,
  X,
  Settings,
  MessageCircle,
  MessageSquare,
  Send,
  GitBranch,
  GitMerge,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { ContactEvent, EventType } from '@/types/notifications';

interface ContactEventCardProps {
  event: ContactEvent;
}

// Enhanced icon mapping with more event types
const getEventIcon = (eventType: EventType, eventName: string) => {
  const eventNameIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    // Contact events
    contact_created: UserPlus,
    contact_updated: UserCheck,

    // Label events
    label_added: Tag,
    label_removed: X,

    // Custom attribute events
    custom_attribute_changed: Settings,

    // Conversation events
    conversation_created: MessageCircle,
    conversation_updated: MessageSquare,
    conversation_deleted: XCircle,

    // Message events
    message_created: Send,
    message_updated: FileText,
    message_deleted: XCircle,

    // Pipeline events
    pipeline_conversation_created: GitBranch,
    pipeline_conversation_updated: GitMerge,
    pipeline_conversation_added: GitBranch,
    pipeline_conversation_deleted: XCircle,
    pipeline_stage_changed: TrendingUp,
    pipeline_custom_fields_updated: Settings,

    // Segment events
    segment_entered: CheckCircle,
    segment_exited: XCircle,
  };

  if (eventNameIcons[eventName]) {
    return eventNameIcons[eventName];
  }

  const eventTypeIcons: Record<EventType, React.ComponentType<{ className?: string }>> = {
    identify: User,
    track: Activity,
    page: Globe,
    screen: Smartphone,
    segment: Users,
  };

  return eventTypeIcons[eventType] || Activity;
};

// Enhanced event name formatting
const formatEventName = (eventName: string, t: (key: string, options?: Record<string, unknown>) => string) => {
  const translationKey = `events.names.${eventName}`;
  const translated = t(translationKey);

  // If translation exists and is different from the key, return it
  if (translated && translated !== translationKey) {
    return translated;
  }

  // Fallback to formatted event name
  return eventName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get event description for better understanding
const getEventDescription = (event: ContactEvent, t: (key: string, options?: Record<string, unknown>) => string) => {
  const { eventName, properties } = event;

  switch (eventName) {
    case 'contact_created':
      return t('events.descriptions.contact_created');
    case 'contact_updated':
      return t('events.descriptions.contact_updated', { count: properties?.changeCount || 0 });
    case 'label_added':
      return t('events.descriptions.label_added', { labelName: properties?.labelName });
    case 'label_removed':
      return t('events.descriptions.label_removed', { labelName: properties?.labelName });
    case 'custom_attribute_changed':
      return t('events.descriptions.custom_attribute_changed', { attributeName: properties?.attributeName });
    case 'conversation_created':
      return t('events.descriptions.conversation_created', { inbox_name: properties?.inbox_name });
    case 'conversation_updated': {
      const changes = properties?.changes;
      if (changes && Array.isArray(changes)) {
        return `${t('events.descriptions.conversation_updated', { count: 0 }).split('(')[0]}: ${changes.join(', ').replace(/_/g, ' ')}`;
      }
      return t('events.descriptions.conversation_updated', { count: properties?.changes?.length || 0 });
    }
    case 'message_created': {
      const messageType =
        properties?.message_type === 'incoming' ? t('events.descriptions.message_created_incoming') : t('events.descriptions.message_created_outgoing');
      const contentPreview = properties?.content
        ? ` - "${String(properties.content).substring(0, 50)}${
            String(properties.content).length > 50 ? '...' : ''
          }"`
        : '';
      return `Mensagem ${messageType}${contentPreview}`;
    }
    case 'pipeline_conversation_added':
    case 'pipeline_conversation_created':
      return t('events.descriptions.pipeline_added', {
        pipeline_name: properties?.pipeline_name,
        pipeline_stage_name: properties?.pipeline_stage_name
      });
    case 'pipeline_stage_changed':
      return t('events.descriptions.pipeline_stage_changed', {
        pipeline_name: properties?.pipeline_name,
        old_stage_name: properties?.old_stage_name,
        new_stage_name: properties?.new_stage_name
      });
    case 'pipeline_custom_fields_updated':
      return t('events.descriptions.pipeline_custom_fields', {
        pipeline_name: properties?.pipeline_name,
        value: properties?.services_total_value ? `R$ ${properties.services_total_value}` : 'N/A'
      });
    case 'segment_entered':
      return t('events.descriptions.segment_entered', { segmentName: properties?.segmentName });
    case 'segment_exited':
      return t('events.descriptions.segment_exited', { segmentName: properties?.segmentName });
    default:
      return t('events.descriptions.system');
  }
};

// Get event icon color
const getEventIconColor = (eventType: EventType) => {
  switch (eventType) {
    case 'identify':
      return 'text-blue-600 bg-blue-100';
    case 'track':
      return 'text-green-600 bg-green-100';
    case 'segment':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-primary bg-primary/10';
  }
};

// Format date for display
const formatDate = (dateString: string, t: (key: string, options?: Record<string, unknown>) => string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return t('events.timeline.ago.minutes', { count: minutes });
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return t('events.timeline.ago.hours', { count: hours });
  } else if (diffInHours < 48) {
    return t('events.timeline.ago.yesterday');
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

// Format property value for display
const formatPropertyValue = (key: string, value: unknown, t: (key: string, options?: Record<string, unknown>) => string): string => {
  if (value === null || value === undefined) return '-';

  // Special formatting for specific keys
  if (key.includes('_at') || key.includes('timestamp')) {
    try {
      return new Date(String(value)).toLocaleString('pt-BR');
    } catch {
      return String(value);
    }
  }

  if (key.includes('_id') && typeof value === 'string') {
    return value.substring(0, 8) + '...';
  }

  if (typeof value === 'boolean') {
    return value ? t('events.card.yes') : t('events.card.no');
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const getEventBagdeClassColor = (eventType: EventType) => {
  switch (eventType) {
    case 'identify':
      return 'bg-blue-500 text-blue-900';
    case 'track':
      return 'bg-green-500 text-green-900';
    case 'segment':
      return 'bg-purple-500 text-purple-900';
    default:
      return 'bg-primary text-primary-900';
  }
};

export default function ContactEventCard({ event }: ContactEventCardProps) {
  const { t } = useLanguage('contacts');
  const [showDetails, setShowDetails] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showTraits, setShowTraits] = useState(false);

  const Icon = getEventIcon(event.eventType, event.eventName);
  const iconColor = getEventIconColor(event.eventType);
  const badgeClassColor = getEventBagdeClassColor(event.eventType);
  const description = getEventDescription(event, t);

  const hasProperties = event.properties && Object.keys(event.properties).length > 0;
  const hasTraits = event.traits && Object.keys(event.traits).length > 0;
  const hasDetails = hasProperties || hasTraits;

  // Filter out internal properties for cleaner display
  const filteredProperties = hasProperties
    ? Object.entries(event.properties).filter(
        ([key]) => !['source', 'messageId', 'anonymousId'].includes(key),
      )
    : [];

  return (
    <Card className="group relative bg-sidebar border-sidebar-border hover:bg-sidebar-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 overflow-hidden">
      <CardContent className="p-0">
        {/* Main Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Event Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-sidebar-foreground truncate">
                  {formatEventName(event.eventName, t)}
                </h3>
                <Badge variant="default" className={`text-xs ${badgeClassColor}`}>
                  {event.eventType}
                </Badge>
              </div>

              <p className="text-xs text-sidebar-foreground/70 mb-2 line-clamp-2">{description}</p>

              <div className="flex items-center gap-3 text-xs text-sidebar-foreground/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(event.occurredAt, t)}</span>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={() => setShowDetails(!showDetails)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {showDetails && hasDetails && (
          <div className="border-t border-sidebar-border bg-sidebar-accent/20">
            {/* Event-specific Rich Content */}

            {/* Conversation Updates */}
            {event.eventName === 'conversation_updated' && event.properties?.changes && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t('events.card.conversationChanges')}
                </h4>
                <div className="space-y-2">
                  {event.properties.changes.map((change: string, index: number) => (
                    <div
                      key={index}
                      className="bg-sidebar border border-sidebar-border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-sidebar-foreground capitalize">
                          {change.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {t('events.card.modified')}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-sidebar-foreground/70">
                        {change === 'updated_at' && t('events.card.conversationFields.updated_at')}
                        {change === 'waiting_since' && t('events.card.conversationFields.waiting_since')}
                        {change === 'first_reply_created_at' && t('events.card.conversationFields.first_reply_created_at')}
                        {change === 'cached_label_list' && t('events.card.conversationFields.cached_label_list')}
                        {change === 'status' && t('events.card.conversationFields.status')}
                        {change === 'assignee_last_seen_at' && t('events.card.conversationFields.assignee_last_seen_at')}
                        {![
                          'updated_at',
                          'waiting_since',
                          'first_reply_created_at',
                          'cached_label_list',
                          'status',
                          'assignee_last_seen_at',
                        ].includes(change) && t('events.card.conversationFields.generic', { field: change })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-sidebar-foreground/60 flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  <span>{t('events.card.inbox', { name: event.properties.inbox_name })}</span>
                  <span>•</span>
                  <span>{t('events.card.channelType', { type: event.properties.channel_type?.replace('Channel::', '') })}</span>
                </div>
              </div>
            )}

            {/* Contact Updates */}
            {event.eventName === 'contact_updated' && event.properties?.changeDetails && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {t('events.card.contactChanges')}
                </h4>
                <div className="space-y-3">
                  {event.properties.changeDetails.map(
                    (
                      change: { field: string; old: string; new: string; type: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="bg-sidebar border border-sidebar-border rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              change.type === 'added'
                                ? 'bg-success'
                                : change.type === 'removed'
                                ? 'bg-destructive'
                                : 'bg-warning'
                            }`}
                          />
                          <span className="text-xs font-medium text-sidebar-foreground capitalize">
                            {change.field.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {change.type === 'added'
                              ? t('events.card.changeTypes.added')
                              : change.type === 'removed'
                              ? t('events.card.changeTypes.removed')
                              : t('events.card.changeTypes.modified')}
                          </Badge>
                        </div>
                        {change.type !== 'added' && (
                          <div className="flex items-center gap-3 text-xs mb-2">
                            <div className="flex-1">
                              <span className="text-sidebar-foreground/60 uppercase font-medium">
                                {t('events.card.previous')}
                              </span>
                              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-2 py-1 rounded mt-1 font-mono text-xs">
                                {change.old || '-'}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sidebar-foreground/60 uppercase font-medium">
                                {t('events.card.new')}
                              </span>
                              <div className="bg-success/10 border border-success/20 text-success px-2 py-1 rounded mt-1 font-mono text-xs">
                                {change.new || '-'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Pipeline Added */}
            {(event.eventName === 'pipeline_conversation_added' ||
              event.eventName === 'pipeline_conversation_created') && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  {t('events.card.pipelineAdded')}
                </h4>
                <div className="bg-sidebar border border-sidebar-border rounded-lg p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">{t('events.card.pipeline')}</span>
                      <Badge variant="default" className="text-xs">
                        {event.properties?.pipeline_name || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">{t('events.card.initialStage')}</span>
                      <Badge variant="secondary" className="text-xs">
                        {event.properties?.pipeline_stage_name || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Stage Change */}
            {event.eventName === 'pipeline_stage_changed' && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('events.card.stageChange')}
                </h4>
                <div className="bg-sidebar border border-sidebar-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-sidebar-foreground/60">Pipeline:</span>
                    <Badge variant="outline" className="text-xs">
                      {event.properties?.pipeline_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded">
                        <div className="text-xs font-medium">
                          {event.properties?.old_stage_name}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sidebar-foreground/40" />
                    <div className="flex-1 text-center">
                      <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded">
                        <div className="text-xs font-medium">
                          {event.properties?.new_stage_name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-sidebar-foreground/60">
                    <span>{t('events.card.daysInPipeline', { days: event.properties?.days_in_pipeline || 0 })}</span>
                    <span>
                      {t('events.card.daysInStage', { days: event.properties?.days_in_current_stage || 0 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Custom Fields */}
            {event.eventName === 'pipeline_custom_fields_updated' &&
              event.properties?.custom_fields && (
                <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('events.card.services')}
                </h4>
                  <div className="bg-sidebar border border-sidebar-border rounded-lg p-3">
                    {event.properties.custom_fields.services?.map(
                      (service: { name: string; value: string }, index: number) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="text-xs text-sidebar-foreground">{service.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            R$ {service.value}
                          </Badge>
                        </div>
                      ),
                    )}
                    <div className="border-t border-sidebar-border mt-2 pt-2 flex justify-between items-center">
                      <span className="text-xs font-medium text-sidebar-foreground">{t('events.card.total')}</span>
                      <Badge variant="default" className="text-xs">
                        R$ {event.properties.services_total_value}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

            {/* Message Content */}
            {event.eventName === 'message_created' && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t('events.card.message')}
                  <Badge
                    variant={
                      event.properties?.message_type === 'incoming' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {event.properties?.message_type === 'incoming'
                      ? t('events.card.messageTypes.incoming')
                      : t('events.card.messageTypes.outgoing')}
                  </Badge>
                </h4>

                {event.properties?.content && (
                  <div
                    className={`border rounded-lg p-3 ${
                      event.properties.message_type === 'incoming'
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-green-50 border-green-200 text-green-900'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap">{event.properties.content}</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-sidebar-foreground/60 flex items-center gap-2">
                  <span>{t('events.card.type', { type: event.properties?.content_type || 'text' })}</span>
                  <span>•</span>
                  <span>
                    {t('events.card.channel', { channel: event.properties?.channel_type?.replace('Channel::', '') || 'N/A' })}
                  </span>
                  {event.properties?.message_id && (
                    <>
                      <span>•</span>
                      <span>ID: {String(event.properties.message_id).substring(0, 8)}...</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Label Events */}
            {(event.eventName === 'label_added' || event.eventName === 'label_removed') && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  {event.eventName === 'label_added' ? (
                    <Tag className="w-4 h-4 text-success" />
                  ) : (
                    <X className="w-4 h-4 text-destructive" />
                  )}
                  <span>
                    {event.eventName === 'label_added' ? t('events.card.labelAdded') : t('events.card.labelRemoved')}
                  </span>
                </h4>
                <Badge
                  variant={event.eventName === 'label_added' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {event.properties?.labelName || t('events.card.labelUnknown')}
                </Badge>
              </div>
            )}

            {/* Custom Attribute Change */}
            {event.eventName === 'custom_attribute_changed' && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t('events.card.customAttribute')}
                </h4>
                <div className="bg-sidebar border border-sidebar-border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-sidebar-foreground/60">{t('events.card.attribute')}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.properties?.attributeName}
                    </Badge>
                  </div>
                  {event.properties?.oldValue && (
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex-1">
                        <span className="text-sidebar-foreground/60">{t('events.card.previous')}</span>
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-2 py-1 rounded mt-1">
                          {formatPropertyValue('oldValue', event.properties.oldValue, t)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sidebar-foreground/40" />
                      <div className="flex-1">
                        <span className="text-sidebar-foreground/60">{t('events.card.new')}</span>
                        <div className="bg-success/10 border border-success/20 text-success px-2 py-1 rounded mt-1">
                          {formatPropertyValue('attributeValue', event.properties?.attributeValue, t)}
                        </div>
                      </div>
                    </div>
                  )}
                  {!event.properties?.oldValue && (
                    <div className="text-xs">
                      <span className="text-sidebar-foreground/60">{t('events.card.value')}</span>
                      <div className="bg-success/10 border border-success/20 text-success px-2 py-1 rounded mt-1">
                        {formatPropertyValue('attributeValue', event.properties?.attributeValue, t)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Segment Events */}
            {event.eventType === 'segment' && (
              <div className="p-4 border-b border-sidebar-border">
                <h4 className="text-sm font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.properties?.changeType === 'entered'
                      ? t('events.card.segment.entered')
                      : t('events.card.segment.exited')}
                  </span>
                </h4>
                <Badge
                  variant={event.properties?.changeType === 'entered' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {event.properties?.segmentName}
                </Badge>
              </div>
            )}

            {/* Properties Section */}
            {filteredProperties.length > 0 && (
              <div className="border-b border-sidebar-border">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto text-left"
                  onClick={() => setShowProperties(!showProperties)}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t('events.card.properties', { count: filteredProperties.length })}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${showProperties ? 'rotate-90' : ''}`}
                  />
                </Button>
                {showProperties && (
                  <div className="px-4 pb-4">
                    <div className="bg-sidebar border border-sidebar-border rounded-lg p-3 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredProperties.map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-start gap-2 py-1 border-b border-sidebar-border/50 last:border-0"
                          >
                            <span className="text-xs text-sidebar-foreground/60 font-medium min-w-0 flex-shrink-0">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-xs text-sidebar-foreground font-mono text-right break-all">
                              {formatPropertyValue(key, value, t)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Traits Section */}
            {hasTraits && (
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto text-left"
                  onClick={() => setShowTraits(!showTraits)}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t('events.card.traits', { count: Object.keys(event.traits).length })}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${showTraits ? 'rotate-90' : ''}`}
                  />
                </Button>
                {showTraits && (
                  <div className="px-4 pb-4">
                    <div className="bg-sidebar border border-sidebar-border rounded-lg p-3 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {Object.entries(event.traits).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-start gap-2 py-1 border-b border-sidebar-border/50 last:border-0"
                          >
                            <span className="text-xs text-sidebar-foreground/60 font-medium min-w-0 flex-shrink-0">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-xs text-sidebar-foreground font-mono text-right break-all">
                              {formatPropertyValue(key, value, t)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
