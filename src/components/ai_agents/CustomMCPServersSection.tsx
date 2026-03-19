import { useState } from 'react';
import {
  Button,
  Badge,
  } from '@evoapi/design-system';
import {
  ExternalLink,
  Plus,
  X,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import CustomMCPDialog from './Dialogs/CustomMCPDialog';

interface CustomMCPServersSectionProps {
  customMCPServerIds: string[];
  onCustomMCPServersChange: (serverIds: string[]) => void;
  isReadOnly?: boolean;
}

const CustomMCPServersSection = ({
  customMCPServerIds,
  onCustomMCPServersChange,
  isReadOnly = false,
}: CustomMCPServersSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const [showCustomMCPDialog, setShowCustomMCPDialog] = useState(false);

  const handleAddCustomMCPServers = (serverIds: string[]) => {
    const existingIds = customMCPServerIds;
    const newIds = serverIds.filter(id => !existingIds.includes(id));
    onCustomMCPServersChange([...customMCPServerIds, ...newIds]);
  };

  const handleRemoveCustomMCPServer = (serverId: string) => {
    const updatedIds = customMCPServerIds.filter(id => id !== serverId);
    onCustomMCPServersChange(updatedIds);
  };

  return (
    <div className="space-y-4">
      {customMCPServerIds && customMCPServerIds.length > 0 ? (
            <div className="space-y-3">
              {customMCPServerIds.map(serverId => (
                <div
                  key={`referenced-${serverId}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{serverId}</span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      >
                        {t('tools.mcpServers.referenced')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('tools.mcpServers.externallyManaged')}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomMCPServer(serverId)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomMCPDialog(true)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('tools.mcpServers.addCustom')}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed">
              <div>
                <p className="font-medium">{t('tools.mcpServers.noCustomConfigured')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('tools.mcpServers.connectFromManagement')}
                </p>
              </div>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomMCPDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('tools.mcpServers.add')}
                </Button>
              )}
            </div>
          )}

      {/* Modal de Seleção de MCPs Personalizados */}
      <CustomMCPDialog
        open={showCustomMCPDialog}
        onOpenChange={setShowCustomMCPDialog}
        onSave={handleAddCustomMCPServers}
        initialSelectedIds={customMCPServerIds}
      />
    </div>
  );
};

export default CustomMCPServersSection;
