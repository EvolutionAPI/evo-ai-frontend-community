import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import type { ChatMessage } from '@/services/aiAssistant/mockAssistant';

interface Props {
  messages: ChatMessage[];
  /** Texto da bolha do assistente em streaming agora (não persistido em messages ainda) */
  streamingText?: string;
  emptyState?: React.ReactNode;
}

export function ChatMessages({ messages, streamingText, emptyState }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streamingText]);

  if (messages.length === 0 && !streamingText && emptyState) {
    return <div className="flex-1 overflow-y-auto">{emptyState}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {streamingText !== undefined && <StreamingBubble text={streamingText} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fadeIn">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 pt-0.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
      </div>
      <div className="flex-1 pt-0.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {text}
        {text.length === 0 ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
          </span>
        ) : (
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-primary/80 animate-pulse" />
        )}
      </div>
    </div>
  );
}
