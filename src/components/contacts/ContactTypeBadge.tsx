import { Badge } from '@evoapi/design-system';
import { User, Building2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ContactTypeBadgeProps {
  type: 'person' | 'company';
  className?: string;
}

export default function ContactTypeBadge({ type, className = '' }: ContactTypeBadgeProps) {
  const { t } = useLanguage('contacts');
  const isPerson = type === 'person';

  return (
    <Badge
      variant={isPerson ? 'secondary' : 'default'}
      className={`gap-1 ${className}`}
    >
      {isPerson ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
      {isPerson ? t('type.person') : t('type.company')}
    </Badge>
  );
}

