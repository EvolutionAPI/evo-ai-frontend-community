import { extractData } from '@/utils/apiHelpers';
import { agentProcessorApi } from '@/services/core/agentProcessorApi';
import { FileData } from '@/utils/fileUtils';
import type { ChatRequest, ChatResponse } from '@/types/agents';

/**
 * Send a chat message to an agent via HTTP endpoint (no WebSocket/streaming)
 */
export const sendChatMessage = async (
  agentId: string,
  sessionId: string,
  message: string,
  files?: FileData[],
): Promise<ChatResponse> => {
  const request: ChatRequest = {
    message,
    ...(files && files.length > 0 ? { files } : {}),
  };

  const response = await agentProcessorApi.post<ChatResponse>(
    `/chat/${agentId}/${sessionId}`,
    request,
  );

  return extractData<any>(response);
};
