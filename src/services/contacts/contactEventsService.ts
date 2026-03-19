import api from '@/services/core/api';
import type {
  ContactEventsQueryParams,
  ContactEventsResponse,
  ContactEventStatsResponse,
} from '@/types/notifications';

class ContactEventsService {
  async getContactEvents(
    contactId: string,
    params: ContactEventsQueryParams = {},
  ): Promise<ContactEventsResponse> {
    const response = await api.get(`/contacts/${contactId}/events`, { params });
    return response.data;
  }

  async getContactEventStats(
    contactId: string,
    days = 30,
  ): Promise<ContactEventStatsResponse> {
    const response = await api.get(`/contacts/${contactId}/event_stats`, { params: { days } });
    return response.data;
  }

  async getRecentEvents(
    params: ContactEventsQueryParams = {},
  ): Promise<ContactEventsResponse> {
    const response = await api.get('/contacts/recent_events', { params });
    return response.data;
  }
}

export const contactEventsService = new ContactEventsService();
