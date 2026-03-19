import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  ScrollArea,
} from '@evoapi/design-system';
import { Search, X, Users, Plus, Check, Loader2 } from 'lucide-react';
import { listAgents } from '@/services/agents';
import { useLanguage } from '@/hooks/useLanguage';

type AgentPageMode = 'create' | 'edit' | 'view';

// Definindo apenas as propriedades necessárias do Agent
interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface SubAgentsData {
  sub_agents: string[];
}

interface SubAgentsFormProps {
  mode: AgentPageMode;
  data: SubAgentsData;
  onChange: (data: SubAgentsData) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  editingAgentId?: string;
  folderId?: string;
}

const SubAgentsForm = ({
  mode,
  data,
  onChange,
  onValidationChange,
  editingAgentId,
  folderId,
}: SubAgentsFormProps) => {
  const { t } = useLanguage('aiAgents');
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validação sempre verdadeira pois sub-agentes são opcionais
  useEffect(() => {
    onValidationChange(true, []);
  }, [onValidationChange]);

  // Carregar agentes disponíveis
  useEffect(() => {
    loadAvailableAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, editingAgentId]);

  const loadAvailableAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listAgents(0, 100, folderId);

      // Filtrar o agente atual para evitar auto-referência
      const filteredAgents = response.data.filter((agent: any) => agent.id !== editingAgentId);
      setAvailableAgents(filteredAgents);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(t('subAgents.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar agentes baseado na busca
  const filteredAgents = availableAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Obter nome do agente por ID
  const getAgentNameById = (agentId: string): string => {
    const agent = availableAgents.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  };

  // Obter tipo do agente por ID
  const getAgentTypeById = (agentId: string): string => {
    const agent = availableAgents.find(a => a.id === agentId);
    return agent ? agent.type : 'unknown';
  };

  const handleAddSubAgent = useCallback(
    (agentId: string) => {
      if (!data.sub_agents.includes(agentId)) {
        onChange({
          ...data,
          sub_agents: [...data.sub_agents, agentId],
        });
      }
    },
    [data, onChange],
  );

  const handleRemoveSubAgent = useCallback(
    (agentId: string) => {
      onChange({
        ...data,
        sub_agents: data.sub_agents.filter(id => id !== agentId),
      });
    },
    [data, onChange],
  );

  const isReadOnly = mode === 'view';

  return (
    <div className="flex flex-col space-y-3">
      {/* Card de Sub-Agentes Selecionados */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-500/10">
              <Users className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-sm">{t('subAgents.title')}</CardTitle>
              <CardDescription className="text-xs">{t('subAgents.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0 pb-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('subAgents.complexCompositions')}</p>
            <Badge variant="outline" className="text-xs">
              {t('subAgents.selectedCount', { count: data.sub_agents.length })}
            </Badge>
          </div>

          {/* Lista de Sub-Agentes Selecionados */}
          {data.sub_agents.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('subAgents.selectedSubAgents')}</Label>
              <div className="flex flex-wrap gap-2">
                {data.sub_agents.map(agentId => (
                  <div
                    key={agentId}
                    className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border"
                  >
                    <span className="font-medium text-sm">{getAgentNameById(agentId)}</span>
                    <Badge variant="outline" className="text-xs">
                      {getAgentTypeById(agentId)}
                    </Badge>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveSubAgent(agentId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t('subAgents.noSubAgentsSelected')}</p>
              <p className="text-sm">
                {isReadOnly ? t('subAgents.noSubAgentsUsed') : t('subAgents.addFromListBelow')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Agentes Disponíveis */}
      {!isReadOnly && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('subAgents.availableAgents')}</CardTitle>
            <CardDescription className="text-xs">{t('subAgents.selectToAdd')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Campo de busca */}
            <div className="space-y-1.5">
              <Label htmlFor="search-agents" className="text-sm">
                {t('subAgents.searchAgents')}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="search-agents"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t('subAgents.searchPlaceholder')}
                  className="pl-9 h-9 text-sm"
                  disabled={isLoading}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Estados de carregamento e erro */}
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t('subAgents.loadingAgents')}
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-6 text-destructive">
                <p className="font-medium text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={loadAvailableAgents} className="mt-2">
                  {t('actions.tryAgain')}
                </Button>
              </div>
            )}

            {/* Lista de agentes */}
            {!isLoading && !error && (
              <ScrollArea className="h-[250px]">
                <div className="space-y-1.5 pr-4">
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map(agent => {
                      const isSelected = data.sub_agents.includes(agent.id);
                      return (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-sm">{agent.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {agent.type}
                              </Badge>
                            </div>
                            {agent.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {agent.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant={isSelected ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() =>
                              isSelected
                                ? handleRemoveSubAgent(agent.id)
                                : handleAddSubAgent(agent.id)
                            }
                            className="ml-2 h-7 text-xs"
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                {t('actions.added')}
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                {t('actions.add')}
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })
                  ) : searchTerm ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-sm">{t('subAgents.noAgentsFound')}</p>
                      <p className="text-xs">{t('subAgents.adjustSearch')}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-sm">{t('subAgents.noAvailableAgents')}</p>
                      <p className="text-xs">
                        {folderId
                          ? t('subAgents.noOtherAgentsInFolder')
                          : t('subAgents.createOtherAgentsFirst')}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações gerais - Compacto - Apenas em modo edit/view */}
      {mode !== 'create' && (
        <Card>
          <CardHeader className="pb-1.5">
            <CardTitle className="text-xs">{t('subAgents.howItWorks.title')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 space-y-1 text-xs text-muted-foreground">
            <p>
              • <strong>{t('subAgents.howItWorks.composition.title')}:</strong>{' '}
              {t('subAgents.howItWorks.composition.description')}
            </p>
            <p>
              • <strong>{t('subAgents.howItWorks.execution.title')}:</strong>{' '}
              {t('subAgents.howItWorks.execution.description')}
            </p>
            <p>
              • <strong>{t('subAgents.howItWorks.context.title')}:</strong>{' '}
              {t('subAgents.howItWorks.context.description')}
            </p>
            <p>
              • <strong>{t('subAgents.howItWorks.flexibility.title')}:</strong>{' '}
              {t('subAgents.howItWorks.flexibility.description')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubAgentsForm;
