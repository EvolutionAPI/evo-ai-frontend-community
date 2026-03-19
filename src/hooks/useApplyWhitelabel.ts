import { useEffect } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useWhitelabelConfig } from '@/hooks/useWhitelabelConfig';

export function useApplyWhitelabel() {
  const { theme } = useDarkMode();
  const { config } = useWhitelabelConfig();

  useEffect(() => {
    const root = document.documentElement;

    if (!config.enabled) {
      // Remove custom CSS variables se whitelabel está desabilitado
      root.style.removeProperty('--whitelabel-primary');
      root.style.removeProperty('--whitelabel-primary-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      return;
    }

    const isDark = theme === 'dark';

    if (config.colors) {
      const colors = isDark ? config.colors.dark : config.colors.light;

      // Aplica cores primárias customizadas
      root.style.setProperty('--whitelabel-primary', colors.primary);
      root.style.setProperty('--whitelabel-primary-foreground', colors.primaryForeground);

      // Sobrescreve as variáveis CSS padrão do design system
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-foreground', colors.primaryForeground);
    }
  }, [theme, config]);

  // Aplica favicon customizado
  useEffect(() => {
    if (!config.enabled || !config.favicon) {
      return;
    }

    // Encontra ou cria o elemento link do favicon
    let faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");

    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }

    faviconLink.href = config.favicon;
  }, [config.enabled, config.favicon]);

  // Aplica nome do sistema no título da página
  useEffect(() => {
    if (!config.enabled || !config.systemName) {
      return;
    }

    // Salva o título original para restaurar se necessário
    const originalTitle = document.title;
    document.title = config.systemName;

    return () => {
      // Restaura título original quando whitelabel for desabilitado
      if (!config.enabled) {
        document.title = originalTitle;
      }
    };
  }, [config.enabled, config.systemName]);
}

