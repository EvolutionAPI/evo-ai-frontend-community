import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { contactEventsService } from '@/services/contacts/contactEventsService';
import type {
  ContactEvent,
  ContactEventsQueryParams,
  ContactEventStats,
} from '@/types/notifications';

interface UseContactEventsState {
  events: ContactEvent[];
  stats: ContactEventStats | null;
  loading: {
    events: boolean;
    stats: boolean;
    recent: boolean;
  };
  pagination: {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  metadata: {
    source: 'postgres' | 'clickhouse' | 'hybrid';
    queryTime: number;
    cachedUntil?: Date;
  } | null;
}

const INITIAL_STATE: UseContactEventsState = {
  events: [],
  stats: null,
  loading: {
    events: false,
    stats: false,
    recent: false,
  },
  pagination: {
    currentPage: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  metadata: null,
};

export function useContactEvents() {
  const [state, setState] = useState<UseContactEventsState>(INITIAL_STATE);
  const hasLoaded = useRef(false);

  // Load contact events with pagination and filters
  const loadContactEvents = useCallback(
    async (contactId: string, params: ContactEventsQueryParams = {}) => {
      if (!contactId) {
        console.warn('Missing contactId for loading events');
        return null;
      }

      setState(prev => ({ ...prev, loading: { ...prev.loading, events: true } }));

      try {
        const response = await contactEventsService.getContactEvents(contactId, {
          page: 1,
          limit: 20,
          ...params,
        });

        setState(prev => ({
          ...prev,
          events: response.data,
          pagination: {
            currentPage: response.pagination.page,
            limit: response.pagination.limit,
            totalItems: response.pagination.total,
            totalPages: response.pagination.totalPages,
            hasPreviousPage: response.pagination.hasPrev,
            hasNextPage: response.pagination.hasNext,
          },
          metadata: {
            source: response.metadata.source,
            queryTime: response.metadata.queryTime,
            cachedUntil: response.metadata.cachedUntil
              ? new Date(response.metadata.cachedUntil)
              : undefined,
          },
          loading: { ...prev.loading, events: false },
        }));

        return response;
      } catch (error) {
        console.error('❌ ContactEvents: Error loading events:', error);
        toast.error('Erro ao carregar eventos do contato');
        setState(prev => ({ ...prev, loading: { ...prev.loading, events: false } }));
        return null;
      }
    },
    [],
  );

  // Load contact event statistics
  const loadContactEventStats = useCallback(async (contactId: string, days: number = 30) => {
    if (!contactId) {
      console.warn('Missing contactId for loading stats');
      return null;
    }

    setState(prev => ({ ...prev, loading: { ...prev.loading, stats: true } }));

    try {
      const response = await contactEventsService.getContactEventStats(contactId, days);

      // A API retorna os dados diretamente, não dentro de uma propriedade 'stats'
      const statsData = response.data || response;

      setState(prev => ({
        ...prev,
        stats: statsData,
        loading: { ...prev.loading, stats: false },
      }));

      return response;
    } catch (error) {
      console.error('❌ ContactEvents: Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas de eventos');
      setState(prev => ({ ...prev, loading: { ...prev.loading, stats: false } }));
      return null;
    }
  }, []);

  // Load recent events for dashboard
  const loadRecentEvents = useCallback(
    async (
      params: {
        limit?: number;
        eventTypes?: string[];
        contactIds?: string[];
      } = {},
    ) => {
      setState(prev => ({ ...prev, loading: { ...prev.loading, recent: true } }));

      try {
        const response = await contactEventsService.getRecentEvents(params);

        setState(prev => ({
          ...prev,
          events: response.data,
          pagination: {
            currentPage: response.pagination.page,
            limit: response.pagination.limit,
            totalItems: response.pagination.total,
            totalPages: response.pagination.totalPages,
            hasPreviousPage: response.pagination.hasPrev,
            hasNextPage: response.pagination.hasNext,
          },
          loading: { ...prev.loading, recent: false },
        }));

        return response;
      } catch (error) {
        console.error('❌ ContactEvents: Error loading recent events:', error);
        toast.error('Erro ao carregar eventos recentes');
        setState(prev => ({ ...prev, loading: { ...prev.loading, recent: false } }));
        return null;
      }
    },
    [],
  );

  // Handle pagination
  const handlePageChange = useCallback(
    async (contactId: string, page: number, params: ContactEventsQueryParams = {}) => {
      await loadContactEvents(contactId, { ...params, page });
    },
    [loadContactEvents],
  );

  // Handle per page change
  const handlePerPageChange = useCallback(
    async (contactId: string, limit: number, params: ContactEventsQueryParams = {}) => {
      await loadContactEvents(contactId, { ...params, limit, page: 1 });
    },
    [loadContactEvents],
  );

  // Clear events
  const clearEvents = useCallback(() => {
    setState(INITIAL_STATE);
    hasLoaded.current = false;
  }, []);

  // Refresh events
  const refreshEvents = useCallback(
    async (contactId: string, params: ContactEventsQueryParams = {}) => {
      hasLoaded.current = false;
      await loadContactEvents(contactId, params);
    },
    [loadContactEvents],
  );

  return {
    // State
    events: state.events,
    stats: state.stats,
    loading: state.loading,
    pagination: state.pagination,
    metadata: state.metadata,
    isEmpty: !state.loading.events && state.events.length === 0,

    // Actions
    loadContactEvents,
    loadContactEventStats,
    loadRecentEvents,
    handlePageChange,
    handlePerPageChange,
    clearEvents,
    refreshEvents,

    // Computed
    hasEvents: state.events.length > 0,
    isLoading: state.loading.events || state.loading.stats || state.loading.recent,
  };
}
