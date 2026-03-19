import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  description,
  children,
  className,
}: FormSectionProps) => {
  return (
    <div className={`p-4 rounded-lg border border-sidebar-border bg-sidebar ${className || ''}`}>
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-sidebar-foreground">{title}</h4>
        {description && (
          <p className="text-xs text-sidebar-foreground/70 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};
