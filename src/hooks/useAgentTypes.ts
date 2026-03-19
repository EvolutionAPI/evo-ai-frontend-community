import { useState, useEffect } from 'react';
import { getAccessibleAgents } from '@/services/agents';
import { useLanguage } from '@/hooks/useLanguage';

export interface AgentType {
  value: string;
  label: string;
  description: string;
}

// Função para criar tipos padrão com traduções
const getDefaultAgentTypes = (t: (key: string) => string): AgentType[] => [
  { value: 'llm', label: 'LLM', description: t('agentTypeDescriptions.llm') },
  { value: 'a2a', label: 'A2A', description: t('agentTypeDescriptions.a2a') },
  { value: 'sequential', label: t('agentTypeDescriptions.sequential'), description: t('agentTypeDescriptions.sequentialDescription') },
  { value: 'parallel', label: t('agentTypeDescriptions.parallel'), description: t('agentTypeDescriptions.parallelDescription') },
  { value: 'loop', label: t('agentTypeDescriptions.loop'), description: t('agentTypeDescriptions.loopDescription') },
  { value: 'workflow', label: t('agentTypeDescriptions.workflow'), description: t('agentTypeDescriptions.workflowDescription') },
  { value: 'task', label: t('agentTypeDescriptions.task'), description: t('agentTypeDescriptions.taskDescription') },
  { value: 'external', label: t('agentTypeDescriptions.external'), description: t('agentTypeDescriptions.externalDescription') },
];

export const useAgentTypes = (clientId: string) => {
  const { t } = useLanguage('aiAgents');
  const [agentTypes, setAgentTypes] = useState<AgentType[]>(getDefaultAgentTypes(t));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgentTypes = async () => {
    if (!clientId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getAccessibleAgents(0, 1000);

      if (response.data && response.data.length > 0) {
        // Extrair tipos únicos dos agentes existentes
        const uniqueTypes = [...new Set(response.data.map((agent: any) => agent.type))];

        const defaultTypes = getDefaultAgentTypes(t);
        const typesWithDefaults = uniqueTypes.map(type => {
          const defaultType = defaultTypes.find(dt => dt.value === type);
          return (
            defaultType || {
              value: type,
              label: type.toUpperCase(),
              description: t('agentTypeDescriptions.unknownType', { type }),
            }
          );
        });

        setAgentTypes(typesWithDefaults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.loadAgentTypesError'));
      // Manter tipos padrão em caso de erro
      setAgentTypes(getDefaultAgentTypes(t));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgentTypes();
  }, [clientId, t]);

  return {
    agentTypes,
    isLoading,
    error,
    refetch: loadAgentTypes,
  };
};
