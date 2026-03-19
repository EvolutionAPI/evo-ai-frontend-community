import { useState, useCallback } from 'react';
import { Button, Badge, Card, CardContent, CardHeader } from '@evoapi/design-system';
import { Wrench, Plus, Settings, X } from 'lucide-react';
import { Tool } from '@/types/ai';
import { useLanguage } from '@/hooks/useLanguage';
import ToolsDialog from './Dialogs/ToolsDialog';

import CollapsibleHeader from './CollapsibleHeader';

interface SystemToolsSectionProps {
  tools: Tool[];
  isOpen: boolean;
  onToggle: () => void;
  onToolsChange: (tools: Tool[]) => void;
  isReadOnly?: boolean;
}

const SystemToolsSection = ({
  tools,
  isOpen,
  onToggle,
  onToolsChange,
  isReadOnly = false,
}: SystemToolsSectionProps) => {
  const { t } = useLanguage('aiAgents');
  const [showToolsDialog, setShowToolsDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const handleAddTools = useCallback(
    (selectedTools: Tool[]) => {
      // Evitar duplicatas
      const existingIds = tools.map(tool => tool.id);
      const newTools = selectedTools.filter(tool => !existingIds.includes(tool.id));

      onToolsChange([...tools, ...newTools]);
      setShowToolsDialog(false);
    },
    [tools, onToolsChange],
  );

  const handleRemoveTool = useCallback(
    (toolId: string) => {
      const updatedTools = tools.filter(tool => tool.id !== toolId);
      onToolsChange(updatedTools);
    },
    [tools, onToolsChange],
  );

  const handleEditTool = useCallback((tool: Tool) => {
    setEditingTool(tool);
    setShowToolsDialog(true);
  }, []);

  const handleEditToolSave = useCallback(
    (configuredTools: Tool[]) => {
      if (configuredTools.length > 0 && editingTool) {
        const updatedTool = configuredTools[0];
        const updatedTools = tools.map(tool => (tool.id === editingTool.id ? updatedTool : tool));
        onToolsChange(updatedTools);
      }
      setEditingTool(null);
      setShowToolsDialog(false);
    },
    [tools, onToolsChange, editingTool],
  );
  return (
    <Card>
      <CardHeader>
        <CollapsibleHeader
          title={t('tools.systemTools.title')}
          description={t('tools.systemTools.description')}
          icon={<Wrench className="h-5 w-5 text-emerald-500" />}
          count={tools.length}
          isOpen={isOpen}
          onToggle={onToggle}
        />
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {tools.length > 0 ? (
            <div className="space-y-3">
              {tools.map(tool => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">{tool.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                    {tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isReadOnly && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTool(tool)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTool(tool.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowToolsDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tools.systemTools.addTool')}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed">
              <div>
                <p className="font-medium">{t('tools.systemTools.noTools')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('tools.systemTools.addToExtend')}
                </p>
              </div>
              {!isReadOnly && (
                <Button variant="outline" size="sm" onClick={() => setShowToolsDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('actions.add')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}

      {/* Modal de Ferramentas */}
      <ToolsDialog
        open={showToolsDialog}
        onOpenChange={open => {
          setShowToolsDialog(open);
          if (!open) {
            setEditingTool(null);
          }
        }}
        onSelectTools={editingTool ? handleEditToolSave : handleAddTools}
        editingTool={editingTool}
      />
    </Card>
  );
};

export default SystemToolsSection;
