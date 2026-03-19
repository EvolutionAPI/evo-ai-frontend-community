import { useLanguage } from '@/hooks/useLanguage';
import { Button, Card, CardContent, Badge } from '@evoapi/design-system';
import { MoreHorizontal } from 'lucide-react';
import { Agent } from '@/types/agents';
import AgentActionsDropdown from './AgentActionsDropdown';

type AgentCardProps = {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onExportAsJSON?: (agent: Agent) => void;
  onShare?: (agent: Agent) => void;
};

export default function AgentCard({
  agent,
  onEdit,
  onDelete,
  onExportAsJSON,
  onShare,
}: AgentCardProps) {
  const { t } = useLanguage('agents');
  const typeStyles: Record<string, { badge: string; ring: string; accent: string }> = {
    llm: {
      badge: 'border-green-500 text-green-400 bg-green-500/10',
      ring: 'ring-1 ring-green-500/40',
      accent: 'from-green-500/10 to-transparent',
    },
    a2a: {
      badge: 'border-blue-500 text-blue-400 bg-blue-500/10',
      ring: 'ring-1 ring-blue-500/40',
      accent: 'from-blue-500/10 to-transparent',
    },
    sequential: {
      badge: 'border-amber-500 text-amber-400 bg-amber-500/10',
      ring: 'ring-1 ring-amber-500/40',
      accent: 'from-amber-500/10 to-transparent',
    },
    parallel: {
      badge: 'border-violet-500 text-violet-400 bg-violet-500/10',
      ring: 'ring-1 ring-violet-500/40',
      accent: 'from-violet-500/10 to-transparent',
    },
    loop: {
      badge: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
      ring: 'ring-1 ring-indigo-500/40',
      accent: 'from-indigo-500/10 to-transparent',
    },
    default: {
      badge: 'border-slate-500 text-slate-300 bg-slate-500/10',
      ring: 'ring-1 ring-slate-500/40',
      accent: 'from-slate-500/10 to-transparent',
    },
  };

  const style = typeStyles[agent.type as keyof typeof typeStyles] || typeStyles.default;

  return (
    <Card className="group relative bg-sidebar border-sidebar-border hover:bg-sidebar-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 overflow-hidden">
      <CardContent className="p-0">
        {/* Header with avatar, name and type badge */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center bg-sidebar-accent/50 ${style.ring} relative overflow-hidden flex-shrink-0`}
          >
            <span className="text-sm font-semibold z-10">
              {agent.name?.charAt(0).toUpperCase()}
            </span>
            <span className={`absolute inset-0 bg-gradient-to-br ${style.accent}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-sidebar-foreground">
              {agent.name}
            </h3>
            {agent.description && (
              <p className="text-xs text-sidebar-foreground/60 truncate">{agent.description}</p>
            )}
          </div>

          {agent.type && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${style.badge}`}>
              {agent.type}
            </Badge>
          )}
        </div>

        {/* Details section */}
        <div className="px-4 py-3 text-xs text-sidebar-foreground/70">
          <div className="flex items-center justify-between">
            <span>{t('card.model')}</span>
            <span className="font-mono">{agent.model}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('card.type')}</span>
            <span className="font-mono">{agent.type || 'N/A'}</span>
          </div>
        </div>

        {/* Action buttons - hover effect like other cards */}
        <div className="flex border-t border-sidebar-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AgentActionsDropdown
            agent={agent}
            trigger={
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-12 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                {t('card.actions')}
              </Button>
            }
            onEdit={onEdit}
            onExportAsJSON={onExportAsJSON}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
