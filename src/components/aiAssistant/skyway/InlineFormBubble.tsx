import { useMemo, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@evoapi/design-system';
import { ArrowRight, FileInput } from 'lucide-react';
import type { SkywayInlineForm } from '@/services/aiAssistant/mockAssistant';

interface Props {
  form: SkywayInlineForm;
  onSubmit: (values: Record<string, string>) => void;
  /** Já foi submetido — desabilita o form */
  submitted?: boolean;
}

export function InlineFormBubble({ form, onSubmit, submitted }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const canSubmit = useMemo(() => {
    return form.fields.every((f) => {
      if (!f.required) return true;
      const v = values[f.name];
      return v !== undefined && v !== '';
    });
  }, [form.fields, values]);

  const update = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.04] p-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20">
          <FileInput className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-sky-300">
            Form inline
          </p>
          <p className="text-sm text-foreground">{form.title}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {form.fields.map((field) => {
          const v = values[field.name] ?? '';
          if (field.type === 'select') {
            return (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name} className="text-xs text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                </Label>
                <Select
                  value={v}
                  onValueChange={(val) => update(field.name, val)}
                  disabled={submitted}
                >
                  <SelectTrigger id={field.name} className="h-9">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field.type === 'date') {
            return (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name} className="text-xs text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type="date"
                  value={v}
                  onChange={(e) => update(field.name, e.target.value)}
                  disabled={submitted}
                  className="h-9"
                />
              </div>
            );
          }

          if (field.type === 'number') {
            return (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name} className="text-xs text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                </Label>
                <div className="relative">
                  {field.prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {field.prefix}
                    </span>
                  )}
                  <Input
                    id={field.name}
                    type="number"
                    value={v}
                    onChange={(e) => update(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    disabled={submitted}
                    className={`h-9 ${field.prefix ? 'pl-8' : ''}`}
                  />
                </div>
              </div>
            );
          }

          // text / email / tel
          return (
            <div key={field.name} className="space-y-1">
              <Label htmlFor={field.name} className="text-xs text-muted-foreground">
                {field.label}
                {field.required && <span className="text-rose-400 ml-0.5">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                value={v}
                onChange={(e) => update(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={submitted}
                className="h-9"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => onSubmit(values)}
          disabled={!canSubmit || submitted}
          className="gap-1.5"
        >
          {submitted ? 'Enviado' : form.submitLabel}
          {!submitted && <ArrowRight className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
