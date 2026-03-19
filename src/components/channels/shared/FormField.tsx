import { Input } from '@evoapi/design-system';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  readOnly?: boolean;
}

export const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helpText,
  className,
  readOnly = false,
}: FormFieldProps) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-sm font-medium text-sidebar-foreground/80">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type}
        required={required}
        readOnly={readOnly}
        disabled={readOnly}
        className={`bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 ${
          readOnly ? 'cursor-not-allowed opacity-60 bg-sidebar-border/50' : ''
        }`}
      />
      {helpText && (
        <p className="text-xs text-sidebar-foreground/60 mt-1">{helpText}</p>
      )}
    </div>
  );
};
