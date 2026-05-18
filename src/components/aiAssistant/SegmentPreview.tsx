import { Check, Filter, Users } from 'lucide-react';
import type { SegmentPreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: SegmentPreviewState | null;
  isBuilding?: boolean;
}

export function SegmentPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Filter className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do segmento</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o filtro no chat. A IA monta as regras e estima quantos contatos batem.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.rules.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA montando regras…' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || <span className="italic font-normal text-muted-foreground">Aguardando nome…</span>}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{state.description}</p>
        )}
        {state.matchCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/20">
            <Users className="h-3 w-3" />
            ~{state.matchCount.toLocaleString('pt-BR')} contatos batem
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Regras (lógica: {state.logic})
        </p>
        {state.rules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs italic text-muted-foreground">
            {isBuilding ? 'Adicionando regras…' : 'Nenhuma regra ainda'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {state.rules.map((r, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-2 animate-fadeIn">
                {i > 0 && (
                  <span className="font-mono text-[10px] font-semibold text-primary uppercase">
                    {state.logic}
                  </span>
                )}
                <code className="font-mono text-xs text-foreground">{r.field}</code>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {r.operator}
                </span>
                <code className="font-mono text-xs text-violet-300">{r.value}</code>
              </div>
            ))}
          </div>
        )}

        {ready && !isBuilding && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Segmento pronto. {state.matchCount} contatos serão incluídos.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
