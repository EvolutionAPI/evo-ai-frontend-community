import { Conversation, Message } from '@/types/chat/api';
import { pipelinesService } from '@/services/pipelines/pipelinesService';
import type { Pipeline, PipelineStage } from '@/types/analytics';
import type { PaginationMeta } from '@/types/core';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';

// Helper types for API responses
interface ApiResponseWithPayload {
  payload?: Conversation[];
  meta?: object;
}

interface NestedApiResponse {
  data?: ApiResponseWithPayload;
  meta?: object;
}

interface DirectDataResponse {
  data?: Conversation[];
  meta?: object;
}

// Helper types for Messages API responses
interface MessageApiResponseWithPayload {
  payload?: Message[];
  meta?: object;
}

interface NestedMessageApiResponse {
  data?: MessageApiResponseWithPayload;
  meta?: object;
}

interface DirectMessageDataResponse {
  data?: Message[];
  meta?: object;
}

// Helper function to normalize pagination meta to PaginationMeta format
const normalizePaginationMeta = (meta: any): PaginationMeta => {
  if (!meta || typeof meta !== 'object') {
    return {
      page: 1,
      page_size: DEFAULT_PAGE_SIZE,
      total: 0,
      total_pages: 0,
    };
  }

  // Check if it's already in PaginationMeta format
  if ('page' in meta && 'page_size' in meta && 'total' in meta) {
    return {
      page: typeof meta.page === 'number' ? meta.page : 1,
      page_size: typeof meta.page_size === 'number' ? meta.page_size : DEFAULT_PAGE_SIZE,
      total: typeof meta.total === 'number' ? meta.total : 0,
      total_pages: typeof meta.total_pages === 'number' ? meta.total_pages : 0,
      has_next_page: typeof meta.has_next_page === 'boolean' ? meta.has_next_page : undefined,
      has_previous_page: typeof meta.has_previous_page === 'boolean' ? meta.has_previous_page : undefined,
    };
  }

  // Convert from old format (current_page, per_page, all_count) to new format
  const currentPage = typeof meta.current_page === 'number' ? meta.current_page : 1;
  const perPage = typeof meta.per_page === 'number' ? meta.per_page : DEFAULT_PAGE_SIZE;
  const total = typeof meta.all_count === 'number' ? meta.all_count : (typeof meta.total === 'number' ? meta.total : 0);
  const totalPages = typeof meta.total_pages === 'number' ? meta.total_pages : Math.ceil(total / perPage);

  return {
    page: currentPage,
    page_size: perPage,
    total,
    total_pages: totalPages,
    has_next_page: currentPage < totalPages,
    has_previous_page: currentPage > 1,
  };
};

// Helper function to extract conversations from API response
export const extractConversationsData = (responseData: unknown): { conversations: Conversation[]; pagination: PaginationMeta } => {
  let conversations: Conversation[];
  let paginationMeta: any;

  if (Array.isArray(responseData)) {
    // Direct array
    conversations = responseData;
    paginationMeta = {
      page: 1,
      page_size: DEFAULT_PAGE_SIZE,
      total: conversations.length,
      total_pages: 1,
    };
  } else {
    const payloadResponse = responseData as ApiResponseWithPayload;
    const nestedResponse = responseData as NestedApiResponse;
    const directDataResponse = responseData as DirectDataResponse;

    if (payloadResponse?.payload && Array.isArray(payloadResponse.payload)) {
      // Direct Evolution format: {meta: {...}, payload: [...]}
      conversations = payloadResponse.payload;
      paginationMeta = payloadResponse.meta || {
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total: conversations.length,
        total_pages: 1,
      };
    } else if (nestedResponse?.data?.payload && Array.isArray(nestedResponse.data.payload)) {
      // Nested Evolution format: {data: {meta: {...}, payload: [...]}}
      conversations = nestedResponse.data.payload;
      paginationMeta = nestedResponse.data.meta || {
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total: conversations.length,
        total_pages: 1,
      };
    } else if (directDataResponse?.data && Array.isArray(directDataResponse.data)) {
      // Alternative format: {data: [...]}
      conversations = directDataResponse.data;
      paginationMeta = directDataResponse.meta || {
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total: conversations.length,
        total_pages: 1,
      };
    } else {
      // Fallback to empty array
      conversations = [];
      paginationMeta = {
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
        total: 0,
        total_pages: 0,
      };
    }
  }

  return {
    conversations,
    pagination: normalizePaginationMeta(paginationMeta),
  };
};

// Helper function to correct message status for private messages
const correctMessageStatus = (message: Message): Message => {
  if (message.private && message.status === 'failed') {
    return {
      ...message,
      status: 'sent',
    };
  }
  return message;
};

