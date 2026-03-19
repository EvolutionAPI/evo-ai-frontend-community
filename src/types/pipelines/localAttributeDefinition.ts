import { AttributeDisplayType } from '@/types/settings';

export type LocalAttributeDefinition = {
  __local_definition: true;
  attribute_display_name: string;
  attribute_display_type: AttributeDisplayType;
  attribute_values?: string[];
};

export type LocalAttributeDefinitionPayload = Omit<LocalAttributeDefinition, '__local_definition'>;
