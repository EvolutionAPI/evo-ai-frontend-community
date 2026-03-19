import api from '@/services/core/api';
import { extractData, extractResponse } from '@/utils/apiHelpers';
import {
  Webhook,
  WebhookFormData,
  WebhooksResponse,
  WebhookResponse,
  WebhookDeleteResponse,
  WebhookTestResponse,
} from '@/types/integrations';

class WebhooksService {
  async getWebhooks(
    params?: {
      page?: number;
      per_page?: number;
      q?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    },
  ): Promise<WebhooksResponse> {
    const response = await api.get('/webhooks', {
      params,
    });
    return extractResponse<Webhook>(response) as WebhooksResponse;
  }

  async getWebhook(webhookId: string): Promise<WebhookResponse> {
    const response = await api.get(`/webhooks/${webhookId}`);
    return extractData<WebhookResponse>(response);
  }

  async createWebhook(data: WebhookFormData): Promise<WebhookResponse> {
    const response = await api.post('/webhooks', {
      webhook: data,
    });
    return extractData<WebhookResponse>(response);
  }

  async updateWebhook(webhookId: string, data: WebhookFormData): Promise<WebhookResponse> {
    const response = await api.put(`/webhooks/${webhookId}`, {
      webhook: data,
    });
    return extractData<WebhookResponse>(response);
  }

  async deleteWebhook(webhookId: string): Promise<WebhookDeleteResponse> {
    const response = await api.delete(`/webhooks/${webhookId}`);
    return extractData<WebhookDeleteResponse>(response);
  }

  async testWebhook(webhookId: string): Promise<WebhookTestResponse> {
    const response = await api.post(`/webhooks/${webhookId}/test`);
    return extractData<WebhookTestResponse>(response);
  }
}

export const webhooksService = new WebhooksService();
