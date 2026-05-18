import {
  ArrowDown,
  Bot,
  Check,
  Clock,
  GitBranch,
  MessageCircle,
  PlayCircle,
  Tag,
  TagsIcon as TagOff,
  Users2,
  Wand2,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MacroAction, MacroPreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: MacroPreviewState | null;
  isBuilding?: boolean;
}

const ACTION_ICON: Record<MacroAction['type'], LucideIcon> = {
  send_message: MessageCircle,
  add_label: Tag,
  remove_label: TagOff,
  assign_team: Users2,
  assign_agent: Bot,
  change_priority: Zap,
  move_pipeline: GitBranch,
  wait: Clock,
};

export function MacroPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Wand2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview da macro</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva a sequência de ações no chat. A IA monta o passo-a-passo.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.actions.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA configurando macro…' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || <span className="italic font-normal text-muted-foreground">Aguardando nome…</span>}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{state.description}</p>
        )}
        <span className="mt-2 inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
          Visibilidade: {state.visibility === 'private' ? 'Privada' : state.visibility === 'team' ? 'Time' : 'Pública'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Sequência de ações ({state.actions.length})
        </p>
        {state.actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs italic text-muted-foreground">
            {isBuilding ? 'Adicionando ações…' : 'Nenhuma ação ainda'}
          </div>
        ) : (
          <div>
            {state.actions.map((action, i) => {
              const Icon = ACTION_ICON[action.type] ?? PlayCircle;
              return (
                <div key={i}>
                  <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card/40 px-3 py-2.5 animate-fadeIn">
                    <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.summary}</p>
                    </div>
                  </div>
                  {i < state.actions.length - 1 && (
                    <div className="flex justify-center py-1 animate-fadeIn">
                      <ArrowDown className="h-3 w-3 text-muted-foreground/60" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {ready && !isBuilding && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Macro com {state.actions.length} ações pronta.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
