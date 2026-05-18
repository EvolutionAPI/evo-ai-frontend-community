import { Gauge, Rocket, ShieldCheck } from 'lucide-react';
import type { AutonomyLevel } from '@/services/aiAssistant/mockAssistant';

interface Props {
  value: AutonomyLevel;
  onChange: (level: AutonomyLevel) => void;
}

const LEVELS: Array<{
  value: AutonomyLevel;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof ShieldCheck;
  tone: string;
}> = [
  {
    value: 'conservative',
    label: 'Conservador',
    shortLabel: 'C',
    description: 'Pede confirmação em quase tudo (default)',
    icon: ShieldCheck,
    tone: 'text-emerald-300',
  },
  {
    value: 'balanced',
    label: 'Balanceado',
    shortLabel: 'B',
    description: 'Auto-aplica seguro e confirmação; pede aprovação só em ações sensíveis',
    icon: Gauge,
    tone: 'text-sky-300',
  },
  {
    value: 'autopilot',
    label: 'Autopilot',
    shortLabel: 'A',
    description: 'Aplica tudo; só pede em ações destrutivas em massa (>10 entidades)',
    icon: Rocket,
    tone: 'text-amber-300',
  },
];

export function AutonomySlider({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
      {LEVELS.map((lvl) => {
        const Icon = lvl.icon;
        const active = value === lvl.value;
        return (
          <button
            key={lvl.value}
            type="button"
            onClick={() => onChange(lvl.value)}
            title={`${lvl.label} — ${lvl.description}`}
            aria-label={lvl.label}
            aria-pressed={active}
            className={[
              'h-7 px-2 rounded text-xs font-medium transition-all flex items-center gap-1.5',
              active
                ? `bg-card shadow-sm ${lvl.tone}`
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{lvl.label}</span>
            <span className="sm:hidden">{lvl.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
