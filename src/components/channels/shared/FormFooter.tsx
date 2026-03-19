import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@evoapi/design-system';
import { useLanguage } from '@/hooks/useLanguage';
import { ConnectionTest } from './ConnectionTest';

interface FormFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  onTest?: () => Promise<void>;
  isSubmitting: boolean;
  isTesting?: boolean;
  isDisabled?: boolean;
  showTestConnection?: boolean;
  submitText?: string;
  cancelText?: string;
  healthCheckPassed?: boolean | null;
}

export const FormFooter = ({
  onCancel,
  onSubmit,
  onTest,
  isSubmitting,
  isTesting = false,
  isDisabled = false,
  showTestConnection = false,
  submitText,
  cancelText,
  healthCheckPassed,
}: FormFooterProps) => {
  const { t } = useLanguage('channels');

  // Verifica se o botão está desabilitado por causa do health check
  const isDisabledByHealthCheck = showTestConnection && healthCheckPassed !== true;
  const isButtonDisabled = isSubmitting || isTesting || isDisabled;

  const submitButtonContent = isSubmitting ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {t('newChannel.buttons.creating')}
    </div>
  ) : (
    submitText || t('newChannel.buttons.createChannel')
  );

  // Tooltip wrapper - sempre mostra quando está desabilitado por health check
  // Para tooltips funcionarem com botões desabilitados, precisamos envolver em um elemento que capture o hover
  const buttonWithTooltip = isDisabledByHealthCheck ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">
          <Button
            onClick={onSubmit}
            disabled={isButtonDisabled}
            className="min-w-32"
            aria-disabled={isButtonDisabled}
          >
            {submitButtonContent}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('newChannel.messages.testConnectionFirst')}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <Button
      onClick={onSubmit}
      disabled={isButtonDisabled}
      className="min-w-32"
    >
      {submitButtonContent}
    </Button>
  );

  return (
    <div className="border-t border-border bg-muted/20 px-6 py-4">
      {/* Aviso quando health check não passou */}
      {isDisabledByHealthCheck && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t('newChannel.messages.testConnectionFirst')}
          </p>
        </div>
      )}

      <div className="flex justify-between">
        {/* Test Connection Button */}
        <div>
          {showTestConnection && onTest && (
            <ConnectionTest
              onTest={onTest}
              isLoading={isTesting}
              disabled={isSubmitting || isTesting}
            />
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isTesting}
            className="min-w-24"
          >
            {cancelText || t('newChannel.buttons.cancel')}
          </Button>
          {buttonWithTooltip}
        </div>
      </div>
    </div>
  );
};
