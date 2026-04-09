import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

import logo from '@/assets/EVO_CRM.png';

interface LoadingScreenProps {
  fullScreen?: boolean;
  showLogo?: boolean;
  className?: string;
}

const LoadingScreen = ({ fullScreen = false, showLogo = false, className }: LoadingScreenProps) => {
  const displayLogo = logo;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-neutral-background-default',
        fullScreen && 'h-screen',
        className,
      )}
    >
      {showLogo && (
        <img
            src={displayLogo}
            alt="EVO CRM"
            className="w-1/4 mb-4"
            onError={e => {
              (e.target as HTMLImageElement).src = logo;
            }}
          />
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
