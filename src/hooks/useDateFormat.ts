import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Hook para formatação de datas baseado no locale atual do i18n
 * 
 * Fornece funções helper para formatar datas, datetimes e horas
 * respeitando o idioma ativo da aplicação.
 * 
 * @example
 * ```tsx
 * const { formatDate, formatDateTime, formatTime, getLocale } = useDateFormat();
 * 
 * // Formatar apenas data
 * const dateStr = formatDate('2024-01-15');
 * // pt-BR: "15/01/2024"
 * // en-US: "01/15/2024"
 * 
 * // Formatar data e hora
 * const dateTimeStr = formatDateTime('2024-01-15T14:30:00');
 * // pt-BR: "15/01/2024, 14:30"
 * // en-US: "1/15/2024, 2:30 PM"
 * 
 * // Formatar apenas hora
 * const timeStr = formatTime('2024-01-15T14:30:00');
 * // pt-BR: "14:30"
 * // en-US: "2:30 PM"
 * ```
 */
export function useDateFormat() {
  const { currentLanguage } = useLanguage();

  /**
   * Mapeia o locale do i18n para o locale do Intl.DateTimeFormat
   */
  const getLocale = useMemo((): string => {
    switch (currentLanguage) {
      case 'pt-BR':
      case 'pt':
        return 'pt-BR';
      case 'es':
        return 'es-ES';
      case 'fr':
        return 'fr-FR';
      case 'it':
        return 'it-IT';
      default:
        return 'en-US';
    }
  }, [currentLanguage]);

  /**
   * Formata uma data no formato do locale atual
   * 
   * @param dateString - String de data ou objeto Date
   * @param options - Opções adicionais de formatação do Intl.DateTimeFormat
   * @returns String formatada da data
   * 
   * @example
   * formatDate('2024-01-15')
   * // pt-BR: "15/01/2024"
   * // en-US: "01/15/2024"
   */
  const formatDate = (
    dateString: string | Date,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const defaultOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
      };

      return date.toLocaleDateString(getLocale, defaultOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  /**
   * Formata data e hora no formato do locale atual
   * 
   * @param dateString - String de data/hora ou objeto Date
   * @param options - Opções adicionais de formatação do Intl.DateTimeFormat
   * @returns String formatada da data e hora
   * 
   * @example
   * formatDateTime('2024-01-15T14:30:00')
   * // pt-BR: "15/01/2024, 14:30"
   * // en-US: "1/15/2024, 2:30 PM"
   */
  const formatDateTime = (
    dateString: string | Date,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const defaultOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      };

      return date.toLocaleString(getLocale, defaultOptions);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid date';
    }
  };

  /**
   * Formata apenas a hora no formato do locale atual
   * 
   * @param dateString - String de data/hora ou objeto Date
   * @param options - Opções adicionais de formatação do Intl.DateTimeFormat
   * @returns String formatada da hora
   * 
   * @example
   * formatTime('2024-01-15T14:30:00')
   * // pt-BR: "14:30"
   * // en-US: "2:30 PM"
   */
  const formatTime = (
    dateString: string | Date,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      };

      return date.toLocaleTimeString(getLocale, defaultOptions);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid date';
    }
  };

  return {
    formatDate,
    formatDateTime,
    formatTime,
    getLocale,
    currentLanguage,
  };
}
