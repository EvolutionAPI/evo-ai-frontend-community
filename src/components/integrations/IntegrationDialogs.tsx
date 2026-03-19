import { MCPServerConfig } from '@/types/ai';
import GitHubConfigDialog from '@/components/integrations/GitHubConfigDialog';
import NotionConfigDialog from '@/components/integrations/NotionConfigDialog';
import StripeConfigDialog from '@/components/integrations/StripeConfigDialog';
import LinearConfigDialog from '@/components/integrations/LinearConfigDialog';
import MondayConfigDialog from '@/components/integrations/MondayConfigDialog';
import AtlassianConfigDialog from '@/components/integrations/AtlassianConfigDialog';
import AsanaConfigDialog from '@/components/integrations/AsanaConfigDialog';
import HubSpotConfigDialog from '@/components/integrations/HubSpotConfigDialog';
import PayPalConfigDialog from '@/components/integrations/PayPalConfigDialog';
import CanvaConfigDialog from '@/components/integrations/CanvaConfigDialog';
import SupabaseConfigDialog from '@/components/integrations/SupabaseConfigDialog';
import type {
  GitHubConfig,
  NotionConfig,
  StripeConfig,
  LinearConfig,
  MondayConfig,
  AtlassianConfig,
  AsanaConfig,
  HubSpotConfig,
  PayPalConfig,
  CanvaConfig,
  SupabaseConfig,
} from '@/types/integrations';

interface IntegrationDialogsProps {
  agentId: string;
  mcpServers: MCPServerConfig[];
  onMCPServersChange: (servers: MCPServerConfig[]) => void;
  onConfigReload: () => void;
  // Configs
  githubConfig: GitHubConfig | null;
  notionConfig: NotionConfig | null;
  stripeConfig: StripeConfig | null;
  linearConfig: LinearConfig | null;
  mondayConfig: MondayConfig | null;
  atlassianConfig: AtlassianConfig | null;
  asanaConfig: AsanaConfig | null;
  hubspotConfig: HubSpotConfig | null;
  paypalConfig: PayPalConfig | null;
  canvaConfig: CanvaConfig | null;
  supabaseConfig: SupabaseConfig | null;
  // Dialog states
  showGitHubConfig: boolean;
  showNotionConfig: boolean;
  showStripeConfig: boolean;
  showLinearConfig: boolean;
  showMondayConfig: boolean;
  showAtlassianConfig: boolean;
  showAsanaConfig: boolean;
  showHubSpotConfig: boolean;
  showPayPalConfig: boolean;
  showCanvaConfig: boolean;
  showSupabaseConfig: boolean;
  // Dialog setters
  setShowGitHubConfig: (show: boolean) => void;
  setShowNotionConfig: (show: boolean) => void;
  setShowStripeConfig: (show: boolean) => void;
  setShowLinearConfig: (show: boolean) => void;
  setShowMondayConfig: (show: boolean) => void;
  setShowAtlassianConfig: (show: boolean) => void;
  setShowAsanaConfig: (show: boolean) => void;
  setShowHubSpotConfig: (show: boolean) => void;
  setShowPayPalConfig: (show: boolean) => void;
  setShowCanvaConfig: (show: boolean) => void;
  setShowSupabaseConfig: (show: boolean) => void;
}

const isMCPEnabled = (mcpServers: MCPServerConfig[], mcpId: string): boolean => {
  return mcpServers.some(mcp => mcp.id === mcpId);
};

const addMCPToServers = (
  mcpServers: MCPServerConfig[],
  mcpId: string,
  mcpName: string,
): MCPServerConfig[] => {
  if (isMCPEnabled(mcpServers, mcpId)) {
    return mcpServers;
  }
  const newMCP: MCPServerConfig = {
    id: mcpId,
    name: mcpName,
    type: 'standard',
    environments: {},
    tools: [],
  };
  return [...mcpServers, newMCP];
};

const removeMCPFromServers = (mcpServers: MCPServerConfig[], mcpId: string): MCPServerConfig[] => {
  return mcpServers.filter(mcp => mcp.id !== mcpId);
};

