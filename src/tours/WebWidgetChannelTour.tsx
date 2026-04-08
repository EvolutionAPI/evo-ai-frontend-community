import { useMemo } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';

export function WebWidgetChannelTour() {
  const { t } = useTranslation('tours');
  const { Tour } = useJoyride({
    tourKey: 'channels/new/web_widget',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="web-widget-basic-info"]',
          title: t('channelWebWidget.step1.title'),
          content: t('channelWebWidget.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="web-widget-appearance"]',
          title: t('channelWebWidget.step2.title'),
          content: t('channelWebWidget.step2.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="web-widget-behavior"]',
          title: t('channelWebWidget.step3.title'),
          content: t('channelWebWidget.step3.content'),
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
