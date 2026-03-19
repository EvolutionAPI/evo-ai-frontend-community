import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export interface BaseStatusBadgeProps {
  status: 'active' | 'inactive' | 'blocked' | 'pending' | 'success' | 'error' | 'warning';
  text?: string;
  className?: string;
}

const statusConfig = {
  active: {
    bgClassName: 'bg-[#26533D]',
    textClassName: 'text-white',
    borderClassName: 'border-[#26533D]',
  },
  inactive: {
    bgClassName: 'bg-gray-500',
    textClassName: 'text-white',
    borderClassName: 'border-gray-500',
  },
  blocked: {
    bgClassName: 'bg-[#6A231D]',
    textClassName: 'text-white',
    borderClassName: 'border-[#6A231D]',
  },
  pending: {
    bgClassName: 'bg-yellow-500',
    textClassName: 'text-white',
    borderClassName: 'border-yellow-500',
  },
  success: {
    bgClassName: 'bg-[#26533D]',
    textClassName: 'text-white',
    borderClassName: 'border-[#26533D]',
  },
  error: {
    bgClassName: 'bg-[#6A231D]',
    textClassName: 'text-white',
    borderClassName: 'border-[#6A231D]',
  },
  warning: {
    bgClassName: 'bg-yellow-500',
    textClassName: 'text-white',
    borderClassName: 'border-yellow-500',
  }
};

export default function BaseStatusBadge({ status, text, className }: BaseStatusBadgeProps) {
  const { t } = useLanguage('common');
  const config = statusConfig[status];
  const defaultText = t(`base.status.${status}`);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        config.bgClassName,
        config.textClassName,
        className
      )}
    >
      {text || defaultText}
    </span>
  );
}
