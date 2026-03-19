import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import PrimaryActionButton from './PrimaryActionButton';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    className?: string;
    disabled?: boolean;
    tooltip?: string;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      {Icon && (
        <div className="mb-6">
          <Icon className="h-16 w-16 text-muted-foreground/60" />
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>

      {action && (
        <PrimaryActionButton
          label={action.label}
          onClick={action.onClick}
          size="default"
          variant={action.variant}
          className={action.className}
          disabled={action.disabled}
          tooltip={action.tooltip}
        />
      )}
    </div>
  );
}
