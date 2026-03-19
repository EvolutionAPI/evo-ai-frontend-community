import CustomAttributesForm from '@/components/customAttributes/CustomAttributesForm';

interface CustomAttributesProps {
  attributes: Record<string, unknown>;
  onAttributesChange: (attributes: Record<string, unknown>) => void;
  disabled?: boolean;
}

/**
 * CustomAttributes component for contacts form.
 * Wrapper around the generic CustomAttributesForm component.
 */
export default function CustomAttributes({
  attributes,
  onAttributesChange,
  disabled = false,
}: CustomAttributesProps) {
  return (
    <CustomAttributesForm
      attributeModel="contact_attribute"
      attributes={attributes}
      mode="form"
      onAttributesChange={onAttributesChange}
      disabled={disabled}
    />
  );
}
