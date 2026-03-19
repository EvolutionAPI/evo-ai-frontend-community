import { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@evoapi/design-system';
import { Card, CardContent, CardHeader } from '@evoapi/design-system';
import { User, Settings, Wrench, Users } from 'lucide-react';
import BasicInfoForm, { BasicInfoData } from '../Forms/BasicInfoForm';
import LLMConfigForm, { LLMConfigData } from '../Forms/LLMConfigForm';
import A2AConfigForm, { A2AConfigData } from '../Forms/A2AConfigForm';
import ToolsConfigForm, { ToolsConfigData } from '../Forms/ToolsConfigForm';
import SubAgentsForm, { SubAgentsData } from '../Forms/SubAgentsForm';
import TaskConfigForm, { TaskConfigData } from '../Forms/TaskConfigForm';
import ExternalAgentConfig, { ExternalAgentConfigData } from '@/components/agents/ExternalAgentConfig';
import { ApiKey } from '@/types/agents';
import { useLanguage } from '@/hooks/useLanguage';

type AgentPageMode = 'create' | 'edit' | 'view';

export interface TabValidation {
  isValid: boolean;
  errors: string[];
}

export interface AgentTabsProps {
  mode: AgentPageMode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  validations: Record<string, TabValidation>;
  agentType?: string;
  basicInfoData: BasicInfoData;
  onBasicInfoChange: (data: BasicInfoData) => void;
  llmConfigData?: LLMConfigData;
  onLLMConfigChange?: (data: LLMConfigData) => void;
  a2aConfigData?: A2AConfigData;
  onA2AConfigChange?: (data: A2AConfigData) => void;
  taskConfigData?: TaskConfigData;
  onTaskConfigChange?: (data: TaskConfigData) => void;
  externalConfigData?: ExternalAgentConfigData;
  onExternalConfigChange?: (data: ExternalAgentConfigData) => void;
  subAgentsData?: SubAgentsData;
  onSubAgentsChange?: (data: SubAgentsData) => void;
  toolsConfigData?: ToolsConfigData;
  onToolsConfigChange?: (data: ToolsConfigData) => void;
  onValidationChange: (tabId: string, isValid: boolean, errors: string[]) => void;
  apiKeys?: ApiKey[];
  onApiKeysReload?: () => void;
  clientId?: string;
  editingAgentId?: string;
  folderId?: string;
}

// Configuração das tabs baseada no tipo de agente
const getTabsConfig = (agentType: string | undefined, t: (key: string) => string) => {
  const baseTabs = [
    {
      id: 'basic',
      label: t('tabs.basic'),
      icon: User,
      description: t('basicInfo.title'),
    },
    {
      id: 'configuration',
      label: t('tabs.configuration'),
      icon: Settings,
      description: t('tabs.configuration'),
    },
    {
      id: 'subagents',
      label: t('tabs.subagents'),
      icon: Users,
      description: t('subagents.description'),
    },
  ];

  // Adicionar tab de ferramentas para tipos que suportam
  const supportsTools = ['llm', 'sequential', 'parallel', 'loop'];
  if (!agentType || supportsTools.includes(agentType)) {
    baseTabs.push({
      id: 'tools',
      label: t('tabs.tools'),
      icon: Wrench,
      description: t('tools.title'),
    });
  }

  return baseTabs;
};

const TabContent = ({
  tabId,
  mode,
  agentType,
  basicInfoData,
  onBasicInfoChange,
  llmConfigData,
  onLLMConfigChange,
  a2aConfigData,
  onA2AConfigChange,
  taskConfigData,
  onTaskConfigChange,
  externalConfigData,
  onExternalConfigChange,
  subAgentsData,
  onSubAgentsChange,
  toolsConfigData,
  onToolsConfigChange,
  onValidationChange,
  apiKeys,
  onApiKeysReload,
  clientId,
  editingAgentId,
  folderId,
}: {
  tabId: string;
  mode: AgentPageMode;
  agentType?: string;
  basicInfoData?: BasicInfoData;
  onBasicInfoChange?: (data: BasicInfoData) => void;
  llmConfigData?: LLMConfigData;
  onLLMConfigChange?: (data: LLMConfigData) => void;
  a2aConfigData?: A2AConfigData;
  onA2AConfigChange?: (data: A2AConfigData) => void;
  taskConfigData?: TaskConfigData;
  onTaskConfigChange?: (data: TaskConfigData) => void;
  externalConfigData?: ExternalAgentConfigData;
  onExternalConfigChange?: (data: ExternalAgentConfigData) => void;
  subAgentsData?: SubAgentsData;
  onSubAgentsChange?: (data: SubAgentsData) => void;
  toolsConfigData?: ToolsConfigData;
  onToolsConfigChange?: (data: ToolsConfigData) => void;
  onValidationChange?: (tabId: string, isValid: boolean, errors: string[]) => void;
  apiKeys?: ApiKey[];
  onApiKeysReload?: () => void;
  clientId?: string;
  editingAgentId?: string;
  folderId?: string;
}) => {
  const { t } = useLanguage('aiAgents');

  const getTabTitle = () => {
    switch (tabId) {
      case 'basic':
        return t('basicInfo.title');
      case 'configuration':
        return t('tabs.configuration');
      case 'subagents':
        return t('subagents.title');
      case 'tools':
        return t('tools.title');
      default:
        return t('tabs.configuration');
    }
  };

  const getTabDescription = () => {
    switch (tabId) {
      case 'basic':
        return t('basicInfo.title');
      case 'configuration':
        return t('tabs.configuration');
      case 'subagents':
        return t('subagents.description');
      case 'tools':
        return t('tools.title');
      default:
        return '';
    }
  };

  // Renderizar formulário real para tab 'basic'
  if (tabId === 'basic' && basicInfoData && onBasicInfoChange && onValidationChange) {
    return (
      <BasicInfoForm
        mode={mode}
        data={basicInfoData}
        onChange={onBasicInfoChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
      />
    );
  }

  // Renderizar formulário de configuração LLM
  if (
    tabId === 'configuration' &&
    agentType === 'llm' &&
    llmConfigData &&
    onLLMConfigChange &&
    onValidationChange &&
    apiKeys
  ) {
    return (
      <LLMConfigForm
        mode={mode}
        data={llmConfigData}
        onChange={onLLMConfigChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
        apiKeys={apiKeys}
        onApiKeysReload={onApiKeysReload}
      />
    );
  }

  // Renderizar formulário de configuração A2A
  if (
    tabId === 'configuration' &&
    agentType === 'a2a' &&
    a2aConfigData &&
    onA2AConfigChange &&
    onValidationChange
  ) {
    return (
      <A2AConfigForm
        mode={mode}
        data={a2aConfigData}
        onChange={onA2AConfigChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
      />
    );
  }

  // Renderizar formulário de configuração Task
  if (
    tabId === 'configuration' &&
    agentType === 'task' &&
    taskConfigData &&
    onTaskConfigChange &&
    onValidationChange
  ) {
    return (
      <TaskConfigForm
        mode={mode}
        data={taskConfigData}
        onChange={onTaskConfigChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
        editingAgentId={editingAgentId}
        folderId={folderId}
      />
    );
  }

  // Renderizar formulário de configuração External
  if (
    tabId === 'configuration' &&
    agentType === 'external' &&
    externalConfigData &&
    onExternalConfigChange &&
    onValidationChange
  ) {
    return (
      <ExternalAgentConfig
        mode={mode}
        agentId={editingAgentId}
        data={externalConfigData}
        onChange={onExternalConfigChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
      />
    );
  }

  // Renderizar formulário de sub-agentes
  if (
    tabId === 'subagents' &&
    subAgentsData &&
    onSubAgentsChange &&
    onValidationChange &&
    clientId
  ) {
    return (
      <SubAgentsForm
        mode={mode}
        data={subAgentsData}
        onChange={onSubAgentsChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
        editingAgentId={editingAgentId}
        folderId={folderId}
      />
    );
  }

  // Renderizar formulário de ferramentas
  if (
    tabId === 'tools' &&
    toolsConfigData &&
    onToolsConfigChange &&
    onValidationChange &&
    clientId
  ) {
    return (
      <ToolsConfigForm
        mode={mode}
        data={toolsConfigData}
        onChange={onToolsConfigChange}
        onValidationChange={(isValid, errors) => onValidationChange(tabId, isValid, errors)}
        clientId={clientId}
        folderId={folderId}
        editingAgentId={editingAgentId}
      />
    );
  }

  // Placeholder para outras tabs
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-lg font-semibold">{getTabTitle()}</h3>
          <p className="text-sm text-muted-foreground">{getTabDescription()}</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">
              🚧 {t('messages.formUnderConstruction', { form: tabId })}
            </p>
            <p className="text-sm">
              {t('messages.mode')}: <strong>{mode}</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AgentTabs = ({
  mode,
  activeTab,
  onTabChange,
  agentType,
  basicInfoData,
  onBasicInfoChange,
  llmConfigData,
  onLLMConfigChange,
  a2aConfigData,
  onA2AConfigChange,
  taskConfigData,
  onTaskConfigChange,
  externalConfigData,
  onExternalConfigChange,
  subAgentsData,
  onSubAgentsChange,
  toolsConfigData,
  onToolsConfigChange,
  onValidationChange,
  apiKeys,
  onApiKeysReload,
  clientId,
  editingAgentId,
  folderId,
}: AgentTabsProps) => {
  const { t } = useLanguage('aiAgents');
  const tabs = useMemo(() => getTabsConfig(agentType, t), [agentType, t]);

  // Validar se a tab ativa é válida
  useEffect(() => {
    const validTabIds = tabs.map(tab => tab.id);
    if (!validTabIds.includes(activeTab)) {
      onTabChange(validTabIds[0]);
    }
  }, [activeTab, tabs, onTabChange]);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList
          className={`grid w-full ${
            tabs.length === 2 ? 'grid-cols-2' : tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
          } mb-8`}
        >
          {tabs.map(tab => {
            const IconComponent = tab.icon;

            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <TabContent
              tabId={tab.id}
              mode={mode}
              agentType={agentType}
              basicInfoData={basicInfoData}
              onBasicInfoChange={onBasicInfoChange}
              llmConfigData={llmConfigData}
              onLLMConfigChange={onLLMConfigChange}
              a2aConfigData={a2aConfigData}
              onA2AConfigChange={onA2AConfigChange}
              taskConfigData={taskConfigData}
              onTaskConfigChange={onTaskConfigChange}
              externalConfigData={externalConfigData}
              onExternalConfigChange={onExternalConfigChange}
              subAgentsData={subAgentsData}
              onSubAgentsChange={onSubAgentsChange}
              toolsConfigData={toolsConfigData}
              onToolsConfigChange={onToolsConfigChange}
              onValidationChange={onValidationChange}
              apiKeys={apiKeys}
              onApiKeysReload={onApiKeysReload}
              clientId={clientId}
              editingAgentId={editingAgentId}
              folderId={folderId}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AgentTabs;
