import { format, fromUnixTime, isToday, isYesterday, isThisYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Normaliza created_at (API/WebSocket) para Unix timestamp em segundos.
 * Evita "21 Jan 1970" quando o backend envia segundos como string (new Date("1739...") interpreta como ms).
 */
export function normalizeToUnixSeconds(
  value: number | string | null | undefined,
): number {
  if (value == null || value === '') {
    return Math.floor(Date.now() / 1000);
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value) || value <= 0) return Math.floor(Date.now() / 1000);
    // Número >= 1e12 é milissegundos; senão segundos
    return value >= 1e12 ? Math.floor(value / 1000) : value;
  }
  const str = String(value).trim();
  if (/^\d+$/.test(str)) {
    const n = parseInt(str, 10);
    if (n <= 0) return Math.floor(Date.now() / 1000);
    return n >= 1e12 ? Math.floor(n / 1000) : n;
  }
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) return Math.floor(Date.now() / 1000);
  return Math.floor(ms / 1000);
}

/**
 * Formata um timestamp Unix para exibir horário de forma inteligente
 * Baseado no padrão Evolution, mas com lógica brasileira
 */
export const formatConversationTime = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) {
    return 'Agora';
  }

  const date = fromUnixTime(timestamp);
  // const now = new Date();

  // Se é hoje: mostra apenas o horário (14:30)
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ptBR });
  }

  // Se foi ontem: "Ontem"
  if (isYesterday(date)) {
    return 'Ontem';
  }

  // Se é deste ano: mostra dia e mês (15 Jan)
  if (isThisYear(date)) {
    return format(date, 'dd MMM', { locale: ptBR });
  }

  // Se é de outro ano: mostra ano também (15 Jan 2023)
  return format(date, 'dd MMM yyyy', { locale: ptBR });
};

/**
 * Formata timestamp para tooltip com informações completas
 */
export const formatDetailedTime = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) {
    return 'Data inválida';
  }

  const date = fromUnixTime(timestamp);
  return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Formata horário de mensagem (mais específico que conversação)
 * Aceita tanto Unix timestamp quanto string de data
 */
export const formatMessageTime = (timestamp: number | string): string => {
  if (!timestamp) {
    return '';
  }

  let date: Date;

  if (typeof timestamp === 'string') {
    // Se é string, pode ser ISO string ou Unix timestamp em string
    date = new Date(timestamp);

    // Se a data é inválida, tentar como Unix timestamp
    if (isNaN(date.getTime())) {
      const unixTime = parseInt(timestamp, 10);
      if (unixTime > 0) {
        date = fromUnixTime(unixTime);
      } else {
        return 'Data inválida';
      }
    }
  } else {
    // Se é número, assumir Unix timestamp
    if (timestamp <= 0) {
      return '';
    }
    date = fromUnixTime(timestamp);
  }

  // Se é hoje: apenas horário
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ptBR });
  }

  // Se foi ontem: "Ontem às 14:30"
  if (isYesterday(date)) {
    return `Ontem às ${format(date, 'HH:mm', { locale: ptBR })}`;
  }

  // Outros dias: "15 Jan às 14:30"
  if (isThisYear(date)) {
    return `${format(date, 'dd MMM', { locale: ptBR })} às ${format(date, 'HH:mm', {
      locale: ptBR,
    })}`;
  }

  // Outros anos: "15 Jan 2023 às 14:30"
  return `${format(date, 'dd MMM yyyy', { locale: ptBR })} às ${format(date, 'HH:mm', {
    locale: ptBR,
  })}`;
};
