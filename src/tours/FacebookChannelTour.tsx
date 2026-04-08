import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function FacebookChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/facebook',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="facebook-connect"]',
          title: t('channelFacebook.step1.title'),
          content: t('channelFacebook.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
      ],
      [t],
    ),
  });

  return <>{Tour}</>;
}
