import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function TelegramChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/telegram',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="telegram-bot-token"]',
          title: t('channelTelegram.step1.title'),
          content: t('channelTelegram.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="telegram-instructions"]',
          title: t('channelTelegram.step2.title'),
          content: t('channelTelegram.step2.content'),
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
