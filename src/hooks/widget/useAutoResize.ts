/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/widget/useAutoResize.ts
import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { postParent } from '@/utils/widget/postParent';

export function useAutoResize(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || !(window as any).ResizeObserver) return;

    const ro = new (window as any).ResizeObserver((entries: any[]) => {
      for (const entry of entries) {
        const h = Math.ceil(entry.contentRect.height);
        postParent('set-height', { height: h });
      }
    });

    ro.observe(el);

    // initial
    postParent('set-height', { height: el.getBoundingClientRect().height });

    return () => ro.disconnect();
  }, [rootRef]);
}
