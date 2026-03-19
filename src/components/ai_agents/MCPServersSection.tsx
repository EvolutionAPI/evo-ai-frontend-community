import { useState, useCallback } from 'react';
import {
  Button,
  Badge,
} from '@evoapi/design-system';
import {
  Server,
  Plus,
  X,
  Settings,
} from 'lucide-react';
import { MCPServer, MCPServerConfig } from '@/types/ai';
import MCPServersDialog from './Dialogs/MCPServersDialog';
import MCPConfigDialog from './Dialogs/MCPConfigDialog';
import { useLanguage } from '@/hooks/useLanguage';

interface MCPServersSectionProps {
  mcpServers: MCPServerConfig[];
  availableMCPs: MCPServer[];
  onMCPServersChange: (mcpServers: MCPServerConfig[]) => void;
  isReadOnly?: boolean;
}

const MCPServersSection = ({
  mcpServers,
  availableMCPs,
  onMCPServersChange,
  isReadOnly = false,
}: MCPServersSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const [showMCPServersDialog, setShowMCPServersDialog] = useState(false);
  const [showMCPConfigDialog, setShowMCPConfigDialog] = useState(false);
  const [selectedMCPForConfig, setSelectedMCPForConfig] = useState<MCPServerConfig | null>(null);
  const [editingMCPConfig, setEditingMCPConfig] = useState<MCPServerConfig | null>(null);
  const [pendingMCPConfigs, setPendingMCPConfigs] = useState<MCPServerConfig[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

  // Servidores que devem aparecer em "Integrações" ao invés de "Servidores MCP"
  const INTEGRATION_SERVERS = ['google-calendar', 'gmail', 'google-drive', 'elevenlabs'];

  // Filtrar servidores de integração dos MCPs disponíveis
  const filteredAvailableMCPs = availableMCPs.filter(server =>
    !INTEGRATION_SERVERS.includes(server.id)
  );

  // Criar mapa de servidores para lookup rápido
  const loadedMCPServers = filteredAvailableMCPs.reduce((acc, server) => {
    acc[server.id] = server;
    return acc;
  }, {} as Record<string, MCPServer>);

  const handleSelectMCPFromList = useCallback((selectedServers: MCPServerConfig[]) => {
    // Filtra apenas os servidores que ainda não foram configurados
    const unconfiguredServers = selectedServers.filter(server =>
      !mcpServers.some(existing => existing.id === server.id)
    );

    if (unconfiguredServers.length > 0) {
      setPendingMCPConfigs(unconfiguredServers);
      setCurrentConfigIndex(0);
      setSelectedMCPForConfig(unconfiguredServers[0]);
      setShowMCPConfigDialog(true);
    }
  }, [mcpServers]);

  const handleSaveMCPConfig = useCallback((config: MCPServerConfig) => {
    if (editingMCPConfig) {
      // Modo edição: substituir configuração existente
      const updatedServers = mcpServers.map(server =>
        server.id === config.id ? config : server,
      );
      onMCPServersChange(updatedServers);
    } else {
      // Modo criação: adicionar nova configuração
      // Verificar se já existe para evitar duplicatas
      const existingIndex = mcpServers.findIndex(s => s.id === config.id);
      if (existingIndex >= 0) {
        // Já existe, substituir
        const updatedServers = [...mcpServers];
        updatedServers[existingIndex] = config;
        onMCPServersChange(updatedServers);
      } else {
        // Não existe, adicionar
        onMCPServersChange([...mcpServers, config]);
      }
    }

    // Verificar se há mais servidores para configurar
    if (!editingMCPConfig && currentConfigIndex < pendingMCPConfigs.length - 1) {
      const nextIndex = currentConfigIndex + 1;
      setCurrentConfigIndex(nextIndex);
      setSelectedMCPForConfig(pendingMCPConfigs[nextIndex]);
    } else {
      // Finalizar processo
      setPendingMCPConfigs([]);
      setCurrentConfigIndex(0);
      setShowMCPConfigDialog(false);
      setSelectedMCPForConfig(null);
      setEditingMCPConfig(null);
    }
  }, [mcpServers, onMCPServersChange, editingMCPConfig, currentConfigIndex, pendingMCPConfigs]);

  const handleEditMCPServer = useCallback((serverConfig: MCPServerConfig) => {
    setEditingMCPConfig(serverConfig);
    setSelectedMCPForConfig(null);
    setShowMCPConfigDialog(true);
  }, []);

  const handleRemoveMCPServer = useCallback((serverId: string) => {
    const updatedServers = mcpServers.filter(server => server.id !== serverId);
    onMCPServersChange(updatedServers);
  }, [mcpServers, onMCPServersChange]);

  // Filtrar servidores de integração da lista exibida
  const filteredMcpServers = mcpServers.filter(server =>
    !INTEGRATION_SERVERS.includes(server.id)
  );

  return (
    <div className="space-y-4">
      {filteredMcpServers.length > 0 ? (
            <div className="space-y-3">
              {filteredMcpServers.map(serverConfig => {
                const serverDetails = loadedMCPServers[serverConfig.id];
                if (!serverDetails) return null;
                return (
                <div
                  key={serverConfig.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Server className="h-4 w-4 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{serverDetails.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {serverDetails.type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {serverConfig.tools.slice(0, 6).map(tool => (
                          <Badge key={tool.id} variant="secondary" className="text-xs">
                            {tool.name}
                          </Badge>
                        ))}
                        {serverConfig.tools.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{serverConfig.tools.length - 6} {t('dialogs.customMcp.more')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMCPServer({ ...serverConfig, ...serverDetails })}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMCPServer(serverConfig.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                );
              })}
              {mcpServers.some(server => !loadedMCPServers[server.id]) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('tools.mcpServers.loadingServerInfo')}
                  </p>
                </div>
              )}
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowMCPServersDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tools.mcpServers.add')}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed">
              <div>
                <p className="font-medium">{t('tools.mcpServers.noServers')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('tools.mcpServers.addForIntegration')}
                </p>
              </div>
              {!isReadOnly && (
                <Button variant="outline" size="sm" onClick={() => setShowMCPServersDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('actions.add')}
                </Button>
              )}
            </div>
          )}

      {/* Modal de Seleção de Servidores MCP */}
      <MCPServersDialog
        open={showMCPServersDialog}
        onOpenChange={setShowMCPServersDialog}
        onSave={handleSelectMCPFromList}
        initialServers={Object.values(loadedMCPServers)}
        initialSelectedIds={mcpServers.map(server => server.id)}
      />

      {/* Modal de Configuração de MCP */}
      <MCPConfigDialog
        open={showMCPConfigDialog}
        onOpenChange={open => {
          setShowMCPConfigDialog(open);
          if (!open) {
            setSelectedMCPForConfig(null);
            setEditingMCPConfig(null);
            setPendingMCPConfigs([]);
            setCurrentConfigIndex(0);
          }
        }}
        onSave={handleSaveMCPConfig}
        availableServers={Object.values(loadedMCPServers)}
        initialConfig={editingMCPConfig || selectedMCPForConfig}
        mcpServers={mcpServers}
        currentStep={pendingMCPConfigs.length > 0 ? currentConfigIndex + 1 : 1}
        totalSteps={pendingMCPConfigs.length || 1}
        onSkip={pendingMCPConfigs.length > 1 ? () => {
          if (currentConfigIndex < pendingMCPConfigs.length - 1) {
            const nextIndex = currentConfigIndex + 1;
            setCurrentConfigIndex(nextIndex);
            setSelectedMCPForConfig(pendingMCPConfigs[nextIndex]);
            setEditingMCPConfig(null);
          } else {
            setPendingMCPConfigs([]);
            setCurrentConfigIndex(0);
            setShowMCPConfigDialog(false);
            setSelectedMCPForConfig(null);
            setEditingMCPConfig(null);
          }
        } : undefined}
      />
    </div>
  );
};

export default MCPServersSection;