export function IntegrationDialogs({
  agentId,
  mcpServers,
  onMCPServersChange,
  onConfigReload,
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
  showGitHubConfig,
  showNotionConfig,
  showStripeConfig,
  showLinearConfig,
  showMondayConfig,
  showAtlassianConfig,
  showAsanaConfig,
  showHubSpotConfig,
  showPayPalConfig,
  showCanvaConfig,
  showSupabaseConfig,
  setShowGitHubConfig,
  setShowNotionConfig,
  setShowStripeConfig,
  setShowLinearConfig,
  setShowMondayConfig,
  setShowAtlassianConfig,
  setShowAsanaConfig,
  setShowHubSpotConfig,
  setShowPayPalConfig,
  setShowCanvaConfig,
  setShowSupabaseConfig,
}: IntegrationDialogsProps) {
  return (
    <>
      <GitHubConfigDialog
        open={showGitHubConfig}
        onOpenChange={setShowGitHubConfig}
        agentId={agentId}
        initialConfig={githubConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'github', 'GitHub'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'github'));
          onConfigReload();
        }}
      />

      <NotionConfigDialog
        open={showNotionConfig}
        onOpenChange={setShowNotionConfig}
        agentId={agentId}
        initialConfig={notionConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'notion', 'Notion'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'notion'));
          onConfigReload();
        }}
      />

      <StripeConfigDialog
        open={showStripeConfig}
        onOpenChange={setShowStripeConfig}
        agentId={agentId}
        initialConfig={stripeConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'stripe', 'Stripe'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'stripe'));
          onConfigReload();
        }}
      />

      <LinearConfigDialog
        open={showLinearConfig}
        onOpenChange={setShowLinearConfig}
        agentId={agentId}
        initialConfig={linearConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'linear', 'Linear'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'linear'));
          onConfigReload();
        }}
      />

      <MondayConfigDialog
        open={showMondayConfig}
        onOpenChange={setShowMondayConfig}
        agentId={agentId}
        initialConfig={mondayConfig || undefined}
        onSave={() => {
          onConfigReload();
        }}
        onDisconnect={() => {
          onConfigReload();
        }}
      />

      <AtlassianConfigDialog
        open={showAtlassianConfig}
        onOpenChange={setShowAtlassianConfig}
        agentId={agentId}
        initialConfig={atlassianConfig || undefined}
        onSave={() => {
          onConfigReload();
        }}
        onDisconnect={() => {
          onConfigReload();
        }}
      />

      <AsanaConfigDialog
        open={showAsanaConfig}
        onOpenChange={setShowAsanaConfig}
        agentId={agentId}
        initialConfig={asanaConfig || undefined}
        onSave={() => {
          onConfigReload();
        }}
        onDisconnect={() => {
          onConfigReload();
        }}
      />

      <HubSpotConfigDialog
        open={showHubSpotConfig}
        onOpenChange={setShowHubSpotConfig}
        agentId={agentId}
        initialConfig={hubspotConfig || undefined}
        onSave={() => {
          onConfigReload();
        }}
        onDisconnect={() => {
          onConfigReload();
        }}
      />

      <PayPalConfigDialog
        open={showPayPalConfig}
        onOpenChange={setShowPayPalConfig}
        agentId={agentId}
        initialConfig={paypalConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'paypal', 'PayPal'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'paypal'));
          onConfigReload();
        }}
      />

      <CanvaConfigDialog
        open={showCanvaConfig}
        onOpenChange={setShowCanvaConfig}
        agentId={agentId}
        initialConfig={canvaConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'canva', 'Canva'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'canva'));
          onConfigReload();
        }}
      />

      <SupabaseConfigDialog
        open={showSupabaseConfig}
        onOpenChange={setShowSupabaseConfig}
        agentId={agentId}
        initialConfig={supabaseConfig || undefined}
        onSave={() => {
          onMCPServersChange(addMCPToServers(mcpServers, 'supabase', 'Supabase'));
          onConfigReload();
        }}
        onDisconnect={() => {
          onMCPServersChange(removeMCPFromServers(mcpServers, 'supabase'));
          onConfigReload();
        }}
      />
    </>
  );
}
