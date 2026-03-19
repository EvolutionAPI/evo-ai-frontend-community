import api from '@/services/core/api';
import type { FacebookCommentModeration, ModerationsResponse } from '@/types/channels/inbox';

const FacebookModerationService = {
  // Get moderations list
  async getModerations(params?: {
    conversation_id?: string;
    status?: string;
    moderation_type?: string;
    pending_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<ModerationsResponse> {
    try {
      const { data } = await api.get<ModerationsResponse>(`/facebook_comment_moderations`, {
        params,
      });
      return data;
    } catch (error) {
      console.error('FacebookModerationService.getModerations error:', error);
      throw error;
    }
  },

  // Get single moderation
  async getModeration(moderationId: string): Promise<FacebookCommentModeration> {
    try {
      const { data } = await api.get<FacebookCommentModeration>(
        `/facebook_comment_moderations/${moderationId}`,
      );
      return data;
    } catch (error) {
      console.error('FacebookModerationService.getModeration error:', error);
      throw error;
    }
  },

  // Approve moderation
  async approveModeration(moderationId: string): Promise<FacebookCommentModeration> {
    try {
      const { data } = await api.post<FacebookCommentModeration>(
        `/facebook_comment_moderations/${moderationId}/approve`,
      );
      return data;
    } catch (error) {
      console.error('FacebookModerationService.approveModeration error:', error);
      throw error;
    }
  },

  // Reject moderation
  async rejectModeration(
    moderationId: string,
    reason?: string,
  ): Promise<FacebookCommentModeration> {
    try {
      const { data } = await api.post<FacebookCommentModeration>(
        `/facebook_comment_moderations/${moderationId}/reject`,
        { rejection_reason: reason },
      );
      return data;
    } catch (error) {
      console.error('FacebookModerationService.rejectModeration error:', error);
      throw error;
    }
  },

  // Regenerate response
  async regenerateResponse(moderationId: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post<{ message: string }>(
        `/facebook_comment_moderations/${moderationId}/regenerate_response`,
      );
      return data;
    } catch (error) {
      console.error('FacebookModerationService.regenerateResponse error:', error);
      throw error;
    }
  },
};

export default FacebookModerationService;
