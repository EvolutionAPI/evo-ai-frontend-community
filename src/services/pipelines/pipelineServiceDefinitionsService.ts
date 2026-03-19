import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type {
  PipelineServiceDefinition,
  CreateServiceDefinitionData,
  UpdateServiceDefinitionData,
} from '@/types/analytics';

class PipelineServiceDefinitionsService {
  async getServiceDefinitions(pipelineId: string): Promise<PipelineServiceDefinition[]> {
    const response = await api.get(`/pipelines/${pipelineId}/pipeline_service_definitions`);
    return extractData<PipelineServiceDefinition[]>(response);
  }

  async getServiceDefinition(pipelineId: string, id: string): Promise<PipelineServiceDefinition> {
    const response = await api.get(`/pipelines/${pipelineId}/pipeline_service_definitions/${id}`);
    return extractData<PipelineServiceDefinition>(response);
  }

  async createServiceDefinition(
    pipelineId: string,
    data: CreateServiceDefinitionData
  ): Promise<PipelineServiceDefinition> {
    const response = await api.post(`/pipelines/${pipelineId}/pipeline_service_definitions`, {
      service_definition: data,
    });
    return extractData<PipelineServiceDefinition>(response);
  }

  async updateServiceDefinition(
    pipelineId: string,
    id: string,
    data: UpdateServiceDefinitionData
  ): Promise<PipelineServiceDefinition> {
    const response = await api.patch(`/pipelines/${pipelineId}/pipeline_service_definitions/${id}`, {
      service_definition: data,
    });
    return extractData<PipelineServiceDefinition>(response);
  }

  async deleteServiceDefinition(pipelineId: string, id: string): Promise<void> {
    await api.delete(`/pipelines/${pipelineId}/pipeline_service_definitions/${id}`);
  }
}

export const pipelineServiceDefinitionsService = new PipelineServiceDefinitionsService();
export default pipelineServiceDefinitionsService;
