import { useEffect, useMemo, useRef } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/dashboard';

export function DashboardTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'dashboard',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="dashboard-header"]',
          title: t('dashboard.step1.title'),
          content: t('dashboard.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="dashboard-filter-button"]',
          title: t('dashboard.step2.title'),
          content: t('dashboard.step2.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="dashboard-period-badge"]',
          title: t('dashboard.step3.title'),
          content: t('dashboard.step3.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="dashboard-metrics"]',
          title: t('dashboard.step4.title'),
          content: t('dashboard.step4.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="dashboard-trends"]',
          title: t('dashboard.step5.title'),
          content: t('dashboard.step5.content'),
          placement: 'top',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="dashboard-performance"]',
          title: t('dashboard.step6.title'),
          content: t('dashboard.step6.content'),
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
