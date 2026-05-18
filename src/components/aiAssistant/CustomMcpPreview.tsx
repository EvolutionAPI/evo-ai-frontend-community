import { Check, Clock, KeyRound, Plug, RotateCcw, Server, Tags, Wrench } from 'lucide-react';
import type { CustomMcpPreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: CustomMcpPreviewState | null;
  isBuilding?: boolean;
}

export function CustomMcpPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Server className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do MCP Server</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva qual servidor MCP você quer conectar. A IA configura URL, auth e
          mostra as ferramentas expostas após o handshake.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.url && state.exposedTools.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'Conectando e descobrindo tools…' : ready ? 'Pronto para conectar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || <span className="italic font-normal text-muted-foreground">Aguardando nome…</span>}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{state.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-3.5">
        {/* URL */}
        {state.url && (
          <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Plug className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Endpoint MCP
              </span>
            </div>
            <code className="font-mono text-xs text-foreground break-all">{state.url}</code>
          </div>
        )}

        {/* Headers */}
        {state.headers.length > 0 && (
          <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-300">
                <KeyRound className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Headers
              </span>
            </div>
            <div className="space-y-1">
              {state.headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md bg-background/40 px-2.5 py-1.5">
                  <code className="font-mono text-xs text-foreground">{h.key}:</code>
                  <code className="font-mono text-xs text-muted-foreground">{h.valueMasked}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools expostas */}
        <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-300">
              <Wrench className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Ferramentas expostas ({state.exposedTools.length})
            </span>
          </div>
          {state.exposedTools.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              {isBuilding ? 'Aguardando handshake…' : 'Nenhuma ferramenta descoberta'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {state.exposedTools.map((tool) => (
                <code
                  key={tool}
                  className="inline-flex items-center gap-1.5 rounded-md bg-background/40 px-2 py-1 font-mono text-[11px] text-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  {tool}()
                </code>
              ))}
            </div>
          )}
        </div>

        {/* Network config */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Timeout</p>
              <p className="text-xs font-mono text-foreground">{state.timeoutSeconds}s</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/40 px-3 py-2 flex items-center gap-2">
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Retry</p>
              <p className="text-xs font-mono text-foreground">{state.retryCount}x</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {state.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Tags className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300 ring-1 ring-violet-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {ready && !isBuilding && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                MCP pronto. {state.exposedTools.length} ferramentas disponíveis.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
