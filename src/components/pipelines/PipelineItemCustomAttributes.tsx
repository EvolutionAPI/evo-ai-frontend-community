import PipelineCustomAttributesForm from './PipelineCustomAttributesForm';
import { PipelineAttributeContext } from '@/types/settings';

interface PipelineItemCustomAttributesProps {
  attributes: Record<string, unknown>;
  onAttributesChange: (attributes: Record<string, unknown>) => void;
  disabled?: boolean;
  pipelineId?: string;
  stageId?: string;
  itemId?: string;
  pipelineCustomFields?: Record<string, unknown> & {
    attributes?: string[];
  };
  stageCustomFields?: Record<string, unknown> & {
    attributes?: string[];
  };
}

/**
 * PipelineItemCustomAttributes component.
 * Wrapper around the pipeline-specific CustomAttributesForm component for pipeline items.
 */
export default function PipelineItemCustomAttributes({
  attributes,
  onAttributesChange,
  disabled = false,
  pipelineId,
  stageId,
  itemId,
  pipelineCustomFields,
  stageCustomFields,
}: PipelineItemCustomAttributesProps) {
  if (!pipelineId || !stageId || !itemId) {
    throw new Error('pipelineId, stageId, and itemId are required for PipelineItemCustomAttributes');
  }

  const pipelineContext: PipelineAttributeContext = { pipelineId, stageId, itemId };

  return (
    <PipelineCustomAttributesForm
      attributeModel="pipeline_item_attribute"
      attributes={attributes}
      onAttributesChange={onAttributesChange}
      disabled={disabled}
      pipelineContext={pipelineContext}
      pipelineCustomFields={pipelineCustomFields}
      stageCustomFields={stageCustomFields}
    />
  );
}
