import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@evoapi/design-system';
import { Activity, Clock, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useContactEvents } from '@/hooks/useContactEvents';
import ContactEventCard from './ContactEventCard';
import type { ContactEventsQueryParams, EventType } from '@/types/notifications';

interface ContactEventsTimelineProps {
  contactId: string;
  showHeader?: boolean;
  maxHeight?: string;
  initialLimit?: number;
}

// EVENT_TYPE_OPTIONS and EVENT_NAME_OPTIONS moved to component to access t()

export default function ContactEventsTimeline({
  contactId,
  showHeader = true,
  maxHeight = '600px',
  initialLimit = 20
}: ContactEventsTimelineProps) {
  const { t } = useLanguage('contacts');
  const {
    events,
    stats,
    loading,
    pagination,
    isEmpty,
    loadContactEvents,
    loadContactEventStats,
    handlePageChange,
    refreshEvents,
  } = useContactEvents();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactEventsQueryParams>({
    page: 1,
    limit: initialLimit,
  });

  const EVENT_TYPE_OPTIONS = [
    { value: '', label: t('events.types.all') },
    { value: 'identify', label: t('events.types.identify') },
    { value: 'track', label: t('events.types.track') },
    { value: 'page', label: t('events.types.page') },
    { value: 'screen', label: t('events.types.screen') },
    { value: 'segment', label: t('events.types.segment') },
  ];

  const EVENT_NAME_OPTIONS = [
    { value: '', label: t('events.names.all') },
    { value: 'contact_created', label: t('events.names.contactCreated') },
    { value: 'contact_updated', label: t('events.names.contactUpdated') },
    { value: 'label_added', label: t('events.names.labelAdded') },
    { value: 'label_removed', label: t('events.names.labelRemoved') },
    { value: 'custom_attribute_changed', label: t('events.names.customAttributeChanged') },
    { value: 'conversation_created', label: t('events.names.conversationCreated') },
    { value: 'conversation_updated', label: t('events.names.conversationUpdated') },
    { value: 'message_created', label: t('events.names.messageCreated') },
    { value: 'pipeline_conversation_created', label: t('events.names.pipelineCreated') },
    { value: 'pipeline_conversation_updated', label: t('events.names.pipelineUpdated') },
  ];

  // Load events on mount and when contactId changes
  useEffect(() => {
    if (contactId) {
      loadContactEvents(contactId, filters);
      loadContactEventStats(contactId, 30);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ContactEventsQueryParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadContactEvents(contactId, updatedFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshEvents(contactId, filters);
    loadContactEventStats(contactId, 30);
  };

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      handlePageChange(contactId, pagination.currentPage + 1, filters);
    }
  };

  // Expand all events
  const expandAll = () => {
    // TODO: Implement expand all functionality
    console.log('Expand all events');
  };

  // Collapse all events
  const collapseAll = () => {
    // TODO: Implement collapse all functionality
    console.log('Collapse all events');
  };

  if (loading.events && events.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin">
              <RefreshCw className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t('events.timeline.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{t('events.timeline.title')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats ? (
                      <>
                        {stats.totalEvents} {t('events.stats.events')} • {t('events.stats.last')}: {stats.lastEvent ?
                          new Date(stats.lastEvent).toLocaleDateString('pt-BR') : '-'}
                      </>
                    ) : (
                      t('events.stats.loading')
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('events.timeline.filters.title')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading.events}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading.events ? 'animate-spin' : ''}`} />
                  {t('events.timeline.filters.refresh')}
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('events.timeline.filters.eventType')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={filters.eventType || ''}
                      onChange={(e) => handleFilterChange({ eventType: e.target.value as EventType || undefined })}
                    >
                      {EVENT_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('events.timeline.filters.eventName')}</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={filters.eventName || ''}
                      onChange={(e) => handleFilterChange({ eventName: e.target.value || undefined })}
                    >
                      {EVENT_NAME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('events.timeline.filters.actions')}</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={expandAll}
                        className="flex-1"
                      >
                        <ChevronDown className="h-4 w-4 mr-1" />
                        {t('events.timeline.filters.expand')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapseAll}
                        className="flex-1"
                      >
                        <ChevronUp className="h-4 w-4 mr-1" />
                        {t('events.timeline.filters.collapse')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Events Timeline */}
      <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
        {isEmpty ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('events.timeline.empty.title')}</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {filters.eventType || filters.eventName
                  ? t('events.timeline.empty.withFilters')
                  : t('events.timeline.empty.description')}
              </p>
              {(filters.eventType || filters.eventName) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleFilterChange({ eventType: undefined, eventName: undefined })}
                >
                  {t('events.timeline.filters.clear')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {index < events.length - 1 && (
                  <div className="absolute left-4 top-16 w-0.5 h-8 bg-gray-200 z-0" />
                )}

                <ContactEventCard
                  event={event}
                />
              </div>
            ))}

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading.events}
                >
                  {loading.events ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('events.timeline.loading')}
                    </>
                  ) : (
                    t('events.timeline.loadMore', { remaining: pagination.totalItems - events.length })
                  )}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center text-sm text-muted-foreground py-2">
              {t('events.timeline.showing', { count: events.length, total: pagination.totalItems })}
              {pagination.totalPages > 1 && (
                <> • {t('events.timeline.page', { current: pagination.currentPage, total: pagination.totalPages })}</>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
