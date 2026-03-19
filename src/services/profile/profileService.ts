import apiAuth from '@/services/core/apiAuth';
import { extractData } from '@/utils/apiHelpers';
import type { UserProfile } from '@/types/users';
import type { ProfileUpdateData, PasswordChangeData } from '@/types/users';
import type { Account } from '@/types/settings';

// Re-export types for convenience
export type { ProfileUpdateData, PasswordChangeData };

class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<{ user: UserProfile; accounts: Account[] }> {
    const response = await apiAuth.get('/profile');
    return extractData<{ user: UserProfile; accounts: Account[] }>(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    const formData = new FormData();

    // Add profile fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'avatar') {
        formData.append(`profile[${key}]`, value as string);
      }
    });

    // Add avatar if provided
    if (data.avatar) {
      formData.append('profile[avatar]', data.avatar);
    }

    const response = await apiAuth.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return extractData<UserProfile>(response);
  }

  /**
   * Update only user avatar
   */
  async updateAvatar(avatar: File): Promise<UserProfile> {
    return this.updateProfile({ avatar });
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChangeData): Promise<UserProfile> {
    const response = await apiAuth.put('/profile/password', {
      current_password: data.current_password,
      new_password: data.password,
    });

    return extractData<UserProfile>(response);
  }


  /**
   * Cancel a pending email change
   */
  async cancelEmailChange(): Promise<UserProfile> {
    const response = await apiAuth.delete('/profile/cancel_email_change');
    return extractData<UserProfile>(response);
  }

  /**
   * Resend email confirmation for pending email change
   */
  async resendEmailConfirmation(): Promise<void> {
    await apiAuth.post('/profile/resend_email_confirmation');
  }

  /**
   * Update UI settings
   */
  async updateUISettings(settings: {
    editor_message_key?: 'enter' | 'cmd_enter';
    font_size?: string;
  }): Promise<UserProfile> {
    const response = await apiAuth.put('/profile', {
      profile: { ui_settings: settings },
    });

    return extractData<UserProfile>(response);
  }

  /**
   * Update availability status
   */
  async updateAvailability(availability: 'online' | 'busy' | 'offline'): Promise<UserProfile> {
    const response = await apiAuth.put('/profile/availability', {
      availability,
    });

    return extractData<UserProfile>(response);
  }

  /**
   * Update message signature
   */
  async updateMessageSignature(signature: string): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('profile[message_signature]', signature);

    const response = await apiAuth.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return extractData<UserProfile>(response);
  }
}

export const profileService = new ProfileService();
