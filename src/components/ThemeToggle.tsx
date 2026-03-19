import { useLanguage } from '@/hooks/useLanguage';
import { Sun, Moon } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@evoapi/design-system';
import { useDarkMode } from '../hooks/useDarkMode';

export function ThemeToggle() {
  const { t } = useLanguage('common');
  const { toggleTheme } = useDarkMode();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0 hover:bg-neutral-surface-highlight cursor-pointer"
          aria-label={t('base.theme.toggle')}
        >
          {/* Mostra lua no light */}
          <Moon className="h-4 w-4 dark:hidden" />
          {/* Mostra sol no dark */}
          <Sun className="h-4 w-4 hidden dark:block" />
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        {/* Texto também via CSS, sem ler state */}
        <span className="dark:hidden">{t('base.theme.dark')}</span>
        <span className="hidden dark:inline">{t('base.theme.light')}</span>
      </TooltipContent>
    </Tooltip>
  );
}
