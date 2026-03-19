import { Label, Textarea } from '@evoapi/design-system';

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
  className,
  required = false,
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={className}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

