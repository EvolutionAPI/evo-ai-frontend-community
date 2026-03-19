import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook para debounce de valores
 * @param value - Valor para aplicar debounce
 * @param delay - Delay em milissegundos
 * @returns Valor com debounce aplicado
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de callbacks
 * @param callback - Função para aplicar debounce
 * @param delay - Delay em milissegundos
 * @returns Função com debounce aplicado
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}
