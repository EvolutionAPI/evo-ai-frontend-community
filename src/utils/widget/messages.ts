/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/widget/messages.ts
import type { MessageItem } from '@/components/widget/MessageList';
import { wdebug } from '@/utils/widget/debug';

type RawMessage = any;

type TransformOptions = {
  t: (key: string) => string;
  avatarUrl?: string;
};

export function transformMessage(
  m: RawMessage,
  list: RawMessage[] = [],
  { t, avatarUrl }: TransformOptions,
): MessageItem {
  const messageId = String(m.id ?? Math.random());
  const isSystemMessage = m.message_type === 2 || m.message_type === 3;

  // reply-to
  let replyTo: MessageItem['replyTo'] = undefined;
  if (m.content_attributes?.in_reply_to) {
    const replyToId = m.content_attributes.in_reply_to;
    const originalMessage = list.find((msg: any) => msg.id === replyToId);
    if (originalMessage) {
      replyTo = {
        id: replyToId,
        text: originalMessage.content || '',
        sender:
          originalMessage.message_type === 0
            ? originalMessage.sender?.name || t('chat.user')
            : t('chat.agent'),
        type: originalMessage.message_type === 0 ? ('out' as const) : ('in' as const),
      };
    }
  }

  return {
    id: messageId,
    originalId: m.id,
    type:
      m.message_type === 'outgoing' || m.message_type === 0
        ? ('out' as const)
        : ('in' as const),
    text: m.content || '',
    ts: m.created_at
      ? typeof m.created_at === 'number'
        ? m.created_at * 1000
        : Date.parse(m.created_at)
      : Date.now(),
    status: 'sent' as const,
    avatarUrl:
      m.message_type === 'outgoing' || m.message_type === 0 || isSystemMessage
        ? undefined
        : avatarUrl || undefined,
    isSystem: isSystemMessage,
    replyTo,
    attachments: m.attachments
      ? m.attachments.map((att: any) => ({
        id: att.id,
        file_url: att.data_url,
        data_url: att.data_url,
        thumb_url: att.thumb_url,
        file_type: att.file_type,
        file_size: att.file_size,
        fallback_title:
          att.fallback_title ||
          `Arquivo (${att.file_size ? Math.round(att.file_size / 1024) : 0} KB)`,
      }))
      : undefined,
    contentType: m.content_type,
    submittedEmail: m.submitted_email || undefined,
    contentAttributes: m.content_attributes?.email
      ? {
        email: {
          html_content: m.content_attributes.email.html_content,
          text_content: m.content_attributes.email.text_content,
        },
      }
      : undefined,
  };
}


// Função para mapear e registrar mensagens
export function mapAndRegisterMessages(
  list: any[],
  opts: TransformOptions,
  processedIds?: Set<string>
): MessageItem[] {
  const out: MessageItem[] = []; // Declara array de saída

  // Itera sobre cada mensagem na lista de entrada
  for (const m of list) {

    // Gera ID da mensagem
    const id = String(m.id);

    // Verifica se a mensagem já foi processada
    if (processedIds?.has(id)) continue;

    // Transforma a mensagem e registra o ID processado
    const msg = transformMessage(m, list, opts);

    // Adiciona o ID da mensagem processada ao conjunto de IDs processados
    processedIds?.add(msg.id);

    // Adiciona a mensagem transformada ao array de saída
    out.push(msg);
  }

  // Log de saída
  wdebug('[WIDGET_DEBUG] mapAndRegisterMessages OUTPUT', {
    outputCount: out.length,
    timestamp: new Date().toISOString(),
  });

  // Retorna o array de mensagens transformadas
  return out;
}
