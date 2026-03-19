import { BaseStatusBadge } from '@/components/base';

interface ContactStatusBadgeProps {
  blocked: boolean;
  className?: string;
}

/**
 * Wrapper específico para status de contatos
 * Mapeia o boolean blocked para os status do BaseStatusBadge
 */
export default function ContactStatusBadge({ blocked, className }: ContactStatusBadgeProps) {
  return (
    <BaseStatusBadge
      status={blocked ? 'blocked' : 'active'}
      className={className}
    />
  );
}
