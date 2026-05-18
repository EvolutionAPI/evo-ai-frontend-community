import {
  ArrowDown,
  Bot,
  Calendar,
  Check,
  CircleDot,
  Clock,
  Database,
  Flag,
  GitBranch,
  LogOut,
  Mail,
  MessageCircle,
  Repeat,
  Route,
  Send,
  Shuffle,
  Tag,
  Tags,
  UserCog,
  Users2,
  Variable,
  VolumeX,
  Webhook,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  JourneyNodeType,
  JourneyPreviewState,
  JourneyTriggerType,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: JourneyPreviewState | null;
  isBuilding?: boolean;
}

type NodeTone = 'violet' | 'emerald' | 'amber' | 'sky' | 'rose' | 'slate';

interface NodeMeta {
  icon: LucideIcon;
  tone: NodeTone;
  defaultLabel: string;
}

const NODE_META: Record<JourneyNodeType, NodeMeta> = {
  trigger: { icon: Zap, tone: 'violet', defaultLabel: 'Gatilho' },
  wait: { icon: Clock, tone: 'amber', defaultLabel: 'Aguardar' },
  conditional: { icon: GitBranch, tone: 'amber', defaultLabel: 'Condição' },
  split: { icon: Shuffle, tone: 'amber', defaultLabel: 'Bifurcar' },
  'scheduled-action': { icon: Calendar, tone: 'sky', defaultLabel: 'Ação agendada' },
  'send-message': { icon: MessageCircle, tone: 'sky', defaultLabel: 'Enviar mensagem' },
  'send-transcript': { icon: Send, tone: 'sky', defaultLabel: 'Enviar transcrição' },
  'send-email-team': { icon: Mail, tone: 'sky', defaultLabel: 'E-mail para o time' },
  'send-webhook': { icon: Webhook, tone: 'sky', defaultLabel: 'Webhook' },
  'add-label': { icon: Tag, tone: 'emerald', defaultLabel: 'Adicionar tag' },
  'remove-label': { icon: Tags, tone: 'rose', defaultLabel: 'Remover tag' },
  'update-contact': { icon: UserCog, tone: 'emerald', defaultLabel: 'Atualizar contato' },
  'update-custom-attribute': { icon: Database, tone: 'emerald', defaultLabel: 'Atributo custom' },
  'set-variable': { icon: Variable, tone: 'emerald', defaultLabel: 'Definir variável' },
  'assign-agent': { icon: UserCog, tone: 'emerald', defaultLabel: 'Atribuir agente' },
  'assign-team': { icon: Users2, tone: 'emerald', defaultLabel: 'Atribuir time' },
  'assign-bot': { icon: Bot, tone: 'emerald', defaultLabel: 'Atribuir bot' },
  'mute-conversation': { icon: VolumeX, tone: 'slate', defaultLabel: 'Silenciar conversa' },
  'defer-conversation': { icon: Clock, tone: 'slate', defaultLabel: 'Adiar conversa' },
  'resolve-conversation': { icon: Check, tone: 'emerald', defaultLabel: 'Resolver conversa' },
  'change-priority': { icon: Flag, tone: 'amber', defaultLabel: 'Mudar prioridade' },
  'exit-journey': { icon: LogOut, tone: 'slate', defaultLabel: 'Encerrar jornada' },
  'transfer-journey': { icon: Repeat, tone: 'violet', defaultLabel: 'Transferir jornada' },
};

const TONE_CLS: Record<NodeTone, string> = {
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
  slate: 'bg-muted text-muted-foreground ring-border',
};

const TRIGGER_LABEL: Record<JourneyTriggerType, string> = {
  Manual: 'Manual',
  Event: 'Evento',
  Segment: 'Segmento',
  Schedule: 'Agendamento',
  Webhook: 'Webhook',
  Label: 'Tag aplicada',
  ContactCreated: 'Contato criado',
};

export function JourneyPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Route className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview da jornada</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o fluxo no chat ao lado. A IA monta os nós conectados aqui
          em tempo real — você pode abrir no canvas depois para refinar.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.triggerSummary && state.nodes.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`}
            />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA montando fluxo...' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          {state.name || (
            <span className="text-muted-foreground italic">Aguardando nome...</span>
          )}
        </h3>
        {state.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{state.description}</p>
        )}
      </div>

      {/* Fluxo */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mx-auto max-w-md">
          {/* Trigger card no topo */}
          <FlowNode
            icon={Zap}
            tone="violet"
            label={`Gatilho · ${TRIGGER_LABEL[state.trigger]}`}
            summary={state.triggerSummary || 'Definindo...'}
            isTrigger
            empty={!state.triggerSummary}
          />

          {state.nodes.length === 0 && !state.triggerSummary ? null : <Connector />}

          {/* Demais nós */}
          {state.nodes.map((node, i) => {
            const meta = NODE_META[node.type] ?? NODE_META['send-message'];
            const isLast = i === state.nodes.length - 1;
            return (
              <div key={node.id}>
                <FlowNode
                  icon={meta.icon}
                  tone={meta.tone}
                  label={node.label || meta.defaultLabel}
                  summary={node.summary}
                />
                {!isLast && <Connector />}
              </div>
            );
          })}

          {/* Indicador "carregando próximo nó" durante streaming */}
          {isBuilding && state.nodes.length > 0 && (
            <div className="mt-2 flex justify-center animate-fadeIn">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce" />
                </span>
                adicionando próximo passo
              </span>
            </div>
          )}

          {ready && !isBuilding && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Jornada com {state.nodes.length} {state.nodes.length === 1 ? 'passo' : 'passos'}. Pode criar e abrir no canvas.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Subcomponents ------------------------------------------------------------

function FlowNode({
  icon: Icon,
  tone,
  label,
  summary,
  isTrigger = false,
  empty = false,
}: {
  icon: LucideIcon;
  tone: NodeTone;
  label: string;
  summary?: string;
  isTrigger?: boolean;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs italic text-muted-foreground">Aguardando definição...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        'rounded-xl border bg-card/60 px-3 py-2.5 transition-all animate-fadeIn',
        isTrigger ? 'border-violet-500/30' : 'border-border hover:border-primary/30',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${TONE_CLS[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{label}</p>
          {summary && (
            <p className="text-xs text-muted-foreground truncate">{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1.5 animate-fadeIn">
      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/60" />
    </div>
  );
}
