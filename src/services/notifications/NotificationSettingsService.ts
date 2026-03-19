import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { NotificationSettings } from '@/types/notifications';

class NotificationSettingsService {
  async getSettings(): Promise<NotificationSettings> {
    const response = await api.get('/notification_settings');
    return extractData<any>(response);
  }

  // Update notification settings
  async updateSettings(settings: {
    selected_email_flags: string[];
    selected_push_flags: string[];
  }): Promise<NotificationSettings> {
    const response = await api.put('/notification_settings', {
      notification_settings: settings,
    });
    return extractData<any>(response);
  }
}

export default new NotificationSettingsService();
