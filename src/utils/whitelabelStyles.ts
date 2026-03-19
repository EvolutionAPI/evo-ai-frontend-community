import { cn } from './cn';

/**
 * Retorna as classes CSS para botões primários usando variáveis CSS do whitelabel
 * Com fallback para cores padrão caso o whitelabel não esteja habilitado
 */
export function getPrimaryButtonClasses(additionalClasses?: string): string {
  return cn(
    'bg-[var(--primary,#00ffa7)]',
    'hover:bg-[color-mix(in_srgb,var(--primary,#00ffa7)_85%,black)]',
    'text-[var(--primary-foreground,#000000)]',
    'border-0',
    'font-semibold',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para bubbles de mensagem usando variáveis CSS do whitelabel
 * Com fallback para cores padrão caso o whitelabel não esteja habilitado
 */
export function getMessageBubbleClasses(additionalClasses?: string): string {
  return cn(
    'bg-[var(--primary,#00ffa7)]',
    'text-[var(--primary-foreground,#000000)]',
    'hover:bg-[color-mix(in_srgb,var(--primary,#00ffa7)_85%,black)]',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para badge de agente usando variáveis CSS do whitelabel
 * Otimizado para melhor legibilidade em light e dark mode
 */
export function getAgentBadgeClasses(additionalClasses?: string): string {
  return cn(
    'h-4 px-1 text-[10px] font-medium',
    'bg-[var(--primary,#00ffa7)]/10',
    'text-[var(--primary,#00ffa7)]',
    'border border-[var(--primary,#00ffa7)]/30',
    'dark:bg-[var(--primary,#00ffa7)]/20',
    'dark:text-[var(--primary,#00ffa7)]',
    'dark:border-[var(--primary,#00ffa7)]/50',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para badge de usuário atribuído usando variáveis CSS do whitelabel
 * Otimizado para melhor legibilidade em light e dark mode
 */
export function getAssigneeBadgeClasses(additionalClasses?: string): string {
  return cn(
    'flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium',
    'bg-[var(--primary,#00ffa7)]/10',
    'dark:bg-[var(--primary,#00ffa7)]/20',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para ícone de usuário atribuído usando variáveis CSS do whitelabel
 */
export function getAssigneeIconClasses(additionalClasses?: string): string {
  return cn(
    'h-3 w-3 flex-shrink-0',
    'text-[var(--primary,#00ffa7)]',
    'dark:text-[var(--primary,#00ffa7)]',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para texto de usuário atribuído usando variáveis CSS do whitelabel
 */
export function getAssigneeTextClasses(additionalClasses?: string): string {
  return cn(
    'truncate max-w-32',
    'text-[var(--primary,#00ffa7)]',
    'dark:text-[var(--primary,#00ffa7)]/90',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para botão de ação primária (enviar, gravar áudio, etc)
 * usando variáveis CSS do whitelabel
 */
export function getPrimaryActionButtonClasses(additionalClasses?: string): string {
  return cn(
    'bg-[var(--primary,#00ffa7)]',
    'hover:bg-[color-mix(in_srgb,var(--primary,#00ffa7)_85%,black)]',
    'text-[var(--primary-foreground,#000000)]',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para preview de reply em mensagens próprias
 * usando variáveis CSS do whitelabel, otimizado para dark mode
 */
export function getReplyPreviewOwnClasses(additionalClasses?: string): string {
  return cn(
    'bg-[var(--primary,#00ffa7)]/20',
    'dark:bg-[var(--primary,#00ffa7)]/15',
    'text-white',
    'dark:text-white/90',
    'border-l-2',
    'border-[var(--primary,#00ffa7)]/40',
    'dark:border-[var(--primary,#00ffa7)]/50',
    additionalClasses
  );
}

/**
 * Retorna as classes CSS para preview de reply em mensagens recebidas
 * usando variáveis CSS do whitelabel, otimizado para dark mode
 */
export function getReplyPreviewReceivedClasses(additionalClasses?: string): string {
  return cn(
    'bg-slate-50',
    'dark:bg-slate-800/60',
    'text-slate-700',
    'dark:text-slate-200',
    'border-l-2',
    'border-slate-300',
    'dark:border-slate-600',
    additionalClasses
  );
}
