import { Check, ShieldCheck, Users } from 'lucide-react';
import type { RolePreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: RolePreviewState | null;
  isBuilding?: boolean;
}

export function RolePreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview da role</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o perfil que você quer. A IA monta as permissões mínimas.
        </p>
      </div>
    );
  }

  const totalActions = state.permissions.reduce((acc, p) => acc + p.totalActions, 0);
  const grantedActions = state.permissions.reduce((acc, p) => acc + p.actions.length, 0);
  const grantedPct = totalActions > 0 ? Math.round((grantedActions / totalActions) * 100) : 0;
  const ready = Boolean(state.name && state.permissions.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA configurando permissões…' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || <span className="italic font-normal text-muted-foreground">Aguardando nome…</span>}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{state.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-sky-300 ring-1 ring-sky-500/20">
            <Users className="h-3 w-3" />
            ~{state.estimatedUserCount} usuários
          </span>
          <span className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-muted-foreground">
            {grantedActions} / {totalActions} permissões ({grantedPct}%)
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Permissões por recurso
        </p>
        {state.permissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs italic text-muted-foreground">
            {isBuilding ? 'Mapeando recursos…' : 'Sem permissões ainda'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {state.permissions.map((p) => {
              const granted = p.actions.length;
              const pct = p.totalActions > 0 ? (granted / p.totalActions) * 100 : 0;
              const allowed = granted > 0;
              return (
                <div
                  key={p.resource}
                  className="rounded-lg border border-border bg-card/40 px-3 py-2 animate-fadeIn"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground font-medium">{p.resource}</span>
                    <span className={`text-xs ${allowed ? 'text-emerald-300' : 'text-muted-foreground'}`}>
                      {granted} / {p.totalActions}
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${allowed ? 'bg-emerald-500' : 'bg-muted'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {allowed && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.actions.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300 ring-1 ring-emerald-500/20"
                        >
                          {a}
                        </span>
                      ))}
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
                Role pronta com {grantedActions} permissões.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
