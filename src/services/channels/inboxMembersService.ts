import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { InboxMembersUpdateResponse, AgentChannel } from '@/types/channels/inbox';

// Inbox Members Service following Evolution patterns
const InboxMembersService = {
  /**
   * Get all agents assigned to an inbox
   * Endpoint: GET /api/v1/inbox_members/:inbox_id
   */
  async get(inboxId: string): Promise<AgentChannel[]> {
    try {
      const response = await api.get(`/inbox_members/${inboxId}`);
      const data = extractData<AgentChannel[]>(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('InboxMembersService.get error:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Update agents assigned to an inbox
   * Endpoint: PATCH /api/v1/inbox_members
   *
   * This follows the exact pattern from the Vue app:
   * - Uses PATCH method to the base inbox_members endpoint
   * - Sends inbox_id and user_ids in the body
   */
  async update(inboxId: string, agentIds: string[]): Promise<InboxMembersUpdateResponse> {
    const response = await api.patch('/inbox_members', {
      inbox_id: inboxId,
      user_ids: agentIds,
    });
    return extractData<InboxMembersUpdateResponse>(response);
  },
};

export default InboxMembersService;
