import { useRef, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { ChevronRight, History, MessageSquare, Sparkles } from 'lucide-react';
import { AIComposer } from '@/components/aiAssistant/AIComposer';
import { ChatMessages } from '@/components/aiAssistant/ChatMessages';
import { TemplateGrid } from '@/components/aiAssistant/TemplateGrid';
import {
  type ChatMessage,
  type StreamHandle,
  getTemplates,
  newMessage,
  streamAssistantReply,
} from '@/services/aiAssistant/mockAssistant';

const SUGGESTED_PROMPTS = [
  {
    icon: 'sparkles' as const,
    text: 'Quais itens urgentes precisam da minha atenção agora?',
  },
  {
    icon: 'target' as const,
    text: 'Prepare-me para minhas próximas reuniões.',
  },
  {
    icon: 'inbox' as const,
    text: 'Quais conversas de hoje ainda preciso responder?',
  },
];

const RECENT_CHATS = [
  'Configurar automação de boas-vindas',
  'Resumo do funil de vendas B2B',
  'Reengajar clientes inativos',
];

export default function AssistantHome() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const streamRef = useRef<StreamHandle | null>(null);

  const isStreaming = streamingText !== null;
  const isEmpty = messages.length === 0 && !isStreaming;

  const send = (text: string) => {
    if (streamRef.current) streamRef.current.cancel();

    setMessages((prev) => [...prev, newMessage('user', text)]);
    setStreamingText('');

    let acc = '';
    streamRef.current = streamAssistantReply(text, 'general', {
      onToken: (tok) => {
        acc += tok;
        setStreamingText(acc);
      },
      onDone: (full) => {
        setMessages((prev) => [...prev, newMessage('assistant', full)]);
        setStreamingText(null);
        streamRef.current = null;
      },
    });
  };

  const stop = () => {
    streamRef.current?.cancel();
    if (streamingText !== null) {
      setMessages((prev) => [...prev, newMessage('assistant', streamingText)]);
      setStreamingText(null);
    }
  };

  const reset = () => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setMessages([]);
    setStreamingText(null);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Coluna lateral de chats recentes (opcional) */}
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
                <button
                  className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
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
        {isEmpty ? (
          <HomeHero onSend={send} />
        ) : (
          <>
            <ChatMessages
              messages={messages}
              streamingText={streamingText ?? undefined}
            />
            <div className="border-t border-border bg-background/80 backdrop-blur px-4 py-3">
              <div className="mx-auto max-w-2xl">
                <AIComposer
                  placeholder="Pergunte qualquer coisa..."
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

function HomeHero({ onSend }: { onSend: (text: string) => void }) {
  const generalTemplates = getTemplates('general');

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      {/* Background ambiente */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
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
          </div>

          <AIComposer
            placeholder="Pergunte qualquer coisa..."
            onSubmit={onSend}
            autoFocus
            variant="hero"
          />

          {/* Sugestões */}
          <div className="mt-6 space-y-2">
            {SUGGESTED_PROMPTS.map((s) => (
              <button
                key={s.text}
                onClick={() => onSend(s.text)}
                className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 text-left text-sm text-foreground hover:bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span>{s.text}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Templates */}
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
