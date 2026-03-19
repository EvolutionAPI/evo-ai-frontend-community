import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface EndConversationButtonProps {
  websiteToken: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  canEndConversation?: boolean; // Only show if conversation is open/pending/snoozed
  hasEndConversationEnabled?: boolean; // Feature flag
}

const EndConversationButton: React.FC<EndConversationButtonProps> = ({
  websiteToken,
  onSuccess,
  onError,
  disabled = false,
  canEndConversation = false,
  hasEndConversationEnabled = false,
}) => {
  const { t } = useLanguage('widget');
  const [isLoading, setIsLoading] = useState(false);

  // Don't render if feature is disabled or can't end conversation
  if (!hasEndConversationEnabled || !canEndConversation) {
    return null;
  }

  const handleEndConversation = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const { widgetService } = await import('@/services/widget/widgetService');
      await widgetService.toggleConversationStatus(websiteToken);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('endConversation.error');
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEndConversation}
      disabled={disabled || isLoading}
      title={t('endConversation.tooltip')}
      className={`
        inline-flex items-center justify-center w-8 h-8
        rounded-md transition-all duration-200
        ${
          disabled || isLoading
            ? 'opacity-50 cursor-not-allowed text-white/40'
            : 'hover:bg-white/10 text-white hover:text-white'
        }
      `}
    >
      {isLoading ? (
        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      )}
    </button>
  );
};

export default EndConversationButton;
