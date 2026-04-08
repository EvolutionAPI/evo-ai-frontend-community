import { useEffect, useRef } from 'react';
import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/channels/new';

interface ProviderSelectionTourProps {
  channelType: string;
}

export function ProviderSelectionTour({ channelType }: ProviderSelectionTourProps) {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: `channels/new/${channelType}/provider`,
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="provider-grid"]',
          title: t('providerSelection.step1.title'),
          content: t('providerSelection.step1.content'),
          placement: 'top',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
      ],
      [t],
    ),
  });

  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(ROUTE);
  }, []);

  return <>{Tour}</>;
}
