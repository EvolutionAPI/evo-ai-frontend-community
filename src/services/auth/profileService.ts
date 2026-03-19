import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { UserResponse, PasswordUpdateResponse } from '@/types/auth';
import type { ProfileUpdateData, AvailabilityUpdateData } from '@/types/users';
import type { UISettings } from '@/types/auth';

export const profileAPI = {
  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<UserResponse> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'ui_settings') {
          formData.append(`profile[${key}]`, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(`profile[${key}]`, value);
        } else {
          formData.append(`profile[${key}]`, String(value));
        }
      }
    });

    const response = await api.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return extractData<any>(response);
  },

  // Update availability status
  async updateAvailability(data: AvailabilityUpdateData): Promise<UserResponse> {
    const response = await api.post('/profile/availability', {
      profile: data,
    });

    return extractData<any>(response);
  },

  // Get user profile
  async getProfile(): Promise<UserResponse> {
    const response = await api.get('/profile');
    return extractData<any>(response);
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<PasswordUpdateResponse> {
    const response = await api.put('/profile/password', {
      profile: {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPassword,
      },
    });
    return extractData<PasswordUpdateResponse>(response);
  },

  // Update UI settings only
  async updateUISettings(settings: Partial<UISettings>): Promise<UserResponse> {
    return this.updateProfile({ ui_settings: settings });
  },
};
