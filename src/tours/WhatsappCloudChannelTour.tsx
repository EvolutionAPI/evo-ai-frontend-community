import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function WhatsappCloudChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/whatsapp/cloud',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="whatsapp-cloud-connect"]',
          title: t('channelWhatsappCloud.step1.title'),
          content: t('channelWhatsappCloud.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="whatsapp-cloud-credentials"]',
          title: t('channelWhatsappCloud.step2.title'),
          content: t('channelWhatsappCloud.step2.content'),
          placement: 'top',
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
