interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const FormCheckbox = ({
  label,
  checked,
  onChange,
  className,
}: FormCheckboxProps) => {
  return (
    <label className={`flex items-center gap-2 text-sm text-sidebar-foreground/80 select-none ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-sidebar-border bg-sidebar text-primary focus:ring-0"
      />
      <span>{label}</span>
    </label>
  );
};
