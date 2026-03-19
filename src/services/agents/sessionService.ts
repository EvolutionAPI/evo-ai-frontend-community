import { extractData } from '@/utils/apiHelpers';
import agentProcessorApi from '@/services/core/agentProcessorApi';
import type { ChatSession, ChatMessage } from '@/types/agents';

export const generateExternalId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0',
  )}${String(now.getSeconds()).padStart(2, '0')}`;
};

export const listSessions = async (agentId?: string): Promise<{ data: ChatSession[] }> => {
  if (agentId) {
    const response = await agentProcessorApi.get(`/sessions/agent/${agentId}`);
    const sessions = extractData<ChatSession[]>(response);
    return { data: Array.isArray(sessions) ? sessions : [] };
  }
  const response = await agentProcessorApi.get(`/sessions/account`);
  const sessions = extractData<ChatSession[]>(response);
  return { data: Array.isArray(sessions) ? sessions : [] };
};

export const getSessionMessages = async (sessionId: string) => {
  const response = await agentProcessorApi.get(`/sessions/${sessionId}/messages`);
  const messages = extractData<ChatMessage[]>(response);
  return { data: Array.isArray(messages) ? messages : [] };
};

export const createSession = async (
  agentId: string,
  userId?: string,
): Promise<{ session_id?: string; id?: string; user_id?: string }> => {
  const requestBody: { user_id?: string; session_id?: string } = {};
  if (userId) {
    requestBody.user_id = userId;
  }
  const response = await agentProcessorApi.post<{
    session_id?: string;
    id?: string;
    user_id?: string;
  }>(`/sessions/${agentId}`, requestBody);
  return extractData<any>(response);
};

export const deleteSession = async (sessionId: string) => {
  await agentProcessorApi.delete(`/sessions/${sessionId}`);
};
