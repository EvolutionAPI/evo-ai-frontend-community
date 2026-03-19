import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Input,
  ScrollArea,
} from '@evoapi/design-system';
import { Search, Server, CheckCircle } from 'lucide-react';
import { MCPServer, MCPServerConfig } from '@/types/ai';
import { useLanguage } from '@/hooks/useLanguage';

interface MCPServersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (servers: MCPServerConfig[], availableServers: MCPServer[]) => void;
  initialServers: MCPServer[];
  initialSelectedIds?: string[];
}

const MCPServersDialog = ({
  open,
  onOpenChange,
  onSave,
  initialServers,
  initialSelectedIds = [],
}: MCPServersDialogProps) => {
  const { t } = useLanguage('aiAgents');
  const [MCPServers, setMCPServers] = useState<MCPServer[]>([]);
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const initialSelectionSetRef = useRef(false);

  // Initialize selected servers when dialog opens - very simple and stable
  useEffect(() => {
    if (open && !initialSelectionSetRef.current) {
      setSelectedServerIds([...initialSelectedIds]);
      initialSelectionSetRef.current = true;
    }
  }, [open, initialSelectedIds]);

  // Cleanup when dialog closes - separate effect for clarity
  useEffect(() => {
    if (!open) {
      setSelectedServerIds([]);
      setSearchTerm('');
      initialSelectionSetRef.current = false;
      return;
    }

    if (initialServers) {
      setMCPServers(initialServers);
    }
  }, [open, initialServers]);

  const toggleServer = (serverId: string) => {
    if (selectedServerIds.includes(serverId)) {
      setSelectedServerIds(selectedServerIds.filter(id => id !== serverId));
    } else {
      setSelectedServerIds([...selectedServerIds, serverId]);
    }
  };

  const handleSave = () => {
    const selectedServers: MCPServerConfig[] = selectedServerIds.map(serverId => {
      const server = MCPServers.find(s => s.id === serverId);
      return {
        id: serverId,
        name: server?.name || serverId,
        type: server?.config_type || 'unknown',
        environments: server?.environments || {},
        tools: server?.tools || [],
      };
    });

    onSave(selectedServers, MCPServers);
    onOpenChange(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'oauth':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'webhook':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'basic_auth':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'credentials':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  const filteredServers = MCPServers.filter(server => {
    if (!searchTerm) return true;
    return (
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.config_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.tools.some(
        tool =>
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-emerald-500" />
            {t('dialogs.mcpServers.title')}
          </DialogTitle>
          <DialogDescription>{t('tools.mcpServers.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('dialogs.mcpServers.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de servidores */}
          <ScrollArea className="h-[500px] border rounded-md p-4">
            {filteredServers.length > 0 ? (
              <div className="space-y-3">
                {filteredServers.map(server => (
                  <div
                    key={server.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedServerIds.includes(server.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleServer(server.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="h-5 w-5 text-orange-500" />
                          <span className="font-medium text-lg">{server.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getTypeColor(server.type)}`}
                          >
                            {server.type}
                          </Badge>
                          {selectedServerIds.includes(server.id) && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        {server.description && (
                          <p className="text-sm text-muted-foreground mb-3">{server.description}</p>
                        )}

                        {/* Ferramentas disponíveis */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            {t('dialogs.mcpServers.availableTools')} ({server.tools.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {server.tools.slice(0, 6).map((tool: any) => (
                              <Badge key={tool.id} variant="secondary" className="text-xs">
                                {tool.name}
                              </Badge>
                            ))}
                            {server.tools.length > 6 && (
                              <Badge variant="secondary" className="text-xs">
                                +{server.tools.length - 6} {t('dialogs.customMcp.more')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Variáveis de ambiente necessárias */}
                        {server.environments && Object.keys(server.environments).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {t('dialogs.mcpConfig.requiredConfig')}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(server.environments).map(env => (
                                <Badge
                                  key={env}
                                  variant="outline"
                                  className="text-xs text-orange-600"
                                >
                                  {env}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedServerIds.includes(server.id)}
                          onChange={() => toggleServer(server.id)}
                          className="h-4 w-4 text-primary -z-10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? t('messages.noResults') : t('tools.mcpServers.noServers')}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={selectedServerIds.length === 0}>
            {t('dialogs.mcpServers.continue')}{' '}
            {selectedServerIds.length > 0 && `(${selectedServerIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MCPServersDialog;
