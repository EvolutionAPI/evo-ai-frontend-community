import { Bot, Check, CircleDot, Workflow, Zap } from 'lucide-react';
import type { AutomationPreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: AutomationPreviewState | null;
  isBuilding?: boolean;
}

export function AutomationPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Workflow className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">
          Preview da automação
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o que precisa no chat ao lado. A automação aparece aqui em
          tempo real conforme a IA monta os detalhes.
        </p>
      </div>
    );
  }

  const hasName = Boolean(state.name);
  const hasEvent = Boolean(state.event);
  const hasConditions = state.conditions.length > 0;
  const hasActions = state.actions.length > 0;
  const ready = hasName && hasEvent && hasActions;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`} />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA montando...' : ready ? 'Pronto para criar' : 'Rascunho'}
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 sm:px-5">
        <Section
          title="Quando acontecer"
          icon={<CircleDot className="h-3.5 w-3.5" />}
          tone="violet"
          empty={!hasEvent}
          emptyLabel="Escolhendo o evento..."
        >
          {hasEvent && (
            <PreviewCard>
              <span className="font-mono text-xs text-muted-foreground">trigger</span>
              <span className="text-sm font-medium text-foreground">{prettyEvent(state.event)}</span>
            </PreviewCard>
          )}
        </Section>

        <Section
          title="Se as condições baterem"
          icon={<Bot className="h-3.5 w-3.5" />}
          tone="amber"
          empty={!hasConditions}
          emptyLabel="Sem condições (aplica a tudo)"
        >
          {hasConditions && (
            <div className="space-y-2">
              {state.conditions.map((c, i) => (
                <PreviewCard key={i}>
                  <span className="font-mono text-xs text-muted-foreground">{c.field}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-foreground">
                    {c.operator}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">{c.value}</span>
                </PreviewCard>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Então execute"
          icon={<Zap className="h-3.5 w-3.5" />}
          tone="emerald"
          empty={!hasActions}
          emptyLabel="Definindo ações..."
        >
          {hasActions && (
            <div className="space-y-2">
              {state.actions.map((a, i) => (
                <PreviewCard key={i}>
                  <span className="text-sm font-medium text-foreground">{prettyAction(a.name)}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2 flex-1 min-w-0">
                    {a.param}
                  </span>
                </PreviewCard>
              ))}
            </div>
          )}
        </Section>

        {ready && !isBuilding && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Tudo certo. Revise e crie quando quiser.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  tone: 'violet' | 'amber' | 'emerald' | 'sky';
  empty?: boolean;
  emptyLabel?: string;
  children: React.ReactNode;
}

const SECTION_TONES = {
  violet: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
  amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
};

function Section({ title, icon, tone, empty, emptyLabel, children }: SectionProps) {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md ring-1 ${SECTION_TONES[tone]}`}
        >
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {empty ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-2.5 text-xs italic text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 animate-fadeIn">
      {children}
    </div>
  );
}

function prettyEvent(ev: string): string {
  const map: Record<string, string> = {
    conversation_created: 'Nova conversa criada',
    conversation_idle_24h: 'Conversa sem resposta há 24h',
    message_received: 'Mensagem recebida',
    contact_created: 'Novo contato',
  };
  return map[ev] ?? ev;
}

function prettyAction(name: string): string {
  const map: Record<string, string> = {
    send_message: 'Enviar mensagem',
    assign_team: 'Atribuir time',
    assign_agent: 'Atribuir agente',
    set_priority: 'Definir prioridade',
    add_tag: 'Adicionar tag',
    remove_tag: 'Remover tag',
  };
  return map[name] ?? name;
}
