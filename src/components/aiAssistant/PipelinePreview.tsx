import { Check, Eye, EyeOff, SquareKanban, Users2 } from 'lucide-react';
import type {
  PipelinePreviewState,
  PipelineType,
  PipelineVisibility,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: PipelinePreviewState | null;
  isBuilding?: boolean;
}

const TYPE_LABEL: Record<PipelineType, string> = {
  sales: 'Vendas',
  support: 'Suporte',
  marketing: 'Marketing',
  custom: 'Personalizado',
};

const TYPE_TONE: Record<PipelineType, string> = {
  sales: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  support: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  marketing: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  custom: 'bg-muted text-muted-foreground ring-border',
};

const VIS_LABEL: Record<PipelineVisibility, { label: string; icon: typeof Eye }> = {
  private: { label: 'Privado', icon: EyeOff },
  public: { label: 'Público', icon: Eye },
  team: { label: 'Time', icon: Users2 },
};

const STAGE_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  slate: { dot: 'bg-slate-400', bg: 'bg-slate-500/10', text: 'text-slate-300' },
  sky: { dot: 'bg-sky-400', bg: 'bg-sky-500/10', text: 'text-sky-300' },
  violet: { dot: 'bg-violet-400', bg: 'bg-violet-500/10', text: 'text-violet-300' },
  amber: { dot: 'bg-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-300' },
  orange: { dot: 'bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-300' },
  emerald: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  rose: { dot: 'bg-rose-400', bg: 'bg-rose-500/10', text: 'text-rose-300' },
};

export function PipelinePreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <SquareKanban className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do pipeline</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o pipeline no chat. As etapas aparecem aqui em formato
          kanban conforme a IA monta o funil.
        </p>
      </div>
    );
  }

  const Vis = VIS_LABEL[state.visibility];
  const VisIcon = Vis.icon;
  const ready = Boolean(state.name && state.stages.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`}
            />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA montando pipeline...' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || (
            <span className="text-muted-foreground italic">Aguardando nome...</span>
          )}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{state.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${TYPE_TONE[state.type]}`}
          >
            {TYPE_LABEL[state.type]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
            <VisIcon className="h-3 w-3" />
            {Vis.label}
          </span>
          <span className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
            {state.stages.length} {state.stages.length === 1 ? 'etapa' : 'etapas'}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-5 sm:px-5">
        {state.stages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs italic text-muted-foreground">
            {isBuilding ? 'Adicionando etapas...' : 'Nenhuma etapa ainda'}
          </div>
        ) : (
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {state.stages.map((stage, i) => {
              const tone = STAGE_COLOR[stage.color] ?? STAGE_COLOR.slate;
              return (
                <div
                  key={`${stage.name}-${i}`}
                  className="min-w-[140px] shrink-0 rounded-xl border border-border bg-card/60 p-3 animate-fadeIn"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                    <span className={`text-xs font-medium uppercase tracking-wider ${tone.text}`}>
                      Etapa {i + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground truncate">
                    {stage.name}
                  </p>
                  <div className={`mt-3 rounded-md ${tone.bg} px-2 py-1.5`}>
                    <p className="text-[10px] text-muted-foreground">0 cards</p>
                  </div>
                </div>
              );
            })}
            {isBuilding && state.stages.length > 0 && (
              <div className="min-w-[140px] shrink-0 rounded-xl border border-dashed border-border bg-card/30 p-3 flex items-center justify-center animate-fadeIn">
                <span className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                </span>
              </div>
            )}
          </div>
        )}

        {ready && !isBuilding && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Pipeline com {state.stages.length} etapas. Pode criar.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
