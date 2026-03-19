import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Badge,
  Button,
  Separator,
} from '@evoapi/design-system';
import { Server, Edit, Wrench, Settings, FileText } from 'lucide-react';
import { MCPServer } from '@/types/ai';

interface MCPServerDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: MCPServer | null;
  onEdit?: (server: MCPServer) => void;
}

export default function MCPServerDetails({
  open,
  onOpenChange,
  server,
  onEdit,
}: MCPServerDetailsProps) {
  const { t } = useLanguage('mcpServers');

  if (!server) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'official':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'community':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {server.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('details.sections.basicInfo')}</h3>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(server)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('details.buttons.edit')}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('details.labels.name')}</label>
                  <p className="text-sm mt-1">{server.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('details.labels.type')}</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(server.type)}`}>
                      {server.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {server.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('details.labels.description')}</label>
                  <p className="text-sm mt-1">{server.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('details.labels.configType')}</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={`text-xs ${getTypeColor(server.config_type)}`}>
                      {server.config_type?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tools */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                {t('details.sections.tools')} ({server.tools?.length || 0})
              </h3>

              {server.tools && server.tools.length > 0 ? (
                <div className="space-y-3">
                  {server.tools.map((tool, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{tool.name}</h4>
                          {tool.description && (
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          )}
                        </div>
                        <Wrench className="h-4 w-4 text-emerald-400 mt-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                  <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('details.empty.tools')}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Environment Variables */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('details.sections.environments')}
              </h3>

              {server.environments && Object.keys(server.environments).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(server.environments).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">{key}</span>
                      <span className="text-xs text-muted-foreground">
                        {typeof value === 'string' && value !== 'required' ? value : t('details.environment.configured')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                  <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('details.empty.environments')}
                  </p>
                </div>
              )}
            </div>

            {/* Configuration JSON */}
            {server.config_json && Object.keys(server.config_json).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('details.sections.configJson')}
                  </h3>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words">
                      {JSON.stringify(server.config_json, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
