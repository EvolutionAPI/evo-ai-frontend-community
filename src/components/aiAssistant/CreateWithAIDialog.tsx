import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@evoapi/design-system';
import { ArrowRight, CircleSlash, Pencil, Sparkles, Wand2 } from 'lucide-react';
import {
  AutonomySlider,
  InlineFormBubble,
  SkywayPlanCard,
  SkywayReceiptCard,
  ThinkingLine,
} from './skyway';
import AutomationForm from '@/pages/Customer/Automation/AutomationForm';
import { AgentWizardModal } from '@/components/agents';
import { JourneyManualForm } from './JourneyManualForm';
import { AIComposer } from './AIComposer';
import { ChatMessages } from './ChatMessages';
import { TemplateGrid } from './TemplateGrid';
import { AutomationPreview } from './AutomationPreview';
import { AgentPreview } from './AgentPreview';
import { JourneyPreview } from './JourneyPreview';
import { ContactPreview } from './ContactPreview';
import { PipelinePreview } from './PipelinePreview';
import { ProductPreview } from './ProductPreview';
import { CampaignPreview } from './CampaignPreview';
import { ChannelPreview } from './ChannelPreview';
import { TemplatePreview } from './TemplatePreview';
import { CustomToolPreview } from './CustomToolPreview';
import { CustomMcpPreview } from './CustomMcpPreview';
import { SegmentPreview } from './SegmentPreview';
import { MacroPreview } from './MacroPreview';
import { RolePreview } from './RolePreview';
import {
  type AgentPreviewState,
  type AssistantFeature,
  type AssistantTemplate,
  type AutomationPreviewState,
  type AutonomyLevel,
  type CampaignPreviewState,
  type ChannelPreviewState,
  type CustomMcpPreviewState,
  type CustomToolPreviewState,
  type MacroPreviewState,
  type RolePreviewState,
  type SegmentPreviewState,
  type ChatMessage,
  type ChatMode,
  type ContactPreviewState,
  type JourneyPreviewState,
  type PipelinePreviewState,
  type ProductPreviewState,
  type SkywayInlineForm,
  type SkywayPlan,
  type SkywayReceipt,
  type TemplatePreviewState,
  type StreamHandle,
  approvePlan,
  getTemplates,
  newMessage,
  streamAssistantReply,
  submitInlineForm,
} from '@/services/aiAssistant/mockAssistant';
import {
  loadSession,
  saveSession,
  type PersistedSession,
  type PersistedSkywayEvent,
} from '@/services/aiAssistant/aiSessionStore';

/** Eventos Skyway que aparecem no fluxo da conversa entre mensagens */
type SkywayEvent =
  | { kind: 'thinking'; id: string; text: string; active: boolean }
  | { kind: 'plan'; id: string; plan: SkywayPlan; approved: boolean }
  | { kind: 'receipt'; id: string; receipt: SkywayReceipt; undone: boolean }
  | { kind: 'inline_form'; id: string; form: SkywayInlineForm; submitted: boolean };

type AnyPreview =
  | AutomationPreviewState
  | AgentPreviewState
  | JourneyPreviewState
  | ContactPreviewState
  | PipelinePreviewState
  | ProductPreviewState
  | CampaignPreviewState
  | ChannelPreviewState
  | TemplatePreviewState
  | CustomToolPreviewState
  | CustomMcpPreviewState
  | SegmentPreviewState
  | MacroPreviewState
  | RolePreviewState
  | null;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: AssistantFeature;
  /** Título do dialog (ex: "Nova automação", "Novo agente") */
  title: string;
  /** Acionado quando o usuário aceita a sugestão da IA (mock) */
  onAcceptAI?: (preview: AnyPreview) => void;
  /** Acionado quando o form manual é salvo com sucesso */
  onManualSubmitSuccess?: () => void;
  /**
   * Para features cujo "manual" é um modal/rota próprios (Contacts, Pipelines,
   * Products, Campaigns, Channels), passe esse callback. Quando o usuário clicar
   * em "Abrir formulário manual", fechamos o dialog e o parent abre o seu
   * modal/rota nativo.
   */
  onOpenManual?: () => void;
  /**
   * SKYWAY — quando definido, o dialog persiste a sessão (mensagens, plans,
   * receipts, autonomy, mode) atrelada a essa chave. Reabrir o dialog com a
   * mesma key restaura o estado da conversa.
   *
   * Formato: `${entityType}:${entityId}` (ex: `pipeline:p-001`).
   * Em fluxo de criação, passar uma chave provisória tipo `pipeline:new` e
   * trocar pelo id real depois que onAcceptAI for chamado, ou simplesmente
   * deixar `undefined` em criação inicial.
   */
  sessionKey?: string;
  /**
   * SKYWAY — label da entidade pra exibir no botão de retomar (ex: "Funil de Vendas B2B")
   */
  sessionEntityLabel?: string;
}

