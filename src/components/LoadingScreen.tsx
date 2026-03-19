import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useWhitelabelConfig } from '@/hooks/useWhitelabelConfig';

import logoWhite from '@/assets/evoai-white.svg';
import logoBlack from '@/assets/evoai-dark.svg';

interface LoadingScreenProps {
  fullScreen?: boolean;
  showLogo?: boolean;
  className?: string;
}

const LoadingScreen = ({ fullScreen = false, showLogo = false, className }: LoadingScreenProps) => {
  const { config: whitelabelConfig } = useWhitelabelConfig();

  const lightLogo =
    whitelabelConfig.enabled && whitelabelConfig.logo?.light
      ? whitelabelConfig.logo.light
      : logoBlack;

  const darkLogo =
    whitelabelConfig.enabled && whitelabelConfig.logo?.dark
      ? whitelabelConfig.logo.dark
      : logoWhite;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-neutral-background-default',
        fullScreen && 'h-screen',
        className,
      )}
    >
      {showLogo && (
        <>
          {/* Logo light mode */}
          <img
            src={lightLogo}
            alt="Logo"
            className="w-1/4 mb-4 dark:hidden"
            onError={e => {
              (e.target as HTMLImageElement).src = logoBlack;
            }}
          />
          {/* Logo dark mode */}
          <img
            src={darkLogo}
            alt="Logo"
            className="w-1/4 mb-4 hidden dark:block"
            onError={e => {
              (e.target as HTMLImageElement).src = logoWhite;
            }}
          />
        </>
      )}
      <Loader2
        className={cn(
          'h-8 w-8 animate-spin text-primary-interaction-default dark:text-primary-surface-default'
        )}
      />
    </div>
  );
};

export default LoadingScreen;
