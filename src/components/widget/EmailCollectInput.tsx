import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { widgetService } from '@/services/widget/widgetService';

interface EmailCollectInputProps {
  messageId: string | number;
  widgetColor: string;
  onSubmitted?: (email: string) => void;
  alreadySubmitted?: boolean;
}

export const EmailCollectInput = ({
  messageId,
  widgetColor,
  onSubmitted,
  alreadySubmitted = false,
}: EmailCollectInputProps) => {
  const { t } = useLanguage('widget');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(alreadySubmitted);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError(t('emailCollect.invalidEmail'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('website_token') || '';
      if (!token) {
        setError(t('emailCollect.error'));
        return;
      }

      await widgetService.updateMessage(token, messageId, email);
      setIsSubmitted(true);
      onSubmitted?.(email);
    } catch {
      setError(t('emailCollect.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{t('emailCollect.success')}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder={t('emailCollect.placeholder')}
          aria-label={t('emailCollect.placeholder')}
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent disabled:opacity-50"
          style={{ outlineColor: widgetColor }}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !email}
          className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: widgetColor }}
        >
          {isSubmitting ? '...' : t('emailCollect.button')}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
