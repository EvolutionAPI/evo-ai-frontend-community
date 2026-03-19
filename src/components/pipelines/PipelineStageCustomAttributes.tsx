import PipelineCustomAttributesForm from './PipelineCustomAttributesForm';
import { PipelineAttributeContext } from '@/types/settings';

interface PipelineStageCustomAttributesProps {
  attributes: Record<string, unknown>;
  onAttributesChange: (attributes: Record<string, unknown>) => void;
  disabled?: boolean;
  pipelineId?: string;
  stageId?: string;
}

/**
 * PipelineStageCustomAttributes component.
 * Wrapper around the pipeline-specific CustomAttributesForm component for pipeline stages.
 */
export default function PipelineStageCustomAttributes({
  attributes,
  onAttributesChange,
  disabled = false,
  pipelineId,
  stageId,
}: PipelineStageCustomAttributesProps) {
  if (!pipelineId || !stageId) {
    throw new Error('pipelineId and stageId are required for PipelineStageCustomAttributes');
  }

  const pipelineContext: PipelineAttributeContext = { pipelineId, stageId };

  return (
    <PipelineCustomAttributesForm
      attributeModel="pipeline_stage_attribute"
      attributes={attributes}
      onAttributesChange={onAttributesChange}
      disabled={disabled}
      pipelineContext={pipelineContext}
    />
  );
}
