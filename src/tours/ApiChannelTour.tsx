import { useEffect, useRef } from 'react';
import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/channels/new';

export function ApiChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'channels/new/api',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="api-display-name"]',
          title: t('channelApi.step1.title'),
          content: t('channelApi.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="api-webhook-url"]',
          title: t('channelApi.step2.title'),
          content: t('channelApi.step2.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="api-info"]',
          title: t('channelApi.step3.title'),
          content: t('channelApi.step3.content'),
          placement: 'right',
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
