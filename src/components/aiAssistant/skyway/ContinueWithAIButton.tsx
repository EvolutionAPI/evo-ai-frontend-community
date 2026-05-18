import { useEffect, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { History, Sparkles } from 'lucide-react';
import { listSessions, type PersistedSession } from '@/services/aiAssistant/aiSessionStore';

interface Props {
  /** Filtra sessões só desse tipo de entidade (ex: 'pipeline'). Se undefined mostra todas. */
  entityType?: string;
  /** Acionado ao clicar numa sessão; recebe os dados pra reabrir o dialog */
  onResume: (session: PersistedSession) => void;
  /** Label do botão */
  label?: string;
}

/**
 * SKYWAY — botão "Continuar com IA" que mostra sessões salvas relevantes.
 *
 * Usado em listings/edit pages para reabrir a conversa de criação/edição
 * de uma entidade. A sessão volta exatamente onde parou: mensagens,
 * plan cards, receipts, autonomy, mode.
 */
export function ContinueWithAIButton({ entityType, onResume, label = 'Continuar com IA' }: Props) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<PersistedSession[]>([]);

  useEffect(() => {
    if (!open) return;
    const all = listSessions();
    const filtered = entityType ? all.filter((s) => s.entityType === entityType) : all;
    setSessions(filtered);
  }, [open, entityType]);

  // Re-checar contagem ao montar para mostrar badge
  const [count, setCount] = useState(0);
  useEffect(() => {
    const all = listSessions();
    const filtered = entityType ? all.filter((s) => s.entityType === entityType) : all;
    setCount(filtered.length);
  }, [entityType, open]);

  if (count === 0) return null;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="gap-1.5 border-primary/30 bg-primary/[0.04] hover:bg-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        {label}
        <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded text-[10px] font-semibold bg-primary/15 text-primary ring-1 ring-primary/30">
          {count}
        </span>
      </Button>

      {open && (
        <>
          {/* backdrop p/ fechar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg shadow-black/40 animate-fadeIn">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Conversas IA salvas {entityType ? `· ${entityType}` : ''}
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {sessions.length === 0 ? (
                <p className="px-3 py-4 text-xs italic text-muted-foreground text-center">
                  Nenhuma conversa salva ainda.
                </p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.sessionKey}
                    type="button"
                    onClick={() => {
                      onResume(s);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                      <History className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">
                        {s.entityLabel}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono">{s.entityType}</span>
                        <span>·</span>
                        <span>{s.messages.length} mensagens</span>
                        <span>·</span>
                        <span>{relativeTime(s.updatedAt)}</span>
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h atrás`;
  const days = Math.floor(hr / 24);
  return `${days}d atrás`;
}
