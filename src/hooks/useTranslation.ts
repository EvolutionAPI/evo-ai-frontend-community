import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Hook personalizado para usar traduções com namespaces
 *
 * @param namespace - Namespace específico para as traduções
 * @returns Objeto com função de tradução e outras utilidades
 *
 * @example
 * // Usando namespace específico
 * const { t } = useLanguage('auth');
 * t('login.title') // Acessa auth.login.title
 *
 * @example
 * // Usando namespace padrão (compatibilidade)
 * const { t } = useLanguage();
 * t('auth.login.title') // Acessa translation.auth.login.title
 */
export function useTranslation(namespace?: string) {
  const { t: originalT, i18n, ready } = useI18nTranslation(namespace);

  // Se não há namespace, usa o padrão
  const t = namespace ? originalT : originalT;

  // Aguardar a inicialização do i18n antes de retornar as traduções
  if (!ready) {
    return {
      t: (key: string, _options?: any) => key, // Retorna a chave como fallback
      i18n,
      ready,
      changeLanguage: i18n.changeLanguage,
      language: i18n.language,
    };
  }

  return {
    t,
    i18n,
    ready,
    changeLanguage: i18n.changeLanguage,
    language: i18n.language,
  };
}

/**
 * Hook para usar múltiplos namespaces
 *
 * @param namespaces - Array de namespaces
 * @returns Objeto com função de tradução que aceita namespace como prefixo
 *
 * @example
 * const { t } = useMultipleTranslations(['auth', 'common']);
 * t('auth:login.title') // Acessa auth.login.title
 * t('common:loading') // Acessa common.loading
 */
export function useMultipleTranslations(namespaces: string[]) {
  const { t: originalT, i18n, ready } = useI18nTranslation(namespaces);

  return {
    t: originalT,
    i18n,
    ready,
    changeLanguage: i18n.changeLanguage,
    language: i18n.language,
  };
}

// Re-exportar o hook original para casos específicos
export { useTranslation as useI18nTranslation } from 'react-i18next';
