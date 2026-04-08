import { useEffect, useRef } from 'react';
import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/channels/new';

interface WhatsappProviderTourProps {
  providerId: string;
}

export function WhatsappProviderTour({ providerId }: WhatsappProviderTourProps) {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: `channels/new/whatsapp/${providerId}`,
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="whatsapp-credentials"]',
          title: t('channelWhatsappProvider.step1.title'),
          content: t('channelWhatsappProvider.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="whatsapp-help"]',
          title: t('channelWhatsappProvider.step2.title'),
          content: t('channelWhatsappProvider.step2.content'),
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
