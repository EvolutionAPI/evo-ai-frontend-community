import { useMemo, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, RotateCcw } from 'lucide-react';
import type { SkywayReceipt } from '@/services/aiAssistant/mockAssistant';

interface Props {
  receipt: SkywayReceipt;
  /** Disparado ao clicar Desfazer */
  onUndo?: () => void;
  /** Se já foi desfeito antes — desabilita */
  undone?: boolean;
}

function timeRemaining(undoExpiresAt: string): string {
  const ms = new Date(undoExpiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expirado';
  const min = Math.floor(ms / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

export function SkywayReceiptCard({ receipt, onUndo, undone }: Props) {
  const stats = useMemo(() => {
    const ok = receipt.results.filter((r) => r.status === 'success').length;
    const err = receipt.results.filter((r) => r.status === 'error').length;
    const skip = receipt.results.filter((r) => r.status === 'skipped').length;
    return { ok, err, skip, total: receipt.results.length };
  }, [receipt.results]);

  const [_, setTick] = useState(0);
  // Atualiza o "Xm Xs" a cada segundo enquanto o undo é válido
  useState(() => {
    if (!receipt.undoable || undone) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  });

  const remaining = timeRemaining(receipt.undoExpiresAt);
  const undoExpired = remaining === 'expirado';

  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Recibo da execução
          </p>
          <p className="text-sm text-foreground">
            <span className="text-emerald-400 font-medium">{stats.ok} sucesso</span>
            {stats.err > 0 && (
              <span className="text-rose-400 font-medium"> · {stats.err} falha{stats.err > 1 ? 's' : ''}</span>
            )}
            {stats.skip > 0 && (
              <span className="text-muted-foreground"> · {stats.skip} pulado{stats.skip > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {receipt.results.map((r) => (
          <div
            key={r.stepId}
            className="flex items-start gap-2 rounded-lg border border-border bg-background/40 px-3 py-2"
          >
            {r.status === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : r.status === 'error' ? (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
            ) : (
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-foreground">{r.description}</span>
              {r.errorMessage && (
                <span className="block text-xs text-rose-400 mt-0.5">{r.errorMessage}</span>
              )}
              {r.entityRef && r.status === 'success' && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir
                </button>
              )}
            </span>
            {r.reversible && (
              <span className="shrink-0 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-px rounded">
                reversível
              </span>
            )}
          </div>
        ))}
      </div>

      {receipt.undoable && !undone && !undoExpired && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
          <div className="text-xs text-amber-300">
            <Clock className="inline h-3 w-3 mr-1" />
            Desfazer expira em <span className="font-mono">{remaining}</span>
          </div>
          <Button size="sm" variant="outline" onClick={onUndo} className="gap-1.5 h-7">
            <RotateCcw className="h-3 w-3" />
            Desfazer
          </Button>
        </div>
      )}

      {undone && (
        <div className="mt-4 rounded-lg bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
          <RotateCcw className="inline h-3 w-3 mr-1" />
          Ações reversíveis foram desfeitas.
        </div>
      )}
    </div>
  );
}
