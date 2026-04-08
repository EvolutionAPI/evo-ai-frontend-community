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
        // ── Filtros ──────────────────────────────────────────────
        {
          target: '[data-tour="dashboard-filter-button"]',
          title: t('dashboard.step1.title'),
          content: t('dashboard.step1.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        // ── Cards de status ───────────────────────────────────────
        {
          target: '[data-tour="dashboard-messages-card"]',
          title: t('dashboard.step2.title'),
          content: t('dashboard.step2.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-response-time-card"]',
          title: t('dashboard.step3.title'),
          content: t('dashboard.step3.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-csat-card"]',
          title: t('dashboard.step4.title'),
          content: t('dashboard.step4.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-followups-card"]',
          title: t('dashboard.step5.title'),
          content: t('dashboard.step5.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-ia-vs-human"]',
          title: t('dashboard.step6.title'),
          content: t('dashboard.step6.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-active-conversations"]',
          title: t('dashboard.step7.title'),
          content: t('dashboard.step7.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-unassigned"]',
          title: t('dashboard.step8.title'),
          content: t('dashboard.step8.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        // ── Tendências ────────────────────────────────────────────
        {
          target: '[data-tour="dashboard-trends-conversations"]',
          title: t('dashboard.step9.title'),
          content: t('dashboard.step9.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-trends-response"]',
          title: t('dashboard.step10.title'),
          content: t('dashboard.step10.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-channel-participation"]',
          title: t('dashboard.step11.title'),
          content: t('dashboard.step11.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-channel-insights"]',
          title: t('dashboard.step12.title'),
          content: t('dashboard.step12.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        // ── Diagnóstico ───────────────────────────────────────────
        {
          target: '[data-tour="dashboard-heatmap"]',
          title: t('dashboard.step13.title'),
          content: t('dashboard.step13.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-csat-distribution"]',
          title: t('dashboard.step14.title'),
          content: t('dashboard.step14.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-funnel"]',
          title: t('dashboard.step15.title'),
          content: t('dashboard.step15.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-funnel-summary"]',
          title: t('dashboard.step16.title'),
          content: t('dashboard.step16.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-channel-performance"]',
          title: t('dashboard.step17.title'),
          content: t('dashboard.step17.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-channels-value"]',
          title: t('dashboard.step18.title'),
          content: t('dashboard.step18.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-agents-performance"]',
          title: t('dashboard.step19.title'),
          content: t('dashboard.step19.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
        },
        {
          target: '[data-tour="dashboard-ai-agents-performance"]',
          title: t('dashboard.step20.title'),
          content: t('dashboard.step20.content'),
          placement: 'auto',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 100,
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
