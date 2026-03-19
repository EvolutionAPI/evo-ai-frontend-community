import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface StartNewConversationButtonProps {
  onStartNew: () => void;
  widgetColor?: string;
}

const StartNewConversationButton: React.FC<StartNewConversationButtonProps> = ({
  onStartNew,
  widgetColor = '#1f93ff',
}) => {
  const { t } = useLanguage('widget');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onStartNew();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          w-full px-4 py-3 rounded-lg font-medium text-white
          transition-all duration-200 flex items-center justify-center gap-2
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}
        `}
        style={{ backgroundColor: widgetColor }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('startNewConversation.starting')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t('startNewConversation.button')}
          </>
        )}
      </button>
    </div>
  );
};

export default StartNewConversationButton;
