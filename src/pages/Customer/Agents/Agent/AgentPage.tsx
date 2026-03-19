import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

import AgentHeader from '@/components/ai_agents/Header/AgentHeader';
import AgentTabs, { TabValidation } from '@/components/ai_agents/Tabs/AgentTabs';
import { BasicInfoData } from '@/components/ai_agents/Forms/BasicInfoForm';
import { LLMConfigData } from '@/components/ai_agents/Forms/LLMConfigForm';
import { A2AConfigData } from '@/components/ai_agents/Forms/A2AConfigForm';
import { SubAgentsData } from '@/components/ai_agents/Forms/SubAgentsForm';
import { TaskConfigData } from '@/components/ai_agents/Forms/TaskConfigForm';
import { ExternalAgentConfigData } from '@/components/agents/ExternalAgentConfig';
import { ToolsConfigData } from '@/components/ai_agents/Forms/ToolsConfigForm';
import {
  getAgent,
  updateAgent,
  createAgent,
  listApiKeys,
  getAccessibleAgents,
} from '@/services/agents';
import { ApiKey, AgentCreate, Agent } from '@/types/agents';
import { CustomTool } from '@/types/ai';
import { extractBackendErrorMessage } from '@/utils/agentUtils';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { MCPServerConfig } from '@/types/ai';
import { Tool } from '@/types';

type AgentPageMode = 'create' | 'edit' | 'view';

