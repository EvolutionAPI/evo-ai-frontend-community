import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Badge,
  Separator,
} from '@evoapi/design-system';
import { Wrench, Tag, FileText, Settings } from 'lucide-react';
import { Tool } from '@/types/ai';
import { useLanguage } from '@/hooks/useLanguage';

interface ToolDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool?: Tool | null;
}

export default function ToolDetails({ open, onOpenChange, tool }: ToolDetailsProps) {
  const { t } = useLanguage('tools');

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {tool.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('details.basicInfo.title')}</h3>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('details.basicInfo.name')}
                </label>
                <p className="text-sm mt-1">{tool.name}</p>
              </div>

              {tool.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('details.basicInfo.description')}
                  </label>
                  <p className="text-sm mt-1">{tool.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t('details.tags.count', {
                  count: Array.isArray(tool.tags) ? tool.tags.length : 0,
                })}
              </h3>

              {Array.isArray(tool.tags) && tool.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                  <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('details.tags.empty')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Input/Output Modes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('details.modes.title')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('details.modes.input')}
                  </label>
                  <div className="mt-2">
                    {Array.isArray(tool.inputModes) && tool.inputModes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tool.inputModes.map((mode: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('details.modes.notSpecified')}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('details.modes.output')}
                  </label>
                  <div className="mt-2">
                    {Array.isArray(tool.outputModes) && tool.outputModes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tool.outputModes.map((mode: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mode}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('details.modes.notSpecified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('details.examples.count', {
                  count: Array.isArray(tool.examples) ? tool.examples.length : 0,
                })}
              </h3>

              {Array.isArray(tool.examples) && tool.examples.length > 0 ? (
                <div className="space-y-3">
                  {tool.examples.map((example: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <pre className="text-sm whitespace-pre-wrap break-words">{example}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('details.examples.empty')}</p>
                </div>
              )}
            </div>

            {/* Configuration */}
            {tool.config && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('details.configuration.title')}
                  </h3>

                  <div className="space-y-3">
                    {Array.isArray(tool.config.required_fields) &&
                      tool.config.required_fields.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t('details.configuration.requiredFields')}
                          </label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tool.config.required_fields.map((field: any, index: number) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {Array.isArray(tool.config.optional_fields) &&
                      tool.config.optional_fields.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t('details.configuration.optionalFields')}
                          </label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tool.config.optional_fields.map((field: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {tool.config.default_values &&
                      Object.keys(tool.config.default_values).length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {t('details.configuration.defaultValues')}
                          </label>
                          <div className="mt-1 p-3 bg-muted/30 rounded border">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(tool.config.default_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
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
