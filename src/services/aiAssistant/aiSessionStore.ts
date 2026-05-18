/**
 * SKYWAY — armazenamento local de sessões IA por entidade.
 *
 * Permite que o usuário criar um pipeline (ou qualquer entidade) via IA,
 * fechar o dialog, e mais tarde reabrir clicando em "Continuar com IA"
 * na tela de edição. A conversa volta exatamente onde parou: mensagens,
 * plans, receipts, autonomy, mode.
 *
 * No futuro (Skyway real), isso vai ser persistido no processor
 * (sessions tabela com `entity_ref` indexável). Aqui é mock localStorage.
 */

import type {
  AutonomyLevel,
  ChatMessage,
  ChatMode,
  SkywayInlineForm,
  SkywayPlan,
  SkywayReceipt,
} from './mockAssistant';

export interface PersistedSkywayEvent {
  kind: 'thinking' | 'plan' | 'receipt' | 'inline_form';
  id: string;
  // Campos específicos por kind (descriminamos no runtime)
  text?: string;
  active?: boolean;
  plan?: SkywayPlan;
  approved?: boolean;
  receipt?: SkywayReceipt;
  undone?: boolean;
  form?: SkywayInlineForm;
  submitted?: boolean;
}

export interface PersistedSession {
  sessionKey: string;
  entityType: string; // "pipeline" | "agent" | "automation" | ...
  entityId: string;
  entityLabel: string; // ex: "Funil de Vendas B2B" — pro botão de retomar
  feature: string; // pra abrir o dialog certo
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  events: PersistedSkywayEvent[];
  autonomy: AutonomyLevel;
  mode: ChatMode;
}

const STORAGE_KEY = 'evo-skyway-sessions-v1';

function readAll(): Record<string, PersistedSession> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PersistedSession>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, PersistedSession>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded ou similar — ignora silenciosamente no mock
  }
}

export function buildSessionKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

export function saveSession(session: PersistedSession): void {
  const all = readAll();
  all[session.sessionKey] = { ...session, updatedAt: Date.now() };
  writeAll(all);
}

export function loadSession(sessionKey: string): PersistedSession | null {
  return readAll()[sessionKey] ?? null;
}

export function deleteSession(sessionKey: string): void {
  const all = readAll();
  delete all[sessionKey];
  writeAll(all);
}

/** Retorna sessões ordenadas por updatedAt desc */
export function listSessions(): PersistedSession[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Verifica se há sessão pra uma entidade */
export function hasSessionFor(entityType: string, entityId: string): boolean {
  return loadSession(buildSessionKey(entityType, entityId)) !== null;
}

/** Limpa todas as sessões (útil pra demo reset) */
export function clearAllSessions(): void {
  writeAll({});
}
