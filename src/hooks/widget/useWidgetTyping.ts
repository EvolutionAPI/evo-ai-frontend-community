// src/hooks/widget/useWidgetTyping.ts
import { useRef } from 'react';
import type { RefObject } from 'react';
import type { WidgetCable } from '@/services/widget/widgetCable';

type Params = {
  cableRef: RefObject<WidgetCable | null>;
  conversationIdRef: RefObject<number | null>;
};

export function useWidgetTyping({ cableRef, conversationIdRef }: Params) {
  const userTypingTimeout = useRef<number | null>(null);

  const toggleUserTyping = (isTyping: boolean) => {
    if (!conversationIdRef.current) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('website_token') || '';
    if (!token || !cableRef.current) return;

    if (isTyping) {
      // limpa timeout atual
      if (userTypingTimeout.current) {
        window.clearTimeout(userTypingTimeout.current);
      }

      cableRef.current.send({
        type: 'typing_on',
        conversation_id: conversationIdRef.current,
      });

      const timeout = window.setTimeout(() => {
        if (!cableRef.current) return;
        cableRef.current.send({
          type: 'typing_off',
          conversation_id: conversationIdRef.current,
        });
      }, 3000);

      userTypingTimeout.current = timeout;
    } else {
      cableRef.current.send({
        type: 'typing_off',
        conversation_id: conversationIdRef.current,
      });

      if (userTypingTimeout.current) {
        window.clearTimeout(userTypingTimeout.current);
        userTypingTimeout.current = null;
      }
    }
  };

  return { toggleUserTyping };
}
