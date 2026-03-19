import { Badge, Card, CardContent } from '@evoapi/design-system';
import { Wrench } from 'lucide-react';
import { Tool } from '@/types/ai';
import { useLanguage } from '@/hooks/useLanguage';

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

export default function ToolCard({ tool, onClick }: ToolCardProps) {
  const { t } = useLanguage('tools');

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onClick(tool)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate mb-1">{tool.name}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tool.description || t('card.noDescription')}
          </p>
        </div>

        {/* Tags */}
        {Array.isArray(tool.tags) && tool.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 3).map((tag: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tool.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Input/Output Modes */}
        <div className="space-y-2 mb-3">
          {Array.isArray(tool.inputModes) && tool.inputModes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('card.input')}</p>
              <div className="flex flex-wrap gap-1">
                {tool.inputModes.slice(0, 2).map((mode: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {mode}
                  </Badge>
                ))}
                {tool.inputModes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{tool.inputModes.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {Array.isArray(tool.outputModes) && tool.outputModes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('card.output')}</p>
              <div className="flex flex-wrap gap-1">
                {tool.outputModes.slice(0, 2).map((mode: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {mode}
                  </Badge>
                ))}
                {tool.outputModes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{tool.outputModes.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Examples Count */}
        <div className="text-xs text-muted-foreground">
          {t('card.examplesCount', {
            count: Array.isArray(tool.examples) ? tool.examples.length : 0,
          })}
        </div>
      </CardContent>
    </Card>
  );
}
