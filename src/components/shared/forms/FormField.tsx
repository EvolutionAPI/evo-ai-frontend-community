import { Input, Label } from '@evoapi/design-system';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'url';
  description?: string;
  required?: boolean;
  readOnly?: boolean;
}

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  description,
  required = false,
  readOnly = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? 'bg-muted cursor-not-allowed' : ''}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

