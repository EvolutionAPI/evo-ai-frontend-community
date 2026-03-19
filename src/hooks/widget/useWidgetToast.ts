// src/hooks/widget/useWidgetToast.ts
import { useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export function useWidgetToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    setToastMessage(message);
    setToastType(type);

    if (typeof window === 'undefined') return;

    clearTimer();

    const id = window.setTimeout(() => {
      setToastMessage(null);
      timeoutRef.current = null;
    }, 4000);

    timeoutRef.current = id;
  };

  const hideToast = () => {
    clearTimer();
    setToastMessage(null);
  };

  return {
    toastMessage,
    toastType,
    showToast,
    hideToast,
  };
}
