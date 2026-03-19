import { Button } from '@evoapi/design-system';
import { useLanguage } from '@/hooks/useLanguage';

interface ConnectionTestProps {
  onTest: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
}

export const ConnectionTest = ({
  onTest,
  isLoading,
  disabled = false,
  className,
}: ConnectionTestProps) => {
  const { t } = useLanguage('channels');
  return (
    <Button
      variant="outline"
      onClick={onTest}
      disabled={disabled || isLoading}
      className={`min-w-32 ${className || ''}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {t('newChannel.buttons.testing')}
        </div>
      ) : (
        t('newChannel.buttons.testConnection')
      )}
    </Button>
  );
};
