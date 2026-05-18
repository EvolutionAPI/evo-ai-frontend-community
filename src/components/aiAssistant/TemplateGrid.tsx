import {
  Bot,
  Calendar,
  Headphones,
  Inbox,
  Megaphone,
  Rocket,
  Route,
  ShoppingBag,
  Sparkles,
  Tag,
  Target,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssistantTemplate } from '@/services/aiAssistant/mockAssistant';

const ICONS: Record<AssistantTemplate['icon'], LucideIcon> = {
  sparkles: Sparkles,
  rocket: Rocket,
  target: Target,
  inbox: Inbox,
  tag: Tag,
  megaphone: Megaphone,
  route: Route,
  workflow: Workflow,
  bot: Bot,
  headphones: Headphones,
  calendar: Calendar,
  shoppingBag: ShoppingBag,
};

const TONES = [
  { bg: 'bg-violet-500/10', text: 'text-violet-400', ring: 'ring-violet-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  { bg: 'bg-sky-500/10', text: 'text-sky-400', ring: 'ring-sky-500/20' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', ring: 'ring-rose-500/20' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', ring: 'ring-cyan-500/20' },
];

interface Props {
  title?: string;
  templates: AssistantTemplate[];
  onPick: (template: AssistantTemplate) => void;
  columns?: 1 | 2 | 3;
}

export function TemplateGrid({ title, templates, onPick, columns = 2 }: Props) {
  if (templates.length === 0) return null;
  const colsClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div>
      {title && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className={`grid gap-2 ${colsClass}`}>
        {templates.map((tpl, idx) => {
          const Icon = ICONS[tpl.icon] ?? Sparkles;
          const tone = TONES[idx % TONES.length];
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onPick(tpl)}
              className={[
                'group flex min-h-12 items-start gap-3 rounded-xl border border-border bg-card/40 p-3 text-left',
                'hover:bg-card hover:border-primary/30 hover:-translate-y-px',
                'transition-all duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              ].join(' ')}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.bg} ${tone.text} ring-1 ${tone.ring}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">
                  {tpl.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                  {tpl.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
