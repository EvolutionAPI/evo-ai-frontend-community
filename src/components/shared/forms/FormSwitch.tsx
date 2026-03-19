import { Label, Switch } from '@evoapi/design-system';

interface FormSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
}

export function FormSwitch({
  id,
  label,
  checked,
  onCheckedChange,
  description,
}: FormSwitchProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <Label htmlFor={id}>{label}</Label>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

