import { extractData } from '@/utils/apiHelpers';
import agentProcessorApi from '@/services/core/agentProcessorApi';
import type { Tool, ToolCategory, ToolsResponse } from '@/types/ai';

/**
 * List all available tools with optional filtering
 */
export const listTools = async (params?: {
  category?: string;
  tags?: string;
  search?: string;
}): Promise<ToolsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.category) {
    queryParams.append('category', params.category);
  }

  if (params?.tags) {
    queryParams.append('tags', params.tags);
  }

  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const response = await agentProcessorApi.get<ToolsResponse>(`/tools?${queryParams.toString()}`);
  return extractData<any>(response);
};

/**
 * Get details of a specific tool
 */
export const getTool = async (toolId: string): Promise<Tool> => {
  const response = await agentProcessorApi.get<Tool>(`/tools/${toolId}`);
  return extractData<any>(response);
};

/**
 * List all tool categories
 */
export const listToolCategories = async (): Promise<ToolCategory[]> => {
  const response = await agentProcessorApi.get<ToolCategory[]>('/tools/categories/list');
  return extractData<any>(response);
};

/**
 * Reload tools configuration (Admin only)
 */
export const reloadToolsConfig = async (): Promise<{ message: string }> => {
  const response = await agentProcessorApi.post<{ message: string }>('/tools/reload-config');
  return extractData<any>(response);
};
