import {
  CalendarClock,
  Check,
  Clock,
  Gauge,
  Mail,
  MessageCircle,
  Megaphone,
  Phone,
  Send,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  CampaignChannel,
  CampaignPreviewState,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: CampaignPreviewState | null;
  isBuilding?: boolean;
}

const CHANNEL_META: Record<CampaignChannel, { icon: LucideIcon; label: string; tone: string }> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    tone: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  },
  email: {
    icon: Mail,
    label: 'Email',
    tone: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  },
  sms: {
    icon: Phone,
    label: 'SMS',
    tone: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  },
};

const TYPE_LABEL: Record<CampaignPreviewState['type'], string> = {
  simple: 'Simples',
  recurring: 'Recorrente',
  trigger: 'Por evento',
};

export function CampaignPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview da campanha</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva sua campanha no chat. A IA monta audiência, canal, templates
          e agendamento aqui em tempo real.
        </p>
      </div>
    );
  }

  const channel = CHANNEL_META[state.channel];
  const ChannelIcon = channel.icon;
  const ready = Boolean(state.name && state.audienceLabel && state.templates.length > 0);

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
            {isBuilding ? 'IA configurando campanha...' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || (
            <span className="text-muted-foreground italic">Aguardando nome...</span>
          )}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm line-clamp-2">
            {state.description}
          </p>
        )}
        <span className="mt-2 inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
          {TYPE_LABEL[state.type]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-3">
        {/* Audiência */}
        <Block
          icon={Users}
          title="Audiência"
          empty={!state.audienceLabel}
          emptyLabel="Definindo audiência..."
        >
          <p className="text-sm font-semibold text-foreground">
            {state.audienceSize.toLocaleString('pt-BR')}{' '}
            <span className="font-normal text-muted-foreground">contatos</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{state.audienceLabel}</p>
        </Block>

        {/* Canal */}
        <Block icon={Send} title="Canal" empty={!state.channel} emptyLabel="Escolhendo canal...">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${channel.tone}`}
            >
              <ChannelIcon className="h-3 w-3" />
              {channel.label}
            </span>
            {state.templates.length > 0 && (
              <span className="text-xs text-muted-foreground">
                · {state.templates.length} {state.templates.length === 1 ? 'template' : 'templates'}
              </span>
            )}
          </div>
        </Block>

        {/* Mensagem */}
        {state.messagePreview && (
          <Block icon={MessageCircle} title="Prévia da mensagem">
            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
              <p className="text-xs leading-relaxed text-foreground line-clamp-3">
                {state.messagePreview}
              </p>
            </div>
          </Block>
        )}

        {/* Templates */}
        {state.templates.length > 0 && (
          <Block icon={Send} title="Templates">
            <div className="space-y-1.5">
              {state.templates.map((tpl, i) => (
                <div
                  key={tpl}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5"
                >
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-foreground truncate">{tpl}</span>
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Agendamento */}
        {state.scheduledFor && (
          <Block icon={CalendarClock} title="Agendamento">
            <p className="text-sm text-foreground">{state.scheduledFor}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {state.useBusinessHours && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300 ring-1 ring-amber-500/20">
                  <Clock className="h-3 w-3" />
                  Horário comercial
                </span>
              )}
              {state.rateLimitPerHour !== null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-300 ring-1 ring-sky-500/20">
                  <Gauge className="h-3 w-3" />
                  {state.rateLimitPerHour}/h
                </span>
              )}
            </div>
          </Block>
        )}

        {ready && !isBuilding && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Campanha completa. Revise e crie quando quiser.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  children,
  empty,
  emptyLabel,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  empty?: boolean;
  emptyLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3 w-3" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {empty ? (
        <p className="text-xs italic text-muted-foreground">{emptyLabel}</p>
      ) : (
        children
      )}
    </div>
  );
}
