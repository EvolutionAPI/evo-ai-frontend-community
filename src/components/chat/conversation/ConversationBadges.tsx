import React from 'react';
import { AlertTriangle, GitBranch, Tag as TagIcon, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@evoapi/design-system/tooltip';
import { Conversation } from '@/types/chat/api';
import { useLanguage } from '@/hooks/useLanguage';
import ConversationStatusIcon from './ConversationStatusIcon';
import { Label } from '@/types/settings';

interface ConversationBadgesProps {
  conversation: Conversation;
  maxLabels?: number;
  showOnlyPipeline?: boolean; // Nova prop para controlar exibição
  showStatus?: boolean; // Nova prop para exibir status da conversa
}

const ConversationBadges: React.FC<ConversationBadgesProps> = ({
  conversation,
  maxLabels = 2,
  showOnlyPipeline = false,
  showStatus = true,
}) => {
  const { t } = useLanguage('chat');

  // Função para obter badge de prioridade compacto (apenas ícone)
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 cursor-help hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{t('conversationBadges.priority.urgent.label')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('conversationBadges.priority.urgent.description')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'high':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 cursor-help hover:scale-110 transition-transform duration-200">
                  <ArrowUp className="w-3 h-3 text-orange-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{t('conversationBadges.priority.high.label')}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('conversationBadges.priority.high.description')}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'medium':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 cursor-help hover:scale-110 transition-transform duration-200">
                  <Minus className="w-3 h-3 text-blue-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{t('conversationBadges.priority.medium.label')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('conversationBadges.priority.medium.description')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'low':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 cursor-help hover:scale-110 transition-transform duration-200">
                  <ArrowDown className="w-3 h-3 text-gray-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="px-3 py-2 bg-popover border border-border shadow-lg rounded-lg"
              >
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{t('conversationBadges.priority.low.label')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('conversationBadges.priority.low.description')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  // Buscar informações do pipeline
  const conversationPipelines = conversation.pipelines || [];
  
  const pipeline = conversationPipelines.length > 0
    ? conversationPipelines[0]
    : null;

  // Buscar informações das labels (limitadas)
  // Labels vêm como array de objetos Label completos {id, title, color} do backend
  // Fallback: se vier como string/ID, buscar na lista de labels passada como prop
  const allConversationLabels = React.useMemo(() => {
    const conversationLabelsArray = conversation.labels || [];

    return conversationLabelsArray
      .map((labelData: { id?: string; title?: string; name?: string; color?: string } | string) => {
        // Se já é um objeto Label completo com id, title e color, usar diretamente
        if (typeof labelData === 'object' && labelData !== null) {
          // Verificar se tem title (formato novo do backend)
          if ('title' in labelData) {
            return {
              id: String(labelData.id || labelData.title),
              title: String(labelData.title || ''),
              color: String(labelData.color || '#1f93ff'),
            };
          }
          // Verificar se tem name (formato antigo)
          if ('name' in labelData) {
            return {
              id: String(labelData.id || labelData.name),
              title: String(labelData.name || ''),
              color: String(labelData.color || '#1f93ff'),
            };
          }
        }
        // Se é string/ID (fallback para compatibilidade), buscar na lista de labels passada como prop
        if (typeof labelData === 'string') {
          const labelId = String(labelData);
          const foundLabel = conversation.labels.find((l: Label) => String(l.id) === labelId);
          if (foundLabel) {
            return {
              id: String(foundLabel.id),
              title: String(foundLabel.title),
              color: String(foundLabel.color || '#1f93ff'),
            };
          }
        }
        return null;
      })
      .filter((label): label is { id: string; title: string; color: string } => Boolean(label));
  }, [conversation.labels]);

  const conversationLabels = allConversationLabels.slice(0, maxLabels);
  const hiddenLabels = allConversationLabels.slice(maxLabels);

  const priorityIcon = conversation.priority ? getPriorityIcon(conversation.priority) : null;

  // Só não renderiza se a conversa não existir
  if (!conversation) return null;

  const getPipelineNameText = () => {
    const pipelineName = pipeline?.name;
    const pipelineStageName = pipeline?.stages[0]?.name;

    if (!pipelineStageName) return pipelineName;

    return `${pipelineName} • ${pipelineStageName}`;
  };

  const getDaysInCurrentStageText = () => {
    const daysInCurrentStage = pipeline?.stages[0]?.days_in_current_stage;

    if (daysInCurrentStage === undefined || daysInCurrentStage === null) return '';

    if (daysInCurrentStage === 1) return `1 ${t('conversationBadges.timeUnits.day')}`;
    if (daysInCurrentStage < 7) return `${daysInCurrentStage} ${t('conversationBadges.timeUnits.days')}`;
    if (daysInCurrentStage < 30) {
      const weeks = Math.floor(daysInCurrentStage / 7);
      return `${weeks} ${weeks === 1 ? t('conversationBadges.timeUnits.week') : t('conversationBadges.timeUnits.weeks')}`;
    }
    const months = Math.floor(daysInCurrentStage / 30);
    return `${months} ${months === 1 ? t('conversationBadges.timeUnits.month') : t('conversationBadges.timeUnits.months')}`;
  };

  const getPipelineStageColor = () => {
    return pipeline?.stages[0]?.color || '#00ffa7';
  };

  // Se tem pipeline, mostrar pipeline + labels/prioridade em duas linhas
  if (pipeline && !showOnlyPipeline) {
    return (
      <div className="mt-1.5 space-y-1">
        {/* Primeira linha: Pipeline + tempo */}
        
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full text-primary-foreground" style={{ backgroundColor: getPipelineStageColor() }}>
            <GitBranch className="w-2.5 h-2.5" />
            <span>{getPipelineNameText()}</span>
          </div>
          <span className="text-xs text-muted-foreground"> {getDaysInCurrentStageText()}</span>
        </div>

        {/* Segunda linha: Status, Labels e prioridade */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Status Icon - First position */}
          {showStatus && <ConversationStatusIcon status={conversation.status} size="sm" />}

          {/* Priority Icon */}
          {priorityIcon}

          {/* Labels Badges */}
          {conversationLabels.map(label => (
            <div
              key={label.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full text-white"
              style={{
                backgroundColor: label.color,
              }}
              title={label.title}
            >
              <TagIcon className="w-2.5 h-2.5" />
              <span className="truncate max-w-12">{label.title}</span>
            </div>
          ))}

          {/* Indicador de mais labels com tooltip */}
          {hiddenLabels.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-400 text-white cursor-help">
                    +{hiddenLabels.length}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs p-3 bg-popover border border-border shadow-lg rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-foreground">{t('conversationBadges.otherLabels')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {hiddenLabels.map(label => (
                        <div
                          key={label.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-white shadow-sm"
                          style={{ backgroundColor: label.color }}
                        >
                          <TagIcon className="w-3 h-3" />
                          <span>{label.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  }

  // Se não tem pipeline, mostrar status, labels e prioridade (uma linha)
  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {/* Status Icon - First position */}
      {showStatus && <ConversationStatusIcon status={conversation.status} size="sm" />}

      {/* Priority Icon */}
      {priorityIcon}

      {/* Labels Badges */}
      {conversationLabels.map(label => (
        <div
          key={label.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full text-white"
          style={{
            backgroundColor: label.color,
          }}
          title={label.title}
        >
          <TagIcon className="w-2.5 h-2.5" />
          <span className="truncate max-w-12">{label.title}</span>
        </div>
      ))}

      {/* Indicador de mais labels com tooltip */}
      {hiddenLabels.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-400 text-white cursor-help">
                +{hiddenLabels.length}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs p-3 bg-popover border border-border shadow-lg rounded-lg"
            >
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">{t('conversationBadges.otherLabels')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {hiddenLabels.map(label => (
                    <div
                      key={label.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-white shadow-sm"
                      style={{ backgroundColor: label.color }}
                    >
                      <TagIcon className="w-3 h-3" />
                      <span>{label.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ConversationBadges;
