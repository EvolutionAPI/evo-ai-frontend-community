import { useState, useEffect } from 'react';
import { getAccessibleAgents } from '@/services/agents';

export interface AvailableAgent {
  id: string;
  name: string;
  description: string;
}

export const useAvailableAgents = (clientId: string) => {
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableAgents = async () => {
    if (!clientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getAccessibleAgents(0, 1000);

      if (response.data) {
        const agents = response.data.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || 'Agente sem descrição',
        }));

        setAvailableAgents(agents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agentes disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableAgents();
  }, [clientId]);

  return {
    availableAgents,
    isLoading,
    error,
    refetch: loadAvailableAgents,
  };
};
