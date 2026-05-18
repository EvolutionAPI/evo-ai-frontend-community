import {
  Bot,
  Brain,
  Check,
  Code2,
  MessageSquare,
  Package,
  Plug,
  Server,
  Settings as SettingsIcon,
  Users2,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AgentPreviewState, AgentSection } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: AgentPreviewState | null;
  isBuilding?: boolean;
}

const SECTIONS: Array<{ key: AgentSection; label: string; icon: LucideIcon }> = [
  { key: 'profile', label: 'Perfil', icon: Bot },
  { key: 'subAgents', label: 'Sub Agents', icon: Users2 },
  { key: 'tools', label: 'Tools', icon: Wrench },
  { key: 'integrations', label: 'Integrações', icon: Plug },
  { key: 'mcpServers', label: 'MCP Servers', icon: Server },
  { key: 'products', label: 'Produtos', icon: Package },
  { key: 'configuration', label: 'Configuração', icon: SettingsIcon },
];

const TYPE_LABEL: Record<string, string> = {
  llm: 'LLM (Language Model)',
  task: 'Task',
  sequential: 'Sequential',
  parallel: 'Parallel',
  loop: 'Loop',
  external: 'External Integration',
};

export function AgentPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do agente</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o agente que você quer no chat ao lado. Cada seção será
          configurada aqui em tempo real, como na tela de edição.
        </p>
      </div>
    );
  }

  const ready =
    !!state.name &&
    !!state.role &&
    !!state.model &&
    state.completedSections.includes('configuration');

  const initial = state.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header — espelha o card identidade do edit page */}
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground">
              {state.name || (
                <span className="text-muted-foreground italic">Aguardando nome...</span>
              )}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {TYPE_LABEL[state.type] ?? state.type}
            </p>
          </div>
          <span
            className={[
              'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
              isBuilding
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                : ready
                  ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                  : 'bg-muted text-muted-foreground ring-1 ring-border',
            ].join(' ')}
          >
            <span
              className={[
                'h-1.5 w-1.5 rounded-full',
                isBuilding ? 'bg-primary animate-pulse' : ready ? 'bg-emerald-400' : 'bg-muted-foreground',
              ].join(' ')}
            />
            {isBuilding ? 'Montando' : ready ? 'Pronto' : 'Rascunho'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar de seções, igual edit page */}
        <nav className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-card/30 p-2 md:flex">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const completed = state.completedSections.includes(s.key);
            const current = state.currentSection === s.key;
            return (
              <div
                key={s.key}
                className={[
                  'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                  current
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : completed
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{s.label}</span>
                {completed ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : current ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 sm:px-5">
          <ProfileSection state={state} highlight={state.currentSection === 'profile'} />
          <ToolsSection state={state} highlight={state.currentSection === 'tools'} />
          <IntegrationsSection
            state={state}
            highlight={state.currentSection === 'integrations'}
          />
          <McpSection state={state} highlight={state.currentSection === 'mcpServers'} />
          <ProductsSection state={state} highlight={state.currentSection === 'products'} />
          <ConfigSection state={state} highlight={state.currentSection === 'configuration'} />

          {ready && !isBuilding && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Agente completo. Revise e crie quando quiser.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Sections -----------------------------------------------------------------

interface SectionProps {
  state: AgentPreviewState;
  highlight: boolean;
}

function SectionWrapper({
  title,
  icon,
  highlight,
  empty,
  emptyLabel,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  highlight: boolean;
  empty?: boolean;
  emptyLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3 transition-colors animate-fadeIn',
        highlight ? 'border-primary/40 bg-primary/[0.03]' : 'border-border bg-card/30',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {highlight && (
          <span className="ml-auto text-[10px] font-medium text-primary animate-pulse">
            Preenchendo...
          </span>
        )}
      </div>
      {empty ? (
        <p className="text-xs italic text-muted-foreground">{emptyLabel}</p>
      ) : (
        children
      )}
    </div>
  );
}

function ProfileSection({ state, highlight }: SectionProps) {
  const empty = !state.role && !state.goal && !state.behavior;
  return (
    <SectionWrapper
      title="Perfil"
      icon={<Bot className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel="Aguardando informações..."
    >
      <div className="space-y-2">
        {state.role && (
          <Field label="Papel" value={state.role} />
        )}
        {state.goal && (
          <Field label="Objetivo" value={state.goal} />
        )}
        {state.behavior && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Comportamento
            </p>
            <p className="text-xs leading-relaxed text-foreground bg-muted/40 rounded-md px-2.5 py-2 line-clamp-4">
              {state.behavior}
            </p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

function ToolsSection({ state, highlight }: SectionProps) {
  const empty = state.tools.length === 0;
  return (
    <SectionWrapper
      title="Tools"
      icon={<Wrench className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel={highlight ? 'Selecionando ferramentas...' : 'Nenhuma ferramenta vinculada'}
    >
      <div className="flex flex-wrap gap-1.5">
        {state.tools.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
          >
            <Code2 className="h-3 w-3 text-violet-400" />
            <span className="font-mono text-foreground">{t.name}</span>
            {t.method && (
              <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                {t.method}
              </span>
            )}
          </span>
        ))}
      </div>
    </SectionWrapper>
  );
}

function IntegrationsSection({ state, highlight }: SectionProps) {
  const empty = state.integrations.length === 0;
  return (
    <SectionWrapper
      title="Integrações"
      icon={<Plug className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel={highlight ? 'Conectando integrações...' : 'Nenhuma integração ativa'}
    >
      <div className="flex flex-wrap gap-1.5">
        {state.integrations.map((name) => (
          <Pill key={name} text={name} tone="violet" />
        ))}
      </div>
    </SectionWrapper>
  );
}

function McpSection({ state, highlight }: SectionProps) {
  const empty = state.mcpServers.length === 0;
  return (
    <SectionWrapper
      title="MCP Servers"
      icon={<Server className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel={highlight ? 'Habilitando MCPs...' : 'Nenhum MCP habilitado'}
    >
      <div className="flex flex-wrap gap-1.5">
        {state.mcpServers.map((name) => (
          <Pill key={name} text={name} tone="emerald" />
        ))}
      </div>
    </SectionWrapper>
  );
}

function ProductsSection({ state, highlight }: SectionProps) {
  const empty = state.products.length === 0;
  return (
    <SectionWrapper
      title="Produtos"
      icon={<Package className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel={highlight ? 'Vinculando produtos...' : 'Sem produtos vinculados'}
    >
      <div className="flex flex-wrap gap-1.5">
        {state.products.map((name) => (
          <Pill key={name} text={name} tone="amber" />
        ))}
      </div>
    </SectionWrapper>
  );
}

function ConfigSection({ state, highlight }: SectionProps) {
  const empty = !state.model;
  return (
    <SectionWrapper
      title="Configuração"
      icon={<SettingsIcon className="h-3 w-3" />}
      highlight={highlight}
      empty={empty}
      emptyLabel={highlight ? 'Definindo modelo e capacidades...' : 'Modelo não definido'}
    >
      <div className="space-y-2">
        {state.model && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
            <Brain className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-xs text-muted-foreground">Modelo:</span>
            <span className="text-xs font-medium text-foreground">{state.model}</span>
            {state.apiProvider && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                {state.apiProvider}
              </span>
            )}
          </div>
        )}
        {state.capabilities.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Capacidades
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.capabilities.map((c) => (
                <Pill key={c} text={c} tone="sky" />
              ))}
            </div>
          </div>
        )}
        {state.conversationBehavior.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Comportamento na conversa
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.conversationBehavior.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                >
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

// -- Helpers ------------------------------------------------------------------

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

const TONE_CLS = {
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
};

function Pill({ text, tone }: { text: string; tone: keyof typeof TONE_CLS }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${TONE_CLS[tone]}`}
    >
      {text}
    </span>
  );
}
