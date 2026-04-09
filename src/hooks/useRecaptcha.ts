import { useEffect, useState, useCallback } from 'react';
import { recaptchaService } from '@/lib/recaptcha';
import { useGlobalConfig } from '@/contexts/GlobalConfigContext';

export interface UseRecaptchaOptions {
  autoLoad?: boolean;
}

export interface UseRecaptchaReturn {
  isLoaded: boolean;
  isLoading: boolean;
  isEnabled: boolean;
  executeRecaptcha: (action: string) => Promise<string | null>;
  loadRecaptcha: () => Promise<void>;
  error: string | null;
}

export function useRecaptcha(options: UseRecaptchaOptions = {}): UseRecaptchaReturn {
  const { autoLoad = true } = options;
  const { recaptchaSiteKey } = useGlobalConfig();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(recaptchaService.isEnabled());
  const [error, setError] = useState<string | null>(null);

  // Configure recaptcha service with backend API key (falls back to VITE_* env var)
  useEffect(() => {
    recaptchaService.configure(recaptchaSiteKey);
    setIsEnabled(recaptchaService.isEnabled());
  }, [recaptchaSiteKey]);

  const loadRecaptcha = useCallback(async () => {
    if (!isEnabled || isLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await recaptchaService.loadScript();
      setIsLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reCAPTCHA';
      setError(errorMessage);
      console.error('Error loading reCAPTCHA:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, isLoaded, isLoading]);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!isEnabled) {
        return null;
      }

      if (!isLoaded) {
        await loadRecaptcha();
      }

      try {
        setError(null);
        const token = await recaptchaService.executeRecaptcha(action);
        return token;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute reCAPTCHA';
        setError(errorMessage);
        console.error('Error executing reCAPTCHA:', errorMessage);
        return null;
      }
    },
    [isEnabled, isLoaded, loadRecaptcha],
  );

  useEffect(() => {
    if (autoLoad && isEnabled && !isLoaded && !isLoading) {
      loadRecaptcha();
    }
  }, [autoLoad, isEnabled, isLoaded, isLoading, loadRecaptcha]);

  return {
    isLoaded,
    isLoading,
    isEnabled,
    executeRecaptcha,
    loadRecaptcha,
    error,
  };
}
