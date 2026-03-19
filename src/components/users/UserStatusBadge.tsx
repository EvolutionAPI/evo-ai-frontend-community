import { BaseStatusBadge } from '@/components/base';

interface UserStatusBadgeProps {
  status: 'online' | 'busy' | 'offline';
  confirmed?: boolean;
  className?: string;
}

/**
 * Wrapper específico para status de usuários
 * Mapeia o status de disponibilidade para os status do BaseStatusBadge
 */
export default function UserStatusBadge({ status, confirmed, className }: UserStatusBadgeProps) {
  // Se não confirmado, sempre mostra como pendente
  if (confirmed === false) {
    return (
      <BaseStatusBadge
        status="pending"
        className={className}
      />
    );
  }

  // Para usuários confirmados, todos são considerados ativos
  // Apenas o status de busy é diferente (warning)
  const statusMap: Record<string, 'active' | 'warning'> = {
    online: 'active',
    busy: 'warning',
    offline: 'active',
  };

  return (
    <BaseStatusBadge
      status={statusMap[status] || 'active'}
      className={className}
    />
  );
}