const FEATURE_LABEL: Record<AssistantFeature, string> = {
  automation: 'automatizar',
  agent: 'que o agente faça',
  contacts: 'cadastrar como contato',
  pipeline: 'estruturar um pipeline',
  products: 'cadastrar como produto',
  campaigns: 'fazer com uma campanha',
  channels: 'conectar como canal',
  templates: 'mandar como mensagem',
  customTool: 'integrar como API',
  customMcp: 'conectar como servidor MCP',
  segment: 'agrupar como segmento',
  macro: 'automatizar como macro',
  role: 'permitir como role',
  journey: 'desenhar uma jornada',
  general: 'fazer',
};

const FEATURE_CTA: Record<AssistantFeature, string> = {
  automation: 'Criar automação',
  agent: 'Criar agente',
  contacts: 'Criar contato',
  pipeline: 'Criar pipeline',
  products: 'Criar produto',
  campaigns: 'Criar campanha',
  channels: 'Criar canal',
  templates: 'Salvar template',
  customTool: 'Criar tool',
  customMcp: 'Conectar MCP',
  segment: 'Criar segmento',
  macro: 'Criar macro',
  role: 'Criar role',
  journey: 'Criar jornada',
  general: 'Criar',
};

const FEATURE_PLACEHOLDER: Record<AssistantFeature, string> = {
  automation: 'Descreva a automação que você quer criar...',
  agent: 'Descreva o agente que você quer (papel, objetivo, ferramentas)...',
  contacts: 'Descreva o contato — nome, empresa, contato, tags...',
  pipeline: 'Descreva o pipeline que você quer estruturar...',
  products: 'Descreva o produto — nome, preço, tipo, tags...',
  campaigns: 'Descreva a campanha — público, canal, mensagem, agendamento...',
  channels: 'Descreva seu caso de uso para eu recomendar o canal certo...',
  templates: 'Descreva a mensagem que você quer — use {{nome}} para variáveis...',
  customTool: 'Descreva o endpoint HTTP — método, URL, parâmetros, auth...',
  customMcp: 'Descreva o servidor MCP que você quer conectar (URL, auth, ferramentas)...',
  segment: 'Descreva o filtro — quem você quer agrupar...',
  macro: 'Descreva a sequência de ações que a macro vai executar...',
  role: 'Descreva o perfil — qual time, o que precisa fazer, o que não pode...',
  journey: 'Descreva a jornada do cliente...',
  general: 'Pergunte qualquer coisa...',
};

