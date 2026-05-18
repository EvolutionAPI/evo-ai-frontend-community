import {
  Bot,
  Check,
  Clock,
  Globe,
  Instagram,
  Layers,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ChannelKind,
  ChannelPreviewState,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: ChannelPreviewState | null;
  isBuilding?: boolean;
}

const CHANNEL_META: Record<ChannelKind, { icon: LucideIcon; label: string; tone: string }> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    tone: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    tone: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    tone: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  },
  telegram: {
    icon: Send,
    label: 'Telegram',
    tone: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  },
  email: {
    icon: Mail,
    label: 'Email',
    tone: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  },
  sms: {
    icon: Phone,
    label: 'SMS',
    tone: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  },
  website: {
    icon: Globe,
    label: 'Website (Widget)',
    tone: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  },
  api: {
    icon: Webhook,
    label: 'API',
    tone: 'bg-muted text-muted-foreground ring-border',
  },
};

export function ChannelPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Layers className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Recomendação de canal</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva seu caso de uso. A IA recomenda o canal e o provider mais
          adequados, com motivos e próximos passos.
        </p>
      </div>
    );
  }

  const channel = CHANNEL_META[state.kind];
  const ChannelIcon = channel.icon;
  const ready = Boolean(state.name && state.provider && state.rationale);

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
            {isBuilding ? 'IA analisando seu caso...' : ready ? 'Recomendação pronta' : 'Analisando'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-md space-y-4">
          {/* Card principal — canal recomendado */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${channel.tone}`}
              >
                <ChannelIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Canal recomendado
                </p>
                <h3 className="mt-0.5 text-base font-semibold text-foreground truncate">
                  {state.name || `Canal ${channel.label}`}
                </h3>
                {state.provider && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Provider: <span className="text-foreground">{state.provider}</span>
                  </p>
                )}
              </div>
            </div>

            {state.estimatedSetupMinutes > 0 && (
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Setup estimado em ~{state.estimatedSetupMinutes} minutos
              </div>
            )}
          </div>

          {/* Por quê */}
          {state.rationale && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/15 text-violet-300">
                  <Bot className="h-3 w-3" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300">
                  Por quê
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground">
                {state.rationale}
              </p>
            </div>
          )}

          {/* Próximos passos */}
          {state.nextSteps.length > 0 && (
            <div className="rounded-xl border border-border bg-card/40 p-3.5 animate-fadeIn">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Próximos passos
              </p>
              <ol className="space-y-1.5">
                {state.nextSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {ready && !isBuilding && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Recomendação pronta. Clique em criar para iniciar a configuração.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
