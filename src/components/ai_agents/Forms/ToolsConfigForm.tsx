import { useState, useEffect } from 'react';

import CustomMCPServersSection from '../CustomMCPServersSection';
// import SystemToolsSection from '../SystemToolsSection';
import AgentToolsSection from '../AgentToolsSection';
import CustomToolsSection from '../CustomToolsSection';
// import MCPServersSection from '../MCPServersSection';
import OutputSchemaSection from '../OutputSchemaSection';
import AdvancedSettingsSection from '../AdvancedSettingsSection';

import { Tool } from '@/types/ai';
import { type Agent } from '@/types/agents';
import { MCPServerConfig } from '@/types/ai';
import { CustomTool } from '@/types/ai';

type AgentPageMode = 'create' | 'edit' | 'view';

export interface ToolsConfigData {
  tools: Tool[];
  agent_tools: string[]; // IDs de outros agentes
  agent_tools_data?: Agent[]; // Dados completos dos agentes (para exibição)
  custom_tools: {
    http_tools: CustomTool[];
  };
  mcp_servers: MCPServerConfig[];
  custom_mcp_server_ids: string[];
  custom_mcp_servers: Array<{
    url: string;
    headers?: Record<string, string>;
  }>;
  // Configurações avançadas
  load_memory: boolean;
  preload_memory: boolean;
  planner: boolean;
  load_knowledge: boolean;
  knowledge_tags: string[];
  output_schema: Record<
    string,
    {
      type?: string;
      description?: string;
    }
  >;
}

interface ToolsConfigFormProps {
  mode: AgentPageMode;
  data: ToolsConfigData;
  onChange: (data: ToolsConfigData) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  clientId: string;
  folderId?: string;
  editingAgentId?: string; // Para evitar auto-referência
}

const ToolsConfigForm = ({
  mode,
  data,
  onChange,
  onValidationChange,
  clientId,
  folderId,
  editingAgentId,
}: ToolsConfigFormProps) => {
  // Estados para controlar seções expandidas/colapsadas
  // const [showSystemTools, setShowSystemTools] = useState(true);
  // const [showMCPServers, setShowMCPServers] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showOutputSchema, setShowOutputSchema] = useState(false);

  // Validação sempre passa (ferramentas são opcionais)
  useEffect(() => {
    const timer = setTimeout(() => {
      onValidationChange(true, []);
    }, 0);
    return () => clearTimeout(timer);
  }, [onValidationChange]);

  const isReadOnly = mode === 'view';
  return (
    <div className="space-y-6">
      {/* Ferramentas do Sistema */}
      {/* <SystemToolsSection
        tools={data.tools}
            isOpen={showSystemTools}
            onToggle={() => setShowSystemTools(!showSystemTools)}
        onToolsChange={(tools) => onChange({ ...data, tools })}
        isReadOnly={isReadOnly}
      /> */}

      {/* Agentes como Ferramentas */}
      <AgentToolsSection
        agentTools={data.agent_tools}
        agentToolsData={data.agent_tools_data}
        onAgentToolsChange={(agentTools, agentToolsData) =>
          onChange({ ...data, agent_tools: agentTools, agent_tools_data: agentToolsData })
        }
        clientId={clientId}
        folderId={folderId}
        editingAgentId={editingAgentId}
        isReadOnly={isReadOnly}
      />

      {/* Ferramentas Customizadas */}
      <CustomToolsSection
        customTools={data.custom_tools}
        onCustomToolsChange={customTools => onChange({ ...data, custom_tools: customTools })}
        isReadOnly={isReadOnly}
      />

      {/* Servidores MCP */}
      {/* <MCPServersSection
        mcpServers={data.mcp_servers}
            isOpen={showMCPServers}
            onToggle={() => setShowMCPServers(!showMCPServers)}
        onMCPServersChange={(mcpServers) => onChange({ ...data, mcp_servers: mcpServers })}
        isReadOnly={isReadOnly}
      /> */}

      {/* MCPs Personalizados */}
      <CustomMCPServersSection
        customMCPServerIds={data.custom_mcp_server_ids}
        onCustomMCPServersChange={serverIds =>
          onChange({ ...data, custom_mcp_server_ids: serverIds })
        }
        isReadOnly={isReadOnly}
      />

      {/* Output Schema */}
      <OutputSchemaSection
        outputSchema={data.output_schema}
        isOpen={showOutputSchema}
        onToggle={() => setShowOutputSchema(!showOutputSchema)}
        onOutputSchemaChange={schema => onChange({ ...data, output_schema: schema })}
        isReadOnly={isReadOnly}
      />

      {/* Configurações Avançadas */}
      <AdvancedSettingsSection
        data={{
          load_memory: data.load_memory,
          preload_memory: data.preload_memory,
          planner: data.planner,
          load_knowledge: data.load_knowledge,
          knowledge_tags: data.knowledge_tags,
        }}
        isOpen={showAdvancedSettings}
        onToggle={() => setShowAdvancedSettings(!showAdvancedSettings)}
        onAdvancedSettingsChange={advancedSettings => onChange({ ...data, ...advancedSettings })}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default ToolsConfigForm;
