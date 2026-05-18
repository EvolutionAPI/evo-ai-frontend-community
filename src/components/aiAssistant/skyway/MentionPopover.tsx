import { useEffect, useMemo, useRef, useState } from 'react';
import { GitBranch, MessageCircle, Megaphone, Target, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { searchMentions, type MentionRef, type MentionRefType } from '@/services/aiAssistant/mockAssistant';

interface Props {
  query: string;
  onSelect: (ref: MentionRef) => void;
  onClose: () => void;
}

const TYPE_META: Record<MentionRefType, { label: string; icon: LucideIcon; tone: string }> = {
  contato: { label: 'Contato', icon: User, tone: 'text-violet-300' },
  deal: { label: 'Deal', icon: Target, tone: 'text-emerald-300' },
  pipeline: { label: 'Pipeline', icon: GitBranch, tone: 'text-sky-300' },
  conversa: { label: 'Conversa', icon: MessageCircle, tone: 'text-amber-300' },
  campanha: { label: 'Campanha', icon: Megaphone, tone: 'text-rose-300' },
};

export function MentionPopover({ query, onSelect, onClose }: Props) {
  const [highlightIdx, setHighlightIdx] = useState(0);
  const results = useMemo(() => searchMentions(query), [query]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[highlightIdx]) onSelect(results[highlightIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, highlightIdx, onSelect, onClose]);

  if (results.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg shadow-black/40 z-50 animate-fadeIn"
    >
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {query ? `Resultados para "${query}"` : 'Anexar contexto'}
        </p>
      </div>
      <div className="py-1">
        {results.map((m, idx) => {
          const meta = TYPE_META[m.type];
          const Icon = meta.icon;
          const highlighted = idx === highlightIdx;
          return (
            <button
              key={`${m.type}-${m.id}`}
              type="button"
              onMouseEnter={() => setHighlightIdx(idx)}
              onClick={() => onSelect(m)}
              className={[
                'flex w-full items-start gap-3 px-3 py-2 text-left transition-colors',
                highlighted ? 'bg-primary/10' : 'hover:bg-muted/40',
              ].join(' ')}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-border ${meta.tone}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {meta.label}
                </span>
                <span className="block text-sm text-foreground truncate">{m.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        ↑↓ navegar · ↵ selecionar · esc fechar
      </div>
    </div>
  );
}
