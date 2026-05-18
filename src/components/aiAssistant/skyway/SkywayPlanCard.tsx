import { useMemo, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { ArrowRight, CheckCircle2, ListChecks, ShieldAlert, ShieldCheck, ShieldHalf } from 'lucide-react';
import type { SkywayPlan, ToolRiskTag } from '@/services/aiAssistant/mockAssistant';

interface Props {
  plan: SkywayPlan;
  isStreaming?: boolean;
  /** Disparado ao clicar Executar — devolve os ids dos steps marcados */
  onApprove: (approvedStepIds: string[]) => void;
  /** Já foi aprovado anteriormente — usado pra desabilitar/mostrar estado */
  approved?: boolean;
}

const RISK_META: Record<
  ToolRiskTag,
  { label: string; tone: string; icon: typeof ShieldCheck }
> = {
  safe: {
    label: 'Seguro',
    tone: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    icon: ShieldCheck,
  },
  confirm: {
    label: 'Pede confirmação',
    tone: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    icon: ShieldHalf,
  },
  gated: {
    label: 'Sensível',
    tone: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
    icon: ShieldAlert,
  },
};

export function SkywayPlanCard({ plan, isStreaming, onApprove, approved }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(plan.steps.filter((s) => s.selectedByDefault).map((s) => s.id)),
  );

  const stats = useMemo(() => {
    const all = plan.steps.length;
    const sel = selected.size;
    const gatedSelected = plan.steps.filter((s) => selected.has(s.id) && s.risk === 'gated').length;
    const irreversibleSelected = plan.steps.filter((s) => selected.has(s.id) && !s.reversible).length;
    return { all, sel, gatedSelected, irreversibleSelected };
  }, [plan.steps, selected]);

  const toggle = (id: string) => {
    if (approved) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-card/80 p-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
          <ListChecks className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
            Plano da IA · {stats.all} {stats.all === 1 ? 'passo' : 'passos'}
          </p>
          <p className="text-sm text-foreground leading-snug">{plan.summary}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {plan.steps.map((step, idx) => {
          const isSelected = selected.has(step.id);
          const risk = RISK_META[step.risk];
          const RiskIcon = risk.icon;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggle(step.id)}
              disabled={approved}
              className={[
                'group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                isSelected
                  ? 'border-primary/40 bg-primary/[0.04]'
                  : 'border-border bg-background/40 hover:border-border/80',
                approved ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
              ].join(' ')}
            >
              {/* Checkbox */}
              <span
                className={[
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card',
                ].join(' ')}
              >
                {isSelected && <CheckCircle2 className="h-3 w-3" />}
              </span>

              {/* Index + desc */}
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-foreground">{step.description}</span>
                </span>
                <span className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {step.toolName}()
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[9px] font-medium ring-1 ${risk.tone}`}
                  >
                    <RiskIcon className="h-2.5 w-2.5" />
                    {risk.label}
                  </span>
                  {!step.reversible && (
                    <span className="inline-flex items-center rounded px-1.5 py-px text-[9px] font-medium bg-muted text-muted-foreground ring-1 ring-border">
                      Não reversível
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {!approved ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{stats.sel}</span> de {stats.all} selecionados
            {stats.gatedSelected > 0 && (
              <span className="ml-2 text-rose-300">· {stats.gatedSelected} sensível</span>
            )}
            {stats.irreversibleSelected > 0 && (
              <span className="ml-2 text-amber-300">· {stats.irreversibleSelected} não reversível</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onApprove([...selected])}
            disabled={stats.sel === 0 || isStreaming}
            className="gap-1.5"
          >
            Executar {stats.sel} {stats.sel === 1 ? 'passo' : 'passos'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Plano aprovado — veja o recibo abaixo.
        </div>
      )}
    </div>
  );
}
