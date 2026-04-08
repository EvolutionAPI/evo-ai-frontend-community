import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function InstagramChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/instagram',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="instagram-connect"]',
          title: t('channelInstagram.step1.title'),
          content: t('channelInstagram.step1.content'),
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
