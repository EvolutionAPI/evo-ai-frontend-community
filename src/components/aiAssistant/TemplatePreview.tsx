import { useState } from 'react';
import {
  Check,
  Code2,
  Eye,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  TemplateCategory,
  TemplateChannelType,
  TemplatePreviewState,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: TemplatePreviewState | null;
  isBuilding?: boolean;
}

const CHANNEL_META: Record<
  TemplateChannelType,
  { icon: LucideIcon; label: string; tone: string; bubble: string }
> = {
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    tone: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    bubble: 'bg-emerald-500/15 text-foreground',
  },
  email: {
    icon: Mail,
    label: 'Email',
    tone: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
    bubble: 'bg-card text-foreground',
  },
  sms: {
    icon: Phone,
    label: 'SMS',
    tone: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    bubble: 'bg-muted text-foreground',
  },
  generic: {
    icon: FileText,
    label: 'Genérico',
    tone: 'bg-muted text-muted-foreground ring-border',
    bubble: 'bg-card text-foreground',
  },
};

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  MARKETING: 'Marketing',
  UTILITY: 'Utilidade',
  AUTHENTICATION: 'Autenticação',
  OTHER: 'Outros',
};

const CATEGORY_TONE: Record<TemplateCategory, string> = {
  MARKETING: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  UTILITY: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
  AUTHENTICATION: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  OTHER: 'bg-muted text-muted-foreground ring-border',
};

export function TemplatePreview({ state, isBuilding = false }: Props) {
  const [renderMode, setRenderMode] = useState<'rendered' | 'raw'>('rendered');

  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do template</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva a mensagem que você quer. A IA escreve, detecta variáveis e
          mostra a prévia já preenchida com exemplos.
        </p>
      </div>
    );
  }

  const channel = CHANNEL_META[state.channel];
  const ChannelIcon = channel.icon;
  const ready = Boolean(state.name && state.content);

  const displayContent = renderMode === 'rendered' ? state.contentRendered : state.content;
  const displaySubject =
    state.emailSubject &&
    (renderMode === 'rendered'
      ? state.variables.reduce(
          (acc, v) =>
            acc.replace(new RegExp(`{{\\s*${v.name}\\s*}}`, 'g'), v.example),
          state.emailSubject,
        )
      : state.emailSubject);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`}
            />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA escrevendo template...' : ready ? 'Pronto para salvar' : 'Rascunho'}
          </span>
        </div>
        <h3 className="mt-1 font-mono text-sm font-semibold text-foreground">
          {state.name || (
            <span className="text-muted-foreground italic font-normal font-sans">
              Aguardando nome...
            </span>
          )}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${channel.tone}`}
          >
            <ChannelIcon className="h-3 w-3" />
            {channel.label}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${CATEGORY_TONE[state.category]}`}
          >
            {CATEGORY_LABEL[state.category]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            {state.language}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4">
        {/* Toggle entre raw e renderizado */}
        {state.variables.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card/30 p-1">
            <button
              type="button"
              onClick={() => setRenderMode('rendered')}
              className={[
                'flex-1 h-8 rounded-md px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
                renderMode === 'rendered'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Eye className="h-3 w-3" />
              Com exemplos
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('raw')}
              className={[
                'flex-1 h-8 rounded-md px-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
                renderMode === 'raw'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Code2 className="h-3 w-3" />
              Variáveis cruas
            </button>
          </div>
        )}

        {/* Email subject */}
        {state.channel === 'email' && displaySubject && (
          <div className="rounded-xl border border-border bg-card/40 p-3 animate-fadeIn">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Assunto
            </p>
            <p className="text-sm font-medium text-foreground">{displaySubject}</p>
          </div>
        )}

        {/* Conteúdo — bolha de mensagem */}
        <div className="animate-fadeIn">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Prévia da mensagem
          </p>
          {displayContent ? (
            <div
              className={[
                'rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                channel.bubble,
                renderMode === 'raw' ? 'font-mono text-xs' : '',
              ].join(' ')}
            >
              {renderMode === 'raw' ? (
                <HighlightVariables text={displayContent} />
              ) : (
                displayContent
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs italic text-muted-foreground">
              {isBuilding ? 'Escrevendo...' : 'Aguardando conteúdo'}
            </div>
          )}
        </div>

        {/* Variáveis */}
        {state.variables.length > 0 && (
          <div className="animate-fadeIn">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Variáveis detectadas ({state.variables.length})
            </p>
            <div className="space-y-1.5">
              {state.variables.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2"
                >
                  <Tag className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                  <span className="font-mono text-xs text-violet-300">
                    {`{{${v.name}}}`}
                  </span>
                  <span className="text-xs text-muted-foreground">exemplo:</span>
                  <span className="text-xs font-medium text-foreground truncate">
                    {v.example}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ready && !isBuilding && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                Template pronto. Pode salvar.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightVariables({ text }: { text: string }) {
  const parts = text.split(/(\{\{\s*\w+\s*\}\})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\{\{\s*\w+\s*\}\}$/.test(part) ? (
          <span
            key={i}
            className="rounded bg-violet-500/20 px-1 py-0.5 text-violet-300"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
