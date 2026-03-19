/**
 * Utilitário para traduzir e formatar status de conversas
 */

export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'snoozed';

export interface StatusConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * Traduz o status da conversa para português
 */
export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    open: 'Aberta',
    resolved: 'Resolvida',
    pending: 'Pendente',
    snoozed: 'Pausada',
  };

  return statusMap[status] || 'Desconhecido';
};

/**
 * Retorna configuração completa do status (label, cores, etc.)
 */
export const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    open: {
      label: 'Aberta',
      description: 'Conversa ativa e em andamento',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    pending: {
      label: 'Pendente',
      description: 'Aguardando resposta do cliente',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    resolved: {
      label: 'Resolvida',
      description: 'Conversa finalizada com sucesso',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    snoozed: {
      label: 'Pausada',
      description: 'Conversa temporariamente pausada',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  };

  return (
    configs[status] || {
      label: 'Desconhecido',
      description: 'Status não identificado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    }
  );
};

/**
 * Verifica se o status indica que a conversa está ativa
 */
export const isActiveStatus = (status: string): boolean => {
  return status === 'open';
};

/**
 * Verifica se o status indica que a conversa está pendente
 */
export const isPendingStatus = (status: string): boolean => {
  return status === 'pending';
};
