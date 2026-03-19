import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { ChannelDeleteResponse } from '@/types/channels/inbox';

interface Channel {
  id: string;
  name: string;
  channel_type: string;
  phone_number?: string;
  provider?: string;
  provider_config?: any;
}

interface CreateChannelPayload {
  name: string;
  channel_type: string;
  [key: string]: any;
}

class ChannelsService {
  async list(): Promise<Channel[]> {
    const response = await api.get(`/channels`);
    return extractData<any>(response);
  }

  async create(payload: CreateChannelPayload): Promise<Channel> {
    const response = await api.post(`/channels`, payload);
    return extractData<any>(response);
  }

  async update(channelId: string, payload: Partial<CreateChannelPayload>): Promise<Channel> {
    const response = await api.patch(`/channels/${channelId}`, payload);
    return extractData<any>(response);
  }

  async delete(channelId: string): Promise<ChannelDeleteResponse> {
    const response = await api.delete(`/channels/${channelId}`);
    return extractData<ChannelDeleteResponse>(response);
  }

  // Facebook/Meta integration methods
  async fetchFacebookPages(omniauthToken: string) {
    const response = await api.post(`/callbacks/facebook_pages`, {
      omniauth_token: omniauthToken,
    });
    return extractData<any>(response);
  }

  async createFacebookChannel(pageData: any, inboxName: string, mode: 'facebook' | 'instagram') {
    const response = await api.post(`/facebook/channels`, {
      page_data: pageData,
      inbox_name: inboxName,
      mode: mode,
    });
    return extractData<any>(response);
  }

  async registerFacebookPage(payload: any) {
    const response = await api.post(`/callbacks/register_facebook_page`, payload);
    return extractData<any>(response);
  }

  async reauthorizeFacebookPage(omniauthToken: string, inboxId: string) {
    const response = await api.post(`/callbacks/reauthorize_page`, {
      omniauth_token: omniauthToken,
      inbox_id: inboxId,
    });
    return extractData<any>(response);
  }
}

export default new ChannelsService();
