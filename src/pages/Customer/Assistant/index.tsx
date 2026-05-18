import { useEffect, useRef, useState } from 'react';
import { Button } from '@evoapi/design-system';
import {
  ChevronRight,
  CircleSlash,
  History,
  Info,
  MessageSquare,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { TemplateGrid } from '@/components/aiAssistant/TemplateGrid';
import {
  AutonomySlider,
  InlineFormBubble,
  MentionPopover,
  SkywayPlanCard,
  SkywayReceiptCard,
  ThinkingLine,
} from '@/components/aiAssistant/skyway';
import {
  type AutonomyLevel,
  type ChatMessage,
  type ChatMode,
  type MentionRef,
  type SkywayInlineForm,
  type SkywayPlan,
  type SkywayReceipt,
  type StreamHandle,
  approvePlan,
  getTemplates,
  newMessage,
  streamAssistantReply,
  submitInlineForm,
} from '@/services/aiAssistant/mockAssistant';

const SUGGESTED_PROMPTS = [
  {
    icon: 'sparkles' as const,
    text: 'Quais conversas de hoje ainda preciso responder?',
    hint: 'demo: thinking',
  },
  {
    icon: 'target' as const,
    text: 'Manda um follow-up amigável para todos os contatos parados há 3 dias',
    hint: 'demo: plan + autonomy + receipt',
  },
  {
    icon: 'inbox' as const,
    text: 'Agendar reunião com a Carolina',
    hint: 'demo: inline form',
  },
];

const RECENT_CHATS = [
  'Configurar automação de boas-vindas',
  'Resumo do funil de vendas B2B',
  'Reengajar clientes inativos',
];

// Cada turno do chat pode ser um destes tipos
type TurnPart =
  | { kind: 'message'; message: ChatMessage }
  | { kind: 'thinking'; id: string; text: string; active: boolean }
  | { kind: 'plan'; id: string; plan: SkywayPlan; approved: boolean }
  | { kind: 'receipt'; id: string; receipt: SkywayReceipt; undone: boolean }
  | { kind: 'inline_form'; id: string; form: SkywayInlineForm; submitted: boolean };

export default function AssistantHome() {
  const [parts, setParts] = useState<TurnPart[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('balanced');
  const [mode, setMode] = useState<ChatMode>('apply');
  const [mentions, setMentions] = useState<MentionRef[]>([]);
  const streamRef = useRef<StreamHandle | null>(null);

  const isStreaming = streamingText !== null;
  const isEmpty = parts.length === 0 && !isStreaming;

  const pushPart = (p: TurnPart) => setParts((prev) => [...prev, p]);
  const updatePart = (id: string, fn: (p: TurnPart) => TurnPart) =>
    setParts((prev) => prev.map((p) => ('id' in p && p.id === id ? fn(p) : p)));

  const send = (text: string, extraMentions: MentionRef[] = []) => {
    if (streamRef.current) streamRef.current.cancel();

    const combinedMentions = [...mentions, ...extraMentions];
    const displayText = combinedMentions.length
      ? `${combinedMentions.map((m) => `@${m.label}`).join(' ')}\n${text}`
      : text;

    pushPart({ kind: 'message', message: newMessage('user', displayText) });
    setStreamingText('');
    setMentions([]);

    let acc = '';
    streamRef.current = streamAssistantReply(
      text,
      'general',
      {
        onToken: (tok) => {
          acc += tok;
          setStreamingText(acc);
        },
        onThinking: (t) => {
          // Desativa thinking anterior
          setParts((prev) =>
            prev.map((p) => (p.kind === 'thinking' && p.active ? { ...p, active: false } : p)),
          );
          pushPart({ kind: 'thinking', id: `thinking-${Date.now()}-${Math.random()}`, text: t, active: true });
        },
        onPlan: (plan) => {
          pushPart({ kind: 'plan', id: plan.id, plan, approved: false });
        },
        onInlineForm: (form) => {
          pushPart({ kind: 'inline_form', id: form.id, form, submitted: false });
        },
        onDone: (full) => {
          // Marca thinking ativo como concluído
          setParts((prev) => prev.map((p) => (p.kind === 'thinking' ? { ...p, active: false } : p)));
          if (full) {
            pushPart({ kind: 'message', message: newMessage('assistant', full) });
          }
          setStreamingText(null);
          streamRef.current = null;
        },
      },
      { mentions: combinedMentions, mode, autonomy },
    );
  };

  const handleApprovePlan = (planId: string, approvedStepIds: string[]) => {
    const planPart = parts.find((p): p is Extract<TurnPart, { kind: 'plan' }> =>
      p.kind === 'plan' && p.id === planId,
    );
    if (!planPart) return;

    updatePart(planId, (p) => ({ ...p, approved: true } as TurnPart));
    setStreamingText('');

    let acc = '';
    streamRef.current = approvePlan(planPart.plan, approvedStepIds, {
      onToken: (tok) => {
        acc += tok;
        setStreamingText(acc);
      },
      onThinking: (t) => {
        setParts((prev) =>
          prev.map((p) => (p.kind === 'thinking' && p.active ? { ...p, active: false } : p)),
        );
        pushPart({ kind: 'thinking', id: `thinking-${Date.now()}-${Math.random()}`, text: t, active: true });
      },
      onReceipt: (rcpt) => {
        pushPart({ kind: 'receipt', id: rcpt.id, receipt: rcpt, undone: false });
      },
      onDone: (full) => {
        setParts((prev) => prev.map((p) => (p.kind === 'thinking' ? { ...p, active: false } : p)));
        if (full) pushPart({ kind: 'message', message: newMessage('assistant', full) });
        setStreamingText(null);
        streamRef.current = null;
      },
    });
  };

  const handleUndoReceipt = (receiptId: string) => {
    updatePart(receiptId, (p) => ({ ...p, undone: true } as TurnPart));
    pushPart({
      kind: 'message',
      message: newMessage(
        'assistant',
        '↩️ Ações reversíveis foram desfeitas. Itens não reversíveis (como envios de mensagem) permanecem.',
      ),
    });
  };

  const handleInlineFormSubmit = (formId: string, values: Record<string, string>) => {
    const formPart = parts.find((p): p is Extract<TurnPart, { kind: 'inline_form' }> =>
      p.kind === 'inline_form' && p.id === formId,
    );
    if (!formPart) return;

    updatePart(formId, (p) => ({ ...p, submitted: true } as TurnPart));
    setStreamingText('');

    let acc = '';
    streamRef.current = submitInlineForm(formPart.form, values, {
      onToken: (tok) => {
        acc += tok;
        setStreamingText(acc);
      },
      onThinking: (t) => {
        setParts((prev) =>
          prev.map((p) => (p.kind === 'thinking' && p.active ? { ...p, active: false } : p)),
        );
        pushPart({ kind: 'thinking', id: `thinking-${Date.now()}-${Math.random()}`, text: t, active: true });
      },
      onReceipt: (rcpt) => {
        pushPart({ kind: 'receipt', id: rcpt.id, receipt: rcpt, undone: false });
      },
      onDone: (full) => {
        setParts((prev) => prev.map((p) => (p.kind === 'thinking' ? { ...p, active: false } : p)));
        if (full) pushPart({ kind: 'message', message: newMessage('assistant', full) });
        setStreamingText(null);
        streamRef.current = null;
      },
    });
  };

  const stop = () => {
    streamRef.current?.cancel();
    if (streamingText !== null && streamingText.length > 0) {
      pushPart({ kind: 'message', message: newMessage('assistant', streamingText) });
    }
    setStreamingText(null);
    setParts((prev) => prev.map((p) => (p.kind === 'thinking' ? { ...p, active: false } : p)));
  };

  const reset = () => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setParts([]);
    setStreamingText(null);
    setMentions([]);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar — chats recentes */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/30 xl:flex">
        <div className="px-4 py-4">
          <Button onClick={reset} className="w-full gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Nova conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recentes
          </p>
          <ul className="space-y-0.5">
            {RECENT_CHATS.map((c) => (
              <li key={c}>
                <button className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <History className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Skyway header */}
        <SkywayHeader
          mode={mode}
          onModeChange={setMode}
          autonomy={autonomy}
          onAutonomyChange={setAutonomy}
        />

        {isEmpty ? (
          <HomeHero onSend={(t) => send(t)} />
        ) : (
          <>
            <TurnsViewport
              parts={parts}
              streamingText={streamingText ?? undefined}
              onApprovePlan={handleApprovePlan}
              onUndoReceipt={handleUndoReceipt}
              onSubmitInlineForm={handleInlineFormSubmit}
            />
            <div className="border-t border-border bg-background/80 backdrop-blur px-4 py-3">
              <div className="mx-auto max-w-2xl">
                <SkywayComposer
                  mode={mode}
                  mentions={mentions}
                  onMentionsChange={setMentions}
                  onSubmit={send}
                  onStop={stop}
                  isStreaming={isStreaming}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HEADER — branding Skyway + Plan/Apply toggle + Autonomy slider
// =============================================================================

function SkywayHeader({
  mode,
  onModeChange,
  autonomy,
  onAutonomyChange,
}: {
  mode: ChatMode;
  onModeChange: (m: ChatMode) => void;
  autonomy: AutonomyLevel;
  onAutonomyChange: (a: AutonomyLevel) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-background/60 px-4 py-2 backdrop-blur">
      {/* Badge Skyway */}
      <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 ring-1 ring-primary/20">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Skyway
        </span>
      </div>

      {/* Mode toggle Plan / Apply */}
      <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
        <button
          type="button"
          onClick={() => onModeChange('plan')}
          className={[
            'h-7 px-2 rounded text-xs font-medium transition-all flex items-center gap-1.5',
            mode === 'plan'
              ? 'bg-card shadow-sm text-sky-300'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          title="Modo Planejar — IA descreve sem agir"
        >
          <CircleSlash className="h-3 w-3" />
          <span className="hidden sm:inline">Planejar</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('apply')}
          className={[
            'h-7 px-2 rounded text-xs font-medium transition-all flex items-center gap-1.5',
            mode === 'apply'
              ? 'bg-card shadow-sm text-emerald-300'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          title="Modo Aplicar — IA executa tools"
        >
          <Wand2 className="h-3 w-3" />
          <span className="hidden sm:inline">Aplicar</span>
        </button>
      </div>

      <div className="flex-1" />

      {/* Autonomy */}
      <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-muted-foreground">
        Autonomia:
      </span>
      <AutonomySlider value={autonomy} onChange={onAutonomyChange} />
    </div>
  );
}

// =============================================================================
// VIEWPORT DOS TURNOS — renderiza messages, thinking, plan, receipt, form
// =============================================================================

function TurnsViewport({
  parts,
  streamingText,
  onApprovePlan,
  onUndoReceipt,
  onSubmitInlineForm,
}: {
  parts: TurnPart[];
  streamingText?: string;
  onApprovePlan: (planId: string, approvedStepIds: string[]) => void;
  onUndoReceipt: (receiptId: string) => void;
  onSubmitInlineForm: (formId: string, values: Record<string, string>) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [parts, streamingText]);

  // Constrói lista de messages "tradicionais" pra reusar ChatMessages? Não — vou renderizar manual aqui pra controlar ordem.
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {parts.map((part) => {
          if (part.kind === 'message') {
            return <Bubble key={part.message.id} message={part.message} />;
          }
          if (part.kind === 'thinking') {
            return <ThinkingLine key={part.id} text={part.text} active={part.active} />;
          }
          if (part.kind === 'plan') {
            return (
              <SkywayPlanCard
                key={part.id}
                plan={part.plan}
                approved={part.approved}
                onApprove={(ids) => onApprovePlan(part.id, ids)}
              />
            );
          }
          if (part.kind === 'receipt') {
            return (
              <SkywayReceiptCard
                key={part.id}
                receipt={part.receipt}
                undone={part.undone}
                onUndo={() => onUndoReceipt(part.id)}
              />
            );
          }
          if (part.kind === 'inline_form') {
            return (
              <InlineFormBubble
                key={part.id}
                form={part.form}
                submitted={part.submitted}
                onSubmit={(vals) => onSubmitInlineForm(part.id, vals)}
              />
            );
          }
          return null;
        })}
        {streamingText !== undefined && streamingText.length > 0 && (
          <Bubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingText,
              createdAt: Date.now(),
            }}
            streaming
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function Bubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const isUser = message.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end animate-fadeIn">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Sparkles className={`h-3.5 w-3.5 ${streaming ? 'animate-pulse' : ''}`} />
      </div>
      <div className="flex-1 pt-0.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {message.content}
        {streaming && (
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-primary/80 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// COMPOSER COM @MENTIONS
// =============================================================================

function SkywayComposer({
  mode,
  mentions,
  onMentionsChange,
  onSubmit,
  onStop,
  isStreaming,
}: {
  mode: ChatMode;
  mentions: MentionRef[];
  onMentionsChange: (m: MentionRef[]) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}) {
  const [text, setText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);

    // Detectar @<query> em curso
    const cursor = e.target.selectionStart ?? v.length;
    const beforeCursor = v.slice(0, cursor);
    const match = beforeCursor.match(/@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const selectMention = (ref: MentionRef) => {
    if (!mentions.find((m) => m.type === ref.type && m.id === ref.id)) {
      onMentionsChange([...mentions, ref]);
    }
    // Remove o @query do texto
    setText((prev) => prev.replace(/@[^\s@]*$/, '').trimEnd() + ' ');
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const removeMention = (ref: MentionRef) => {
    onMentionsChange(mentions.filter((m) => !(m.type === ref.type && m.id === ref.id)));
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSubmit(trimmed);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative">
      {mentionQuery !== null && (
        <MentionPopover
          query={mentionQuery}
          onSelect={selectMention}
          onClose={() => setMentionQuery(null)}
        />
      )}

      <div
        className={[
          'rounded-2xl border bg-card/60 p-3 backdrop-blur transition-all',
          mode === 'plan'
            ? 'border-sky-500/40 shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
            : 'border-border',
          'focus-within:border-primary/50',
        ].join(' ')}
      >
        {/* Chips de mentions */}
        {mentions.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {mentions.map((m) => (
              <span
                key={`${m.type}-${m.id}`}
                className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/30"
              >
                @{m.label}
                <button
                  type="button"
                  onClick={() => removeMention(m)}
                  className="hover:text-primary/80"
                  aria-label={`Remover ${m.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={
            mode === 'plan'
              ? 'Modo Planejar — descreva o que quer e a IA explica sem executar...'
              : 'Pergunte qualquer coisa ou digite @ para anexar contexto...'
          }
          disabled={isStreaming}
          rows={1}
          className="block w-full resize-none bg-transparent outline-none text-sm leading-5 text-foreground placeholder:text-muted-foreground/70 min-h-[24px]"
        />

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Info className="h-3 w-3" />
            <span className="hidden sm:inline">
              Digite <kbd className="rounded bg-muted px-1 py-px font-mono text-[9px]">@</kbd> para anexar contato/deal/pipeline · {mode === 'plan' ? 'IA não executará tools' : 'IA pode executar ações'}
            </span>
          </div>
          {isStreaming ? (
            <Button size="sm" variant="outline" onClick={onStop} className="h-8">
              Parar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={send}
              disabled={!text.trim()}
              className="h-8 gap-1"
            >
              {mode === 'plan' ? 'Planejar' : 'Enviar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HERO — tela inicial vazia
// =============================================================================

function HomeHero({ onSend }: { onSend: (text: string) => void }) {
  const generalTemplates = getTemplates('general');

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[40vh] w-[90%] max-w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -right-10 top-20 h-[260px] w-[260px] rounded-full bg-violet-500/10 blur-[100px] sm:right-10 sm:h-[300px] sm:w-[300px]" />
          <div className="absolute -left-10 bottom-10 h-[220px] w-[220px] rounded-full bg-emerald-500/10 blur-[100px] sm:left-10 sm:h-[260px] sm:w-[260px]" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Como posso ajudar?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pergunte sobre seus contatos, conversas, automações ou peça para
              eu criar algo para você.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Powered by <span className="font-semibold text-primary">Skyway</span> — clique nas sugestões abaixo pra ver cada padrão IA em ação
            </p>
          </div>

          <SkywayComposerLite onSend={onSend} />

          <div className="mt-6 space-y-2">
            {SUGGESTED_PROMPTS.map((s) => (
              <button
                key={s.text}
                onClick={() => onSend(s.text)}
                className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 text-left text-sm text-foreground hover:bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="flex flex-col items-start text-left">
                    <span>{s.text}</span>
                    <span className="text-[10px] text-muted-foreground">{s.hint}</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="mt-10">
            <TemplateGrid
              title="Ou comece com um template"
              templates={generalTemplates}
              onPick={(t) => onSend(t.prompt)}
              columns={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Versão simplificada do composer pro Hero (sem mentions activas)
function SkywayComposerLite({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur focus-within:border-primary/50 transition-all">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
              onSend(text.trim());
              setText('');
            }
          }
        }}
        rows={1}
        placeholder="Pergunte qualquer coisa..."
        className="block w-full resize-none bg-transparent text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/70 min-h-[28px]"
      />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            if (text.trim()) {
              onSend(text.trim());
              setText('');
            }
          }}
          disabled={!text.trim()}
          className="h-8 gap-1.5"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}
