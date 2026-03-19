
import EmptyState from '@/components/base/EmptyState';
import { LucideIcon } from 'lucide-react';

interface IntegrationEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function IntegrationEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: IntegrationEmptyStateProps) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      className={`h-full ${className}`}
      action={actionLabel && onAction ? {
        label: actionLabel,
        onClick: onAction
      } : undefined}
    />
  );
}
