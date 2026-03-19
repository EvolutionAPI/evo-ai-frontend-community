import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@evoapi/design-system';
import { Server, Network, Plus, Loader2 } from 'lucide-react';
import { MCPServerConfig } from '@/types/ai';
import { useState } from 'react';
import CustomMCPServersSection from '@/components/ai_agents/CustomMCPServersSection';
import { MCPCard } from '@/components/integrations/MCPCard';
import { IntegrationDialogs } from '@/components/integrations/IntegrationDialogs';
import { useMCPIntegrations } from '@/hooks/useMCPIntegrations';
import { getAvailableMCPs } from '@/constants/mcpIntegrations';

interface MCPServersSectionProps {
  mcpServers: MCPServerConfig[];
  customMCPServerIds: string[];
  onMCPServersChange: (mcpServers: MCPServerConfig[]) => void;
  onCustomMCPServersChange: (serverIds: string[]) => void;
  agentId: string;
}

const MCPServersSection = ({
  mcpServers,
  customMCPServerIds,
  onMCPServersChange,
  onCustomMCPServersChange,
  agentId,
}: MCPServersSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const [showCustomMCPs, setShowCustomMCPs] = useState(false);

  // Dialog states
  const [showGitHubConfig, setShowGitHubConfig] = useState(false);
  const [showNotionConfig, setShowNotionConfig] = useState(false);
  const [showStripeConfig, setShowStripeConfig] = useState(false);
  const [showLinearConfig, setShowLinearConfig] = useState(false);
  const [showMondayConfig, setShowMondayConfig] = useState(false);
  const [showAtlassianConfig, setShowAtlassianConfig] = useState(false);
  const [showAsanaConfig, setShowAsanaConfig] = useState(false);
  const [showHubSpotConfig, setShowHubSpotConfig] = useState(false);
  const [showPayPalConfig, setShowPayPalConfig] = useState(false);
  const [showCanvaConfig, setShowCanvaConfig] = useState(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);

  // Use custom hook for integrations
  const {
    githubConfig,
    notionConfig,
    stripeConfig,
    linearConfig,
    mondayConfig,
    atlassianConfig,
    asanaConfig,
    hubspotConfig,
    paypalConfig,
    canvaConfig,
    supabaseConfig,
    credentialsConfigured,
    isCheckingCredentials,
    reloadAllConfigs,
    isConnected,
  } = useMCPIntegrations(agentId);


  const availableMCPs = getAvailableMCPs(t);

  const isMCPEnabled = (mcpId: string): boolean => {
    return mcpServers.some(mcp => mcp.id === mcpId);
  };

  const toggleMCP = (mcpId: string) => {
    const isEnabled = isMCPEnabled(mcpId);
    if (isEnabled) {
      onMCPServersChange(mcpServers.filter(mcp => mcp.id !== mcpId));
    } else {
      const mcpInfo = availableMCPs.find(mcp => mcp.id === mcpId);
      const newMCP: MCPServerConfig = {
        id: mcpId,
        name: mcpInfo?.name || mcpId,
        type: 'standard',
        environments: {},
        tools: [],
      };
      onMCPServersChange([...mcpServers, newMCP]);
    }
  };

  const INTEGRATION_MCP_IDS = [
    'github',
    'notion',
    'stripe',
    'linear',
    'monday',
    'atlassian',
    'asana',
    'hubspot',
    'paypal',
    'canva',
    'supabase',
  ];

  const getDialogSetter = (mcpId: string): (() => void) | undefined => {
    const setters: Record<string, () => void> = {
      github: () => setShowGitHubConfig(true),
      notion: () => setShowNotionConfig(true),
      stripe: () => setShowStripeConfig(true),
      linear: () => setShowLinearConfig(true),
      monday: () => setShowMondayConfig(true),
      atlassian: () => setShowAtlassianConfig(true),
      asana: () => setShowAsanaConfig(true),
      hubspot: () => setShowHubSpotConfig(true),
      paypal: () => setShowPayPalConfig(true),
      canva: () => setShowCanvaConfig(true),
      supabase: () => setShowSupabaseConfig(true),
    };
    return setters[mcpId];
  };

  return (
    <div className="space-y-8">
      {/* Seção: MCPs Disponíveis */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Server className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('mcpServers.title') || 'Servidores MCP'}</h3>
            <p className="text-sm text-muted-foreground">
              {t('mcpServers.subtitle') ||
                'Conecte o agente a serviços externos através do Model Context Protocol'}
            </p>
          </div>
        </div>

        <div className="pl-11">
          {isCheckingCredentials ? (
            <div className="flex flex-col gap-3 items-center py-12 h-32 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin" />
              <div className="text-sm">
                {t('mcpServers.checkingIntegrations') || 'Verificando integrações disponíveis...'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableMCPs.map(mcp => {
                const isEnabled = isMCPEnabled(mcp.id);
                const isConfigured = credentialsConfigured[mcp.id] ?? false;
                const connected = isConnected(mcp.id);
                const onConfigure = getDialogSetter(mcp.id);
                const isIntegrationMCP = INTEGRATION_MCP_IDS.includes(mcp.id);

                return (
                  <MCPCard
                    key={mcp.id}
                    mcp={mcp}
                    isEnabled={isEnabled}
                    isConfigured={isConfigured}
                    isConnected={connected}
                    onToggle={!isIntegrationMCP ? () => toggleMCP(mcp.id) : undefined}
                    onConfigure={onConfigure}
                    showComingSoon={!isConfigured}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Seção: MCPs Personalizados */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Network className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {t('customMCPServers.title') || 'MCPs Personalizados'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('customMCPServers.subtitle') ||
                'Adicione servidores MCP personalizados criados por você'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowCustomMCPs(!showCustomMCPs)}
          >
            <Plus className="h-4 w-4" />
            {t('customMCPServers.add') || 'Adicionar Custom MCP'}
          </Button>
        </div>

        {showCustomMCPs && (
          <div className="pl-11">
            <CustomMCPServersSection
              customMCPServerIds={customMCPServerIds}
              onCustomMCPServersChange={onCustomMCPServersChange}
              isReadOnly={false}
            />
          </div>
        )}
      </div>

      {/* Integration Dialogs */}
      <IntegrationDialogs
        agentId={agentId}
        mcpServers={mcpServers}
        onMCPServersChange={onMCPServersChange}
        onConfigReload={reloadAllConfigs}
        githubConfig={githubConfig}
        notionConfig={notionConfig}
        stripeConfig={stripeConfig}
        linearConfig={linearConfig}
        mondayConfig={mondayConfig}
        atlassianConfig={atlassianConfig}
        asanaConfig={asanaConfig}
        hubspotConfig={hubspotConfig}
        paypalConfig={paypalConfig}
        canvaConfig={canvaConfig}
        supabaseConfig={supabaseConfig}
        showGitHubConfig={showGitHubConfig}
        showNotionConfig={showNotionConfig}
        showStripeConfig={showStripeConfig}
        showLinearConfig={showLinearConfig}
        showMondayConfig={showMondayConfig}
        showAtlassianConfig={showAtlassianConfig}
        showAsanaConfig={showAsanaConfig}
        showHubSpotConfig={showHubSpotConfig}
        showPayPalConfig={showPayPalConfig}
        showCanvaConfig={showCanvaConfig}
        showSupabaseConfig={showSupabaseConfig}
        setShowGitHubConfig={setShowGitHubConfig}
        setShowNotionConfig={setShowNotionConfig}
        setShowStripeConfig={setShowStripeConfig}
        setShowLinearConfig={setShowLinearConfig}
        setShowMondayConfig={setShowMondayConfig}
        setShowAtlassianConfig={setShowAtlassianConfig}
        setShowAsanaConfig={setShowAsanaConfig}
        setShowHubSpotConfig={setShowHubSpotConfig}
        setShowPayPalConfig={setShowPayPalConfig}
        setShowCanvaConfig={setShowCanvaConfig}
        setShowSupabaseConfig={setShowSupabaseConfig}
      />
    </div>
  );
};

export default MCPServersSection;
