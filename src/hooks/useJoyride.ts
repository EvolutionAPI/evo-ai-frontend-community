import { useEffect } from 'react';
import { useJoyride as useJoyrideLib, EVENTS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { JoyrideTooltip } from '@/tours/JoyrideTooltip';

interface UseJoyrideOptions {
  tourKey: string;
  steps: Step[];
  autoStart?: boolean;
}

export function useJoyride({ tourKey, steps, autoStart = true }: UseJoyrideOptions) {
  const storageKey = `tour:${tourKey}`;

  const { Tour, controls, on } = useJoyrideLib({
    steps,
    continuous: true,
    showSkipButton: false,
    scrollToFirstStep: true,
    portalElement: 'main.overflow-auto',
    tooltipComponent: JoyrideTooltip,
    options: {
      skipBeacon: true,
      zIndex: 10000,
      arrowColor: '#252836',
      scrollOffset: 80,
      skipScroll: false,
    },
    locale: {
      back: 'Voltar',
      close: 'Fechar',
      last: 'Concluir',
      next: 'Próximo',
      open: 'Abrir tour',
      skip: 'Pular',
    },
  });

  // Persist completion to localStorage when tour ends or is skipped
  useEffect(() => {
    const unsubscribe = on(EVENTS.TOUR_END, () => {
      localStorage.setItem(storageKey, 'true');
    });
    return unsubscribe;
  }, [on, storageKey]);

  // Auto-start on first visit (only after the welcome modal has been dismissed)
  useEffect(() => {
    if (!autoStart) return;

    const welcomeSeen = localStorage.getItem('onboarding:welcome-seen');
    if (!welcomeSeen) return;

    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      const timer = setTimeout(() => controls.start(), 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey, autoStart, controls]);

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    controls.reset(true);
  };

  return {
    Tour,
    controls,
    resetTour,
    isCompleted: !!localStorage.getItem(storageKey),
  };
}
