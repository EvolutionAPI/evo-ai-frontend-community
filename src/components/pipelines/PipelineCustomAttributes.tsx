import PipelineCustomAttributesForm from './PipelineCustomAttributesForm';
import { PipelineAttributeContext } from '@/types/settings';

interface PipelineCustomAttributesProps {
  attributes: Record<string, unknown>;
  onAttributesChange: (attributes: Record<string, unknown>) => void;
  disabled?: boolean;
  pipelineId?: string;
}

/**
 * PipelineCustomAttributes component.
 * Wrapper around the pipeline-specific CustomAttributesForm component for pipelines.
 */
export default function PipelineCustomAttributes({
  attributes,
  onAttributesChange,
  disabled = false,
  pipelineId,
}: PipelineCustomAttributesProps) {
  if (!pipelineId) {
    throw new Error('pipelineId is required for PipelineCustomAttributes');
  }

  const pipelineContext: PipelineAttributeContext = { pipelineId };

  return (
    <PipelineCustomAttributesForm
      attributeModel="pipeline_attribute"
      attributes={attributes}
      onAttributesChange={onAttributesChange}
      disabled={disabled}
      pipelineContext={pipelineContext}
    />
  );
}
