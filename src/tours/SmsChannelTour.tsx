import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function SmsChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/sms',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="sms-credentials"]',
          title: t('channelSms.step1.title'),
          content: t('channelSms.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="sms-phone-config"]',
          title: t('channelSms.step2.title'),
          content: t('channelSms.step2.content'),
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
