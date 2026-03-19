import React, { createContext, useLayoutEffect, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface DarkModeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Criar contexto para o tema
export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// Provider que será usado na raiz da aplicação
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Aplica o tema no documento ANTES do paint (evita 1 frame "errado")
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Observa mudanças na preferência do sistema (só se usuário não escolheu manualmente)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const saved = localStorage.getItem('theme');
      // Se não existe escolha manual salva, segue o sistema
      if (saved !== 'light' && saved !== 'dark') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    // desliga transições durante a troca
    root.classList.add('theme-switching');

    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';

    // aplica tema
    root.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);

    // re-liga transições no próximo frame (ou dois)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
  };


  // Memoizamos o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <DarkModeContext.Provider value={contextValue}>{children}</DarkModeContext.Provider>;
}