// Helper function to extract messages from API response
export const extractMessagesData = (responseData: unknown): Message[] => {
  let messages: Message[] = [];

  if (Array.isArray(responseData)) {
    // Direct array
    messages = responseData;
  } else {
    const payloadResponse = responseData as MessageApiResponseWithPayload;
    const nestedResponse = responseData as NestedMessageApiResponse;
    const directDataResponse = responseData as DirectMessageDataResponse;

    if ((responseData as any)?.success === true && Array.isArray((responseData as any)?.data)) {
      messages = (responseData as any).data;
    } else if (payloadResponse?.payload && Array.isArray(payloadResponse.payload)) {
      // Direct Chatwoot format: {meta: {...}, payload: [...]}
      messages = payloadResponse.payload;
    } else if (nestedResponse?.data?.payload && Array.isArray(nestedResponse.data.payload)) {
      // Nested Evolution format: {data: {meta: {...}, payload: [...]}}
      messages = nestedResponse.data.payload;
    } else if (directDataResponse?.data && Array.isArray(directDataResponse.data)) {
      // Alternative format: {data: [...]}
      messages = directDataResponse.data;
    }
  }

  // Aplicar correção de status para todas as mensagens carregadas
  return messages.map(correctMessageStatus);
};

// Helper function to extract messages WITH pagination info
export const extractMessagesWithMeta = (responseData: unknown) => {
  const messages = extractMessagesData(responseData);
  let meta = null;

  if (!Array.isArray(responseData)) {
    const payloadResponse = responseData as MessageApiResponseWithPayload;
    const nestedResponse = responseData as NestedMessageApiResponse;
    const directDataResponse = responseData as DirectMessageDataResponse;

    if (payloadResponse?.meta) {
      meta = payloadResponse.meta;
    } else if (nestedResponse?.data?.meta) {
      meta = nestedResponse.data.meta;
    } else if (directDataResponse?.meta) {
      meta = directDataResponse.meta;
    }
  }

  return { messages, meta };
};

// Helper function to enrich conversations with pipeline data
export const enrichConversationsWithPipelineData = async (
  conversations: Conversation[],
): Promise<Conversation[]> => {
  // Find conversations that have pipeline_id but no pipeline data
  const conversationsNeedingEnrichment = conversations.filter(
    conv => conv.pipeline_id && (!conv.pipeline || !conv.pipeline_stage),
  );

  if (conversationsNeedingEnrichment.length === 0) {
    return conversations;
  }

  // Group conversations by pipeline_id for efficient fetching
  const pipelineGroups = conversationsNeedingEnrichment.reduce((groups, conv) => {
    const pipelineId = conv.pipeline_id!;
    if (!groups[pipelineId]) {
      groups[pipelineId] = [];
    }
    groups[pipelineId].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Fetch pipeline data for each unique pipeline_id
  const pipelineDataMap = new Map<
    string,
    { pipeline: Pipeline; stages: PipelineStage[]; conversationsMap: Map<string, string> }
  >();

  try {
    await Promise.all(
      Object.keys(pipelineGroups).map(async pipelineId => {
        try {
          const [pipelineData, stagesResponse, itemsResponse] = await Promise.all([
            pipelinesService.getPipeline(pipelineId),
            pipelinesService.getPipelineStages(pipelineId),
            pipelinesService.getPipelineItems(pipelineId),
          ]);

          if (pipelineData.id && stagesResponse.data) {
            // Create a map of conversation_id -> pipeline_stage_id
            const conversationsMap = new Map<string, string>();
            if (itemsResponse.data) {
              itemsResponse.data
                .filter(item => item.type === 'conversation')
                .forEach(item => {
                  const stageId = item.pipeline_stage_id || item.stage_id;
                  if (stageId) {
                    conversationsMap.set(String(item.item_id), String(stageId));
                  }
                });
            }

            pipelineDataMap.set(pipelineId, {
              pipeline: pipelineData,
              stages: stagesResponse.data,
              conversationsMap,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch pipeline data for pipeline ${pipelineId}:`, error);
        }
      }),
    );
  } catch (error) {
    console.error('Error enriching conversations with pipeline data:', error);
  }

  // Enrich conversations with pipeline data
  const enrichedConversations = conversations.map(conv => {
    if (!conv.pipeline_id || (conv.pipeline && conv.pipeline_stage)) {
      return conv;
    }

    const pipelineData = pipelineDataMap.get(conv.pipeline_id);
    if (!pipelineData) {
      return conv;
    }

    // Find the stage this conversation belongs to
    const stageId = pipelineData.conversationsMap.get(String(conv.id));
    const stage = stageId ? pipelineData.stages.find(s => String(s.id) === stageId) : null;

    return {
      ...conv,
      pipeline: pipelineData.pipeline,
      pipeline_stage: stage || null,
      pipeline_info: conv.pipeline_info || null,
    };
  });

  return enrichedConversations;
};