export function CreateWithAIDialog({
  open,
  onOpenChange,
  feature,
  title,
  onAcceptAI,
  onManualSubmitSuccess,
  onOpenManual,
  sessionKey,
  sessionEntityLabel,
}: Props) {
  const [tab, setTab] = useState<'ai' | 'manual'>('ai');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [preview, setPreview] = useState<AnyPreview>(null);
  const streamRef = useRef<StreamHandle | null>(null);
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');

  // SKYWAY: estado dos padrões inspirados em Lovable/Replit/V0
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('balanced');
  const [mode, setMode] = useState<ChatMode>('apply');
  const [skywayEvents, setSkywayEvents] = useState<SkywayEvent[]>([]);

  const pushSkyway = (e: SkywayEvent) => setSkywayEvents((prev) => [...prev, e]);
  const updateSkyway = (id: string, fn: (e: SkywayEvent) => SkywayEvent) =>
    setSkywayEvents((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
  const deactivateThinking = () =>
    setSkywayEvents((prev) =>
      prev.map((e) => (e.kind === 'thinking' && e.active ? { ...e, active: false } : e)),
    );

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setStreamingText(null);
      setPreview(null);
      setSkywayEvents([]);
      setTab('ai');
      setMode('apply');
      streamRef.current?.cancel();
      streamRef.current = null;
      return;
    }

    // SKYWAY: carregar sessão persistida quando o dialog abre com sessionKey
    if (sessionKey) {
      const persisted = loadSession(sessionKey);
      if (persisted) {
        setMessages(persisted.messages);
        setAutonomy(persisted.autonomy);
        setMode(persisted.mode);
        // Reconstruir SkywayEvents do formato persistido
        setSkywayEvents(
          persisted.events
            .map((e): SkywayEvent | null => {
              if (e.kind === 'thinking' && e.text !== undefined) {
                return { kind: 'thinking', id: e.id, text: e.text, active: false };
              }
              if (e.kind === 'plan' && e.plan) {
                return { kind: 'plan', id: e.id, plan: e.plan, approved: e.approved ?? true };
              }
              if (e.kind === 'receipt' && e.receipt) {
                return { kind: 'receipt', id: e.id, receipt: e.receipt, undone: e.undone ?? false };
              }
              if (e.kind === 'inline_form' && e.form) {
                return {
                  kind: 'inline_form',
                  id: e.id,
                  form: e.form,
                  submitted: e.submitted ?? true,
                };
              }
              return null;
            })
            .filter((e): e is SkywayEvent => e !== null),
        );
      }
    }
  }, [open, sessionKey]);

  /** Helper — persiste sessão atual (chamado em onAcceptAI e ao fechar com mudanças) */
  const persistCurrentSession = (entityId: string, label: string) => {
    if (!sessionKey && !entityId) return;
    const key = sessionKey ?? `${feature}:${entityId}`;
    const session: PersistedSession = {
      sessionKey: key,
      entityType: feature,
      entityId,
      entityLabel: label || sessionEntityLabel || 'Entidade',
      feature,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages,
      events: skywayEvents.map((e): PersistedSkywayEvent => {
        if (e.kind === 'thinking') {
          return { kind: 'thinking', id: e.id, text: e.text, active: false };
        }
        if (e.kind === 'plan') {
          return { kind: 'plan', id: e.id, plan: e.plan, approved: e.approved };
        }
        if (e.kind === 'receipt') {
          return { kind: 'receipt', id: e.id, receipt: e.receipt, undone: e.undone };
        }
        return { kind: 'inline_form', id: e.id, form: e.form, submitted: e.submitted };
      }),
      autonomy,
      mode,
    };
    saveSession(session);
  };

  const isStreaming = streamingText !== null;

  const send = (text: string) => {
    if (streamRef.current) streamRef.current.cancel();

    setMessages((prev) => [...prev, newMessage('user', text)]);
    setStreamingText('');

    let acc = '';
    streamRef.current = streamAssistantReply<AnyPreview>(
      text,
      feature,
      {
        onToken: (tok) => {
          acc += tok;
          setStreamingText(acc);
        },
        onPreviewUpdate: (state) => setPreview(state),
        onThinking: (t) => {
          deactivateThinking();
          pushSkyway({
            kind: 'thinking',
            id: `th-${Date.now()}-${Math.random()}`,
            text: t,
            active: true,
          });
        },
        onPlan: (plan) => {
          pushSkyway({ kind: 'plan', id: plan.id, plan, approved: false });
        },
        onInlineForm: (form) => {
          pushSkyway({ kind: 'inline_form', id: form.id, form, submitted: false });
        },
        onDone: (full) => {
          deactivateThinking();
          if (full) setMessages((prev) => [...prev, newMessage('assistant', full)]);
          setStreamingText(null);
          streamRef.current = null;
        },
      },
      { mode, autonomy },
    );
  };

  const handleApprovePlan = (planId: string, stepIds: string[]) => {
    const planEvt = skywayEvents.find(
      (e): e is Extract<SkywayEvent, { kind: 'plan' }> => e.kind === 'plan' && e.id === planId,
    );
    if (!planEvt) return;
    updateSkyway(planId, (e) => ({ ...e, approved: true } as SkywayEvent));
    setStreamingText('');
    let acc = '';
    streamRef.current = approvePlan(planEvt.plan, stepIds, {
      onToken: (tok) => {
        acc += tok;
        setStreamingText(acc);
      },
      onThinking: (t) => {
        deactivateThinking();
        pushSkyway({ kind: 'thinking', id: `th-${Date.now()}-${Math.random()}`, text: t, active: true });
      },
      onReceipt: (rcpt) => {
        pushSkyway({ kind: 'receipt', id: rcpt.id, receipt: rcpt, undone: false });
      },
      onDone: (full) => {
        deactivateThinking();
        if (full) setMessages((prev) => [...prev, newMessage('assistant', full)]);
        setStreamingText(null);
        streamRef.current = null;
      },
    });
  };

  const handleUndoReceipt = (receiptId: string) => {
    updateSkyway(receiptId, (e) => ({ ...e, undone: true } as SkywayEvent));
    setMessages((prev) => [
      ...prev,
      newMessage(
        'assistant',
        '↩️ Ações reversíveis foram desfeitas. Itens irreversíveis (envios concluídos) permanecem.',
      ),
    ]);
  };

  const handleSubmitInlineForm = (formId: string, values: Record<string, string>) => {
    const formEvt = skywayEvents.find(
      (e): e is Extract<SkywayEvent, { kind: 'inline_form' }> => e.kind === 'inline_form' && e.id === formId,
    );
    if (!formEvt) return;
    updateSkyway(formId, (e) => ({ ...e, submitted: true } as SkywayEvent));
    setStreamingText('');
    let acc = '';
    streamRef.current = submitInlineForm(formEvt.form, values, {
      onToken: (tok) => {
        acc += tok;
        setStreamingText(acc);
      },
      onThinking: (t) => {
        deactivateThinking();
        pushSkyway({ kind: 'thinking', id: `th-${Date.now()}-${Math.random()}`, text: t, active: true });
      },
      onReceipt: (rcpt) => {
        pushSkyway({ kind: 'receipt', id: rcpt.id, receipt: rcpt, undone: false });
      },
      onDone: (full) => {
        deactivateThinking();
        if (full) setMessages((prev) => [...prev, newMessage('assistant', full)]);
        setStreamingText(null);
        streamRef.current = null;
      },
    });
  };

  const stop = () => {
    streamRef.current?.cancel();
    if (streamingText !== null) {
      setMessages((prev) => [...prev, newMessage('assistant', streamingText || '(geração interrompida)')]);
      setStreamingText(null);
    }
    deactivateThinking();
  };

  const pickTemplate = (tpl: AssistantTemplate) => send(tpl.prompt);

  const templates = getTemplates(feature);
  const ready = isReady(feature, preview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={[
          '!max-w-[1200px] p-0 overflow-hidden gap-0 bg-background',
          'w-screen h-[100dvh] max-h-[100dvh] !rounded-none border-0',
          'sm:w-[96vw] sm:h-[88vh] sm:max-h-[820px] sm:!rounded-lg sm:border',
          '!grid-rows-[auto_minmax(0,1fr)]',
        ].join(' ')}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4 sm:py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h2 className="truncate text-[13px] font-semibold text-foreground">{title}</h2>
            <span className="hidden md:inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
              Skyway
            </span>
          </div>

          {tab === 'ai' && (
            <div className="hidden sm:flex items-center gap-1.5">
              {/* Plan/Apply toggle */}
              <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('plan')}
                  className={[
                    'h-7 px-2 rounded text-[11px] font-medium transition-all flex items-center gap-1',
                    mode === 'plan'
                      ? 'bg-card shadow-sm text-sky-300'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                  title="Planejar — IA descreve sem agir"
                >
                  <CircleSlash className="h-3 w-3" />
                  Planejar
                </button>
                <button
                  type="button"
                  onClick={() => setMode('apply')}
                  className={[
                    'h-7 px-2 rounded text-[11px] font-medium transition-all flex items-center gap-1',
                    mode === 'apply'
                      ? 'bg-card shadow-sm text-emerald-300'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                  title="Aplicar — IA executa tools"
                >
                  <Wand2 className="h-3 w-3" />
                  Aplicar
                </button>
              </div>
              <AutonomySlider value={autonomy} onChange={setAutonomy} />
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'ai' | 'manual')}>
            <TabsList className="h-10 bg-muted/60 p-1">
              <TabsTrigger
                value="ai"
                className="h-8 gap-1.5 px-3 text-xs data-[state=active]:bg-card"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Com IA</span>
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="h-8 gap-1.5 px-3 text-xs data-[state=active]:bg-card"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Manual</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <span className="w-7" aria-hidden />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'ai' | 'manual')} className="flex-1 min-h-0">
          <TabsContent value="ai" className="m-0 h-full data-[state=inactive]:hidden">
            <div className="flex items-center justify-center gap-1 border-b border-border bg-card/30 p-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileView('chat')}
                className={[
                  'flex-1 rounded-md px-3 h-10 text-sm font-medium transition-colors',
                  mobileView === 'chat'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={[
                  'relative flex-1 rounded-md px-3 h-10 text-sm font-medium transition-colors',
                  mobileView === 'preview'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                Preview
                {preview && mobileView !== 'preview' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </div>

            <div className="grid h-[calc(100%-52px)] grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
              <div
                className={[
                  'h-full min-h-0 flex-col border-border bg-card/30 lg:flex lg:border-r',
                  mobileView === 'chat' ? 'flex' : 'hidden lg:flex',
                ].join(' ')}
              >
                <ChatMessages
                  messages={messages}
                  streamingText={streamingText ?? undefined}
                  emptyState={
                    <ChatEmpty
                      feature={feature}
                      templates={templates}
                      onPickTemplate={pickTemplate}
                    />
                  }
                  afterMessages={
                    skywayEvents.length > 0 ? (
                      <div className="space-y-2.5">
                        {skywayEvents.map((e) => {
                          if (e.kind === 'thinking') {
                            return <ThinkingLine key={e.id} text={e.text} active={e.active} />;
                          }
                          if (e.kind === 'plan') {
                            return (
                              <SkywayPlanCard
                                key={e.id}
                                plan={e.plan}
                                approved={e.approved}
                                onApprove={(ids) => handleApprovePlan(e.id, ids)}
                              />
                            );
                          }
                          if (e.kind === 'receipt') {
                            return (
                              <SkywayReceiptCard
                                key={e.id}
                                receipt={e.receipt}
                                undone={e.undone}
                                onUndo={() => handleUndoReceipt(e.id)}
                              />
                            );
                          }
                          if (e.kind === 'inline_form') {
                            return (
                              <InlineFormBubble
                                key={e.id}
                                form={e.form}
                                submitted={e.submitted}
                                onSubmit={(vals) => handleSubmitInlineForm(e.id, vals)}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : undefined
                  }
                />
                <div
                  className={[
                    'border-t border-border bg-background/60 p-3',
                    mode === 'plan' ? 'border-t-sky-500/40' : '',
                  ].join(' ')}
                >
                  <AIComposer
                    placeholder={
                      mode === 'plan'
                        ? `Modo Planejar — descreva e a IA explica sem executar...`
                        : FEATURE_PLACEHOLDER[feature]
                    }
                    onSubmit={send}
                    onStop={stop}
                    isStreaming={isStreaming}
                    autoFocus
                  />
                </div>
              </div>

              <div
                className={[
                  'h-full min-h-0 flex-col bg-background lg:flex',
                  mobileView === 'preview' ? 'flex' : 'hidden lg:flex',
                ].join(' ')}
              >
                <PreviewRenderer feature={feature} preview={preview} isStreaming={isStreaming} />
                <div className="border-t border-border bg-card/30 px-4 py-2.5 sm:px-6 flex items-center justify-between gap-2">
                  <p className="hidden sm:block text-xs text-muted-foreground">
                    {ready
                      ? 'Tudo pronto — pode criar.'
                      : 'O preview é atualizado em tempo real pela IA.'}
                  </p>
                  <Button
                    size="sm"
                    disabled={!ready || isStreaming}
                    onClick={() => {
                      if (!preview) return;
                      // SKYWAY: persiste sessão antes de finalizar
                      const newEntityId = `mock-${feature}-${Date.now().toString(36)}`;
                      const label = extractEntityLabel(feature, preview);
                      persistCurrentSession(newEntityId, label);
                      onAcceptAI?.(preview);
                    }}
                    className="ml-auto gap-1.5"
                  >
                    {FEATURE_CTA[feature]}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="m-0 h-full data-[state=inactive]:hidden">
            <ManualPanel
              feature={feature}
              onDone={() => {
                onManualSubmitSuccess?.();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
              onOpenManual={() => {
                onOpenChange(false);
                onOpenManual?.();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PreviewRenderer({
  feature,
  preview,
  isStreaming,
}: {
  feature: AssistantFeature;
  preview: AnyPreview;
  isStreaming: boolean;
}) {
  if (feature === 'agent') {
    return <AgentPreview state={preview as AgentPreviewState | null} isBuilding={isStreaming} />;
  }
  if (feature === 'journey') {
    return (
      <JourneyPreview state={preview as JourneyPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'contacts') {
    return (
      <ContactPreview state={preview as ContactPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'pipeline') {
    return (
      <PipelinePreview state={preview as PipelinePreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'products') {
    return (
      <ProductPreview state={preview as ProductPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'campaigns') {
    return (
      <CampaignPreview state={preview as CampaignPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'channels') {
    return (
      <ChannelPreview state={preview as ChannelPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'templates') {
    return (
      <TemplatePreview state={preview as TemplatePreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'customTool') {
    return (
      <CustomToolPreview state={preview as CustomToolPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'customMcp') {
    return (
      <CustomMcpPreview state={preview as CustomMcpPreviewState | null} isBuilding={isStreaming} />
    );
  }
  if (feature === 'segment') {
    return <SegmentPreview state={preview as SegmentPreviewState | null} isBuilding={isStreaming} />;
  }
  if (feature === 'macro') {
    return <MacroPreview state={preview as MacroPreviewState | null} isBuilding={isStreaming} />;
  }
  if (feature === 'role') {
    return <RolePreview state={preview as RolePreviewState | null} isBuilding={isStreaming} />;
  }
  // default automation
  return (
    <AutomationPreview
      state={preview as AutomationPreviewState | null}
      isBuilding={isStreaming}
    />
  );
}

function isReady(feature: AssistantFeature, preview: AnyPreview): boolean {
  if (!preview) return false;
  switch (feature) {
    case 'agent': {
      const p = preview as AgentPreviewState;
      return Boolean(
        p.name && p.role && p.model && p.completedSections.includes('configuration'),
      );
    }
    case 'journey': {
      const p = preview as JourneyPreviewState;
      return Boolean(p.name && p.triggerSummary && p.nodes.length > 0);
    }
    case 'contacts': {
      const p = preview as ContactPreviewState;
      return Boolean((p.firstName || p.lastName) && (p.email || p.phone));
    }
    case 'pipeline': {
      const p = preview as PipelinePreviewState;
      return Boolean(p.name && p.stages.length > 0);
    }
    case 'products': {
      const p = preview as ProductPreviewState;
      return Boolean(p.name && p.sku && p.price > 0);
    }
    case 'campaigns': {
      const p = preview as CampaignPreviewState;
      return Boolean(p.name && p.audienceLabel && p.templates.length > 0);
    }
    case 'channels': {
      const p = preview as ChannelPreviewState;
      return Boolean(p.name && p.provider && p.rationale);
    }
    case 'templates': {
      const p = preview as TemplatePreviewState;
      return Boolean(p.name && p.content);
    }
    case 'customTool': {
      const p = preview as CustomToolPreviewState;
      return Boolean(p.name && p.path && p.method);
    }
    case 'customMcp': {
      const p = preview as CustomMcpPreviewState;
      return Boolean(p.name && p.url && p.exposedTools.length > 0);
    }
    case 'segment': {
      const p = preview as SegmentPreviewState;
      return Boolean(p.name && p.rules.length > 0);
    }
    case 'macro': {
      const p = preview as MacroPreviewState;
      return Boolean(p.name && p.actions.length > 0);
    }
    case 'role': {
      const p = preview as RolePreviewState;
      return Boolean(p.name && p.permissions.length > 0);
    }
    default: {
      const p = preview as AutomationPreviewState;
      return Boolean(p.name && p.event && p.actions.length > 0);
    }
  }
}

function ChatEmpty({
  feature,
  templates,
  onPickTemplate,
}: {
  feature: AssistantFeature;
  templates: AssistantTemplate[];
  onPickTemplate: (t: AssistantTemplate) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        O que você quer {FEATURE_LABEL[feature]}?
      </h3>
      <p className="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
        Descreva em texto livre — a IA configura tudo e mostra um preview ao
        lado para você revisar antes de criar.
      </p>

      <div className="mt-7 w-full max-w-md">
        <TemplateGrid
          title="Ou comece por um template"
          templates={templates}
          onPick={onPickTemplate}
          columns={1}
        />
      </div>
    </div>
  );
}

function ManualPanel({
  feature,
  onDone,
  onCancel,
  onOpenManual,
}: {
  feature: AssistantFeature;
  onDone: () => void;
  onCancel: () => void;
  onOpenManual: () => void;
}) {
  // Embedded total — caem dentro do dialog sem refator
  if (feature === 'agent') {
    return (
      <div className="h-full min-h-0">
        <AgentWizardModal
          embedded
          open={true}
          onOpenChange={(o) => {
            if (!o) onCancel();
          }}
          onAgentCreated={onDone}
        />
      </div>
    );
  }

  if (feature === 'journey') {
    return (
      <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-md">
          <JourneyManualForm onSubmitSuccess={onDone} onCancel={onCancel} />
        </div>
      </div>
    );
  }

  if (feature === 'automation') {
    return (
      <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <AutomationForm mode="create" embedded onSubmitSuccess={onDone} onCancel={onCancel} />
        </div>
      </div>
    );
  }

  // Bridge — abre o modal/rota manual nativo
  return <ManualBridge feature={feature} onCancel={onCancel} onOpenManual={onOpenManual} />;
}

function ManualBridge({
  feature,
  onCancel,
  onOpenManual,
}: {
  feature: AssistantFeature;
  onCancel: () => void;
  onOpenManual: () => void;
}) {
  const copy: Record<
    AssistantFeature,
    { title: string; description: string; cta: string }
  > = {
    automation: { title: '', description: '', cta: '' },
    agent: { title: '', description: '', cta: '' },
    journey: { title: '', description: '', cta: '' },
    contacts: {
      title: 'Cadastro manual',
      description:
        'Abre o formulário completo de contato — com avatar, telefone, empresa, redes sociais, atributos customizados e mais.',
      cta: 'Abrir formulário de contato',
    },
    pipeline: {
      title: 'Cadastro manual',
      description:
        'Abre o construtor de pipeline com escolha de tipo, visibilidade e edição inline das etapas.',
      cta: 'Abrir construtor de pipeline',
    },
    products: {
      title: 'Cadastro manual',
      description:
        'Abre o formulário completo de produto — informações básicas, variantes, imagens e mais.',
      cta: 'Abrir formulário de produto',
    },
    campaigns: {
      title: 'Wizard manual',
      description:
        'Abre o wizard de 5 passos: informações, audiência, conteúdo, agendamento e revisão.',
      cta: 'Abrir wizard de campanha',
    },
    channels: {
      title: 'Wizard de canal',
      description:
        'Abre a seleção de canal e configuração de provider passo a passo.',
      cta: 'Abrir wizard de canal',
    },
    templates: {
      title: 'Editor manual',
      description:
        'Abre o editor completo de template — nome, categoria, idioma, corpo da mensagem, variáveis e preview ao vivo.',
      cta: 'Abrir editor de template',
    },
    customTool: {
      title: 'Editor de Custom Tool',
      description:
        'Abre o editor completo — método, URL, params (path/query/body/header), auth e testes.',
      cta: 'Abrir editor de tool',
    },
    customMcp: {
      title: 'Editor de Custom MCP',
      description:
        'Abre o editor completo — URL do servidor MCP, headers de auth, timeout, retry e descoberta de tools.',
      cta: 'Abrir editor de MCP',
    },
    segment: {
      title: 'Editor manual de segmento',
      description: 'Abre o construtor com regras e contagem de matches.',
      cta: 'Abrir construtor',
    },
    macro: {
      title: 'Editor manual de macro',
      description: 'Abre o editor de ações em sequência.',
      cta: 'Abrir editor de macro',
    },
    role: {
      title: 'Editor manual de role',
      description: 'Abre o painel de permissões por recurso.',
      cta: 'Abrir editor de role',
    },
    general: { title: '', description: '', cta: '' },
  };
  const c = copy[feature];

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
        <Pencil className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{c.title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{c.description}</p>
      <div className="mt-6 flex items-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onOpenManual} className="gap-1.5">
          {c.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/**
 * SKYWAY — extrai um label humano da entidade no preview pra usar no botão de
 * retomar conversa depois.
 */
function extractEntityLabel(feature: AssistantFeature, preview: AnyPreview): string {
  if (!preview) return '';
  const p = preview as unknown as Record<string, unknown>;
  if (feature === 'contacts') {
    const first = (p.firstName as string) ?? '';
    const last = (p.lastName as string) ?? '';
    return `${first} ${last}`.trim() || 'Contato';
  }
  if (typeof p.name === 'string') return p.name;
  if (typeof p.title === 'string') return p.title;
  return feature;
}
