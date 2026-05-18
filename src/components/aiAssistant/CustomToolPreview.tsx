import { Check, Code2, Globe, KeyRound, Tags } from 'lucide-react';
import type { CustomToolPreviewState, HttpMethod } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: CustomToolPreviewState | null;
  isBuilding?: boolean;
}

const METHOD_TONE: Record<HttpMethod, string> = {
  GET: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  POST: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  PUT: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  PATCH: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  DELETE: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
};

const LOCATION_TONE: Record<string, string> = {
  path: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  query: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  body: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  header: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
};

export function CustomToolPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Code2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview da Custom Tool</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva a ferramenta HTTP no chat. A IA monta método, URL, params, auth e
          mostra um exemplo de resposta.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.path && state.method);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA configurando tool…' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 font-mono text-sm font-semibold text-foreground">
          {state.name || <span className="italic font-sans font-normal text-muted-foreground">Aguardando nome…</span>}
          {state.name && <span className="text-muted-foreground">()</span>}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{state.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-3.5">
        {/* Endpoint */}
        {state.path && (
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Globe className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Endpoint
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-6 items-center rounded px-2 text-[11px] font-mono font-semibold ring-1 ${METHOD_TONE[state.method]}`}
              >
                {state.method}
              </span>
              <code className="font-mono text-xs text-foreground break-all">
                {state.baseUrl}
                <span className="text-primary">{state.path}</span>
              </code>
            </div>
          </div>
        )}

        {/* Auth */}
        {state.authHeader && (
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-300">
                <KeyRound className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Autenticação
              </span>
            </div>
            <code className="font-mono text-xs text-foreground break-all">{state.authHeader}</code>
          </div>
        )}

        {/* Params */}
        <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/10 text-violet-300">
              <Code2 className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Parâmetros ({state.params.length})
            </span>
          </div>
          {state.params.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              {isBuilding ? 'Detectando parâmetros…' : 'Sem parâmetros'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {state.params.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-wrap items-center gap-2 rounded-md bg-background/40 px-2.5 py-1.5"
                >
                  <code className="font-mono text-xs text-foreground">{p.name}</code>
                  <span className="font-mono text-[10px] text-muted-foreground">{p.type}</span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-px ring-1 ${LOCATION_TONE[p.location] ?? ''}`}
                  >
                    {p.location}
                  </span>
                  {p.required && (
                    <span className="text-[10px] text-rose-400">obrigatório</span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex-1 min-w-0 truncate">
                    {p.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Example response */}
        {state.exampleResponse && (
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Exemplo de resposta
              </span>
              <button className="text-[10px] text-primary hover:underline">Testar →</button>
            </div>
            <pre className="overflow-x-auto rounded-md bg-background/60 p-2 text-[11px] font-mono leading-relaxed text-foreground">
              {state.exampleResponse}
            </pre>
          </div>
        )}

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
              <span className="text-sm font-medium">Tool pronta. Pode criar.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