const AgentPage = () => {
  const { t } = useLanguage('agents');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can, isReady: permissionsReady } = useUserPermissions();

  // Determinar o modo baseado na presença do ID e na rota
  const mode: AgentPageMode = (() => {
    if (!id) return 'create';
    // Por enquanto, sempre edit quando tem ID (depois implementaremos view)
    return 'edit';
  })();

  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados do sistema de tabs
  const [activeTab, setActiveTab] = useState('basic');
  const [validations, setValidations] = useState<Record<string, TabValidation>>({
    basic: { isValid: false, errors: [t('validation.nameRequired')] },
    configuration: { isValid: false, errors: [t('validation.configurationIncomplete')] },
    subagents: { isValid: true, errors: [] },
    tools: { isValid: true, errors: [] },
  });

  // Dados dos formulários
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    name: '',
    description: '',
    type: 'llm',
    role: '',
    goal: '',
  });

  const [llmConfigData, setLLMConfigData] = useState<LLMConfigData>({
    model: '',
    api_key_id: '',
    instruction: '',
    output_key: '',
    advanced_config: {
      message_wait_time: 5,
      message_signature: '',
      enable_text_segmentation: false,
      max_characters_per_segment: 300,
      min_segment_size: 50,
      character_delay_ms: 0.05,
    },
  });

  const [a2aConfigData, setA2AConfigData] = useState<A2AConfigData>({
    agent_card_url: '',
    output_key: '',
    external_sharing: {
      enabled: false,
      allowlist: [],
      callback_url: '',
      publish_state: 'draft',
    },
  });

  const [taskConfigData, setTaskConfigData] = useState<TaskConfigData>({
    tasks: [],
  });

  const [externalConfigData, setExternalConfigData] = useState<ExternalAgentConfigData>({
    provider: undefined,
  });

  const [subAgentsData, setSubAgentsData] = useState<SubAgentsData>({
    sub_agents: [],
  });

  const [toolsConfigData, setToolsConfigData] = useState<ToolsConfigData>({
    tools: [],
    agent_tools: [],
    agent_tools_data: [],
    custom_tools: {
      http_tools: [],
    },
    mcp_servers: [],
    custom_mcp_server_ids: [],
    custom_mcp_servers: [],
    // Configurações avançadas
    load_memory: false,
    preload_memory: false,
    planner: false,
    load_knowledge: false,
    knowledge_tags: [],
    output_schema: {},
  });

  // Estados para integração com backend
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Carregar API Keys
  const loadApiKeys = useCallback(async () => {
    try {
      const apiKeysData = await listApiKeys();
      setApiKeys(apiKeysData);
    } catch (error) {
      console.error(t('messages.apiKeysError'), error);
    }
  }, [t]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  // Função auxiliar para carregar dados completos dos agentes pelos IDs
  const loadAgentToolsData = useCallback(async (agentIds: string[]) => {
    if (agentIds.length === 0) return [];
    try {
      // Buscar todos os agentes acessíveis
      const { data: allAgents } = await getAccessibleAgents(0, 1000);

      // Filtrar apenas os agentes que estão nos IDs fornecidos
      const agentToolsData = allAgents.filter((agent: any) => agentIds.includes(agent.id));

      return agentToolsData;
    } catch (error) {
      console.error(t('messages.agentToolsError'), error);
      return [];
    }
  }, []);

  // Carregar dados do agente (modo edição)
  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadAgentData = async () => {
        try {
          setLoading(true);
          const agentData = await getAgent(id);

          // Mapear dados do agente para os estados
          setAgentName(agentData.name);
          setBasicInfoData({
            name: agentData.name,
            description: agentData.description || '',
            type: agentData.type,
            role: agentData.role || '',
            goal: agentData.goal || '',
            provider: agentData.config?.provider || undefined,
          });

          if (agentData.type === 'llm') {
            setLLMConfigData({
              model: agentData.model || '',
              api_key_id: agentData.api_key_id || '',
              instruction: agentData.instruction || '',
              output_key: agentData.config?.output_key || '',
              advanced_config: {
                message_wait_time: agentData.config?.message_wait_time ?? 5,
                message_signature: agentData.config?.message_signature ?? '',
                enable_text_segmentation: agentData.config?.enable_text_segmentation ?? false,
                max_characters_per_segment: agentData.config?.max_characters_per_segment ?? 300,
                min_segment_size: agentData.config?.min_segment_size ?? 50,
                character_delay_ms: agentData.config?.character_delay_ms ?? 0.05,
              },
            });
          } else if (agentData.type === 'a2a') {
            setA2AConfigData({
              agent_card_url: agentData.agent_card_url || '',
              output_key: agentData.config?.output_key || '',
              external_sharing: agentData.config?.external_sharing || {
                enabled: false,
                allowlist: [],
                callback_url: '',
                publish_state: 'draft',
              },
            });
          } else if (agentData.type === 'task') {
            setTaskConfigData({
              tasks: (agentData.config?.tasks || []) as Array<{
                agent_id: string;
                description: string;
                expected_output: string;
                enabled_tools: string[];
              }>,
            });
          } else if (agentData.type === 'external') {
            setExternalConfigData({
              provider: agentData.config?.provider as any,
            });
          }

          // Carregar dados de sub-agentes
          setSubAgentsData({
            sub_agents: agentData.config?.sub_agents || [],
          });

          // Carregar dados de ferramentas (aplicável a todos os tipos)
          const agentToolsIds = agentData.config?.agent_tools || [];
          const agentToolsData = await loadAgentToolsData(agentToolsIds);

          setToolsConfigData({
            tools: (agentData.config?.tools || []) as unknown as Tool[],
            agent_tools: agentToolsIds,
            agent_tools_data: agentToolsData as unknown as Agent[],
            custom_tools: {
              http_tools: (agentData.config?.custom_tools?.http_tools || []) as CustomTool[],
            },
            mcp_servers: (agentData.config?.mcp_servers || []) as unknown as MCPServerConfig[],
            custom_mcp_server_ids: agentData.config?.custom_mcp_server_ids || [],
            custom_mcp_servers: (agentData.config?.custom_mcp_servers || []) as Array<{
              url: string;
              headers?: Record<string, string>;
            }>,
            // Configurações avançadas
            load_memory: agentData.config?.load_memory || false,
            preload_memory: agentData.config?.preload_memory || false,
            planner: agentData.config?.planner || false,
            load_knowledge: agentData.config?.load_knowledge || false,
            knowledge_tags: agentData.config?.knowledge_tags || [],
            output_schema: (agentData.config?.output_schema || {}) as Record<
              string,
              {
                type?: string;
                description?: string;
              }
            >,
          });
        } catch (error) {
          console.error(t('messages.loadError'), error);
          toast.error(t('messages.loadError'), {
            description: t('messages.loadErrorDescription'),
          });
        } finally {
          setLoading(false);
        }
      };

      loadAgentData();
    }
  }, [mode, id, permissionsReady, loadAgentToolsData]);

  const handleBack = useCallback(() => {
    navigate('/agents');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      // TODO: Mostrar confirmação de cancelamento
      const confirm = window.confirm(t('messages.confirmCancel'));
      if (!confirm) return;
    }
    navigate('/agents');
  }, [isDirty, navigate]);

  const handleSave = useCallback(async () => {
    if (mode === 'create' && !can('ai_agents', 'create')) {
      toast.error(t('permissions.createDenied'));
      return;
    }
    if (mode === 'edit' && !can('ai_agents', 'update')) {
      toast.error(t('permissions.updateDenied'));
      return;
    }

    const toastId = toast.loading(
      mode === 'create' ? t('loading.creating') : t('loading.updating'),
    );

    try {
      setIsSaving(true);

      // Montar dados do agente baseado no tipo
      const agentData: AgentCreate = {
        name: basicInfoData.name,
        type: basicInfoData.type,
        // Descrição: inclui A2A também (opcional)
        description: basicInfoData.description,
      };

      // Adicionar config baseado no tipo
      if (basicInfoData.type === 'llm') {
        Object.assign(agentData, {
          role: basicInfoData.role,
          goal: basicInfoData.goal,
          model: llmConfigData.model,
          api_key_id: llmConfigData.api_key_id,
          instruction: llmConfigData.instruction,
        });

        agentData.config = {
          output_key: llmConfigData.output_key,
          // Configurações avançadas do bot (Evolution integration)
          message_wait_time: llmConfigData.advanced_config.message_wait_time,
          message_signature: llmConfigData.advanced_config.message_signature,
          enable_text_segmentation: llmConfigData.advanced_config.enable_text_segmentation,
          max_characters_per_segment: llmConfigData.advanced_config.max_characters_per_segment,
          min_segment_size: llmConfigData.advanced_config.min_segment_size,
          character_delay_ms: llmConfigData.advanced_config.character_delay_ms,
          ...subAgentsData,
          ...toolsConfigData,
          tools: toolsConfigData.tools.map(tool => tool as unknown as Record<string, unknown>),
          mcp_servers: toolsConfigData.mcp_servers.map(
            server => server as unknown as Record<string, unknown>,
          ),
        };
      } else if (basicInfoData.type === 'a2a') {
        Object.assign(agentData, {
          agent_card_url: a2aConfigData.agent_card_url,
        });

        agentData.config = {
          output_key: a2aConfigData.output_key,
          external_sharing: a2aConfigData.external_sharing,
          ...subAgentsData,
          ...toolsConfigData,
          tools: toolsConfigData.tools.map(tool => tool as unknown as Record<string, unknown>),
          mcp_servers: toolsConfigData.mcp_servers.map(
            server => server as unknown as Record<string, unknown>,
          ),
        };
      } else if (basicInfoData.type === 'task') {
        // Config para task agents
        agentData.config = {
          output_key: '',
          tasks: taskConfigData.tasks.map(task => task as unknown as Record<string, unknown>),
          sub_agents: [],
          ...toolsConfigData,
          tools: toolsConfigData.tools.map(tool => tool as unknown as Record<string, unknown>),
          mcp_servers: toolsConfigData.mcp_servers.map(
            server => server as unknown as Record<string, unknown>,
          ),
        };
      } else if (basicInfoData.type === 'external') {
        // Config para external agents
        agentData.config = {
          provider: externalConfigData.provider || basicInfoData.provider || '',
          output_key: '',
        };
      } else {
        // Config para outros tipos (sequential, parallel, loop, workflow, etc)
        agentData.config = {
          output_key: '',
          ...subAgentsData,
          ...toolsConfigData,
          tools: toolsConfigData.tools.map(tool => tool as unknown as Record<string, unknown>),
          mcp_servers: toolsConfigData.mcp_servers.map(
            server => server as unknown as Record<string, unknown>,
          ),
        };
      }

      if (mode === 'create') {
        await createAgent(agentData);
        toast.success(t('messages.createSuccess'), { id: toastId });
        navigate('/agents');
      } else if (mode === 'edit' && id) {
        await updateAgent(id, agentData);
        toast.success(t('messages.updateSuccess'), { id: toastId });
        setIsDirty(false);
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar agente:', error);

      // Extrair mensagem de erro amigável do backend
      const errorMessage = extractBackendErrorMessage(error);

      toast.error(t('messages.saveError'), {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    mode,
    id,
    basicInfoData,
    llmConfigData,
    a2aConfigData,
    taskConfigData,
    externalConfigData,
    subAgentsData,
    toolsConfigData,
    navigate,
  ]);

  const handleEdit = useCallback(() => {
    if (id) {
      navigate(`/agents/${id}/edit`);
    }
  }, [id, navigate]);

  const handleViewMode = useCallback(() => {
    if (id) {
      navigate(`/agents/${id}`); // TODO: Implementar rota de visualização
    }
  }, [id, navigate]);

  const handleDuplicate = useCallback(() => {
    // TODO: Implementar duplicação
    console.log('Duplicando agente...');
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleBasicInfoChange = useCallback(
    (data: BasicInfoData) => {
      setBasicInfoData(prevData => {
        // Evitar atualizações desnecessárias
        if (JSON.stringify(prevData) === JSON.stringify(data)) {
          return prevData;
        }
        return data;
      });

      setIsDirty(true);

      // Atualizar nome do agente no header quando mudado
      setAgentName(prevName => {
        if (data.name && data.name !== prevName) {
          return data.name;
        }
        return prevName;
      });
    },
    [], // Remover dependência de agentName
  );

  const handleLLMConfigChange = useCallback((data: LLMConfigData) => {
    setLLMConfigData(prevData => {
      // Evitar atualizações desnecessárias
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });

    setIsDirty(true);
  }, []);

  const handleA2AConfigChange = useCallback((data: A2AConfigData) => {
    setA2AConfigData(prevData => {
      // Evitar atualizações desnecessárias
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });

    setIsDirty(true);
  }, []);

  const handleTaskConfigChange = useCallback((data: TaskConfigData) => {
    setTaskConfigData(prevData => {
      // Evitar atualizações desnecessárias
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });

    setIsDirty(true);
  }, []);

  const handleSubAgentsChange = useCallback((data: SubAgentsData) => {
    setSubAgentsData(prevData => {
      // Evitar atualizações desnecessárias
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });

    setIsDirty(true);
  }, []);

  const handleToolsConfigChange = useCallback((data: ToolsConfigData) => {
    setToolsConfigData(prevData => {
      // Evitar atualizações desnecessárias
      if (JSON.stringify(prevData) === JSON.stringify(data)) {
        return prevData;
      }
      return data;
    });

    setIsDirty(true);
  }, []);

  const handleValidationChange = useCallback(
    (tabId: string, isValid: boolean, errors: string[]) => {
      setValidations(prev => {
        // Evitar atualizações desnecessárias
        const current = prev[tabId];
        if (
          current &&
          current.isValid === isValid &&
          JSON.stringify(current.errors) === JSON.stringify(errors)
        ) {
          return prev;
        }

        return {
          ...prev,
          [tabId]: { isValid, errors },
        };
      });
    },
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <AgentHeader
        mode={mode}
        agentName={agentName}
        isDirty={isDirty}
        isSaving={isSaving}
        onBack={handleBack}
        onSave={handleSave}
        onCancel={handleCancel}
        onEdit={handleEdit}
        onViewMode={handleViewMode}
        onDuplicate={handleDuplicate}
      />

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <AgentTabs
            mode={mode}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            validations={validations}
            agentType={basicInfoData.type}
            basicInfoData={basicInfoData}
            onBasicInfoChange={handleBasicInfoChange}
            llmConfigData={llmConfigData}
            onLLMConfigChange={handleLLMConfigChange}
            a2aConfigData={a2aConfigData}
            onA2AConfigChange={handleA2AConfigChange}
            taskConfigData={taskConfigData}
            onTaskConfigChange={handleTaskConfigChange}
            externalConfigData={externalConfigData}
            onExternalConfigChange={setExternalConfigData}
            subAgentsData={subAgentsData}
            onSubAgentsChange={handleSubAgentsChange}
            toolsConfigData={toolsConfigData}
            onToolsConfigChange={handleToolsConfigChange}
            onValidationChange={handleValidationChange}
            apiKeys={apiKeys}
            onApiKeysReload={loadApiKeys}
            clientId="default"
            editingAgentId={id}
            folderId={undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
