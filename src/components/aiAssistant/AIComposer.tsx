import { useEffect, useRef, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { ArrowUp, Mic, Paperclip, Square } from 'lucide-react';

interface Props {
  placeholder?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  onSubmit: (text: string) => void;
  onStop?: () => void;
  autoFocus?: boolean;
  variant?: 'hero' | 'compact';
}

export function AIComposer({
  placeholder = 'Pergunte qualquer coisa...',
  disabled = false,
  isStreaming = false,
  onSubmit,
  onStop,
  autoFocus = false,
  variant = 'compact',
}: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, variant === 'hero' ? 200 : 160)}px`;
  }, [text, variant]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSubmit(trimmed);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className={[
        'group relative rounded-2xl border border-border bg-card/60 backdrop-blur',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)]',
        'transition-all duration-200',
        'focus-within:border-primary/50 focus-within:bg-card/80',
        variant === 'hero' ? 'p-4' : 'p-3',
      ].join(' ')}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Mensagem para o assistente"
        className={[
          'block w-full resize-none bg-transparent outline-none',
          'text-foreground placeholder:text-muted-foreground/70',
          variant === 'hero' ? 'text-[15px] leading-6 min-h-[28px]' : 'text-sm leading-5 min-h-[24px]',
        ].join(' ')}
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-muted hover:text-foreground"
            aria-label="Anexar arquivo"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-muted hover:text-foreground"
            aria-label="Gravar voz"
            disabled={disabled}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            onClick={onStop}
            className="h-10 w-10 rounded-full bg-muted text-foreground hover:bg-muted/80"
            aria-label="Parar geração"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={send}
            disabled={disabled || !text.trim()}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Enviar"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
