import { useTranslation } from '@/hooks/useTranslation';
import { type Locale } from '@/i18n/config';

export const useLanguage = (namespace?: string) => {
  const { i18n, t } = useTranslation(namespace);

  const changeLanguage = (lng: Locale) => {
    i18n.changeLanguage(lng);
    // Salvar idioma selecionado no localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = i18n.language as Locale;

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
};
