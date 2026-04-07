import { useEffect, useMemo, useRef } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { useTranslation } from '@/hooks/useTranslation';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/settings/account';

export function SettingsTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-header"]',
          title: t('settings.step1.title'),
          content: t('settings.step1.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="settings-general"]',
          title: t('settings.step2.title'),
          content: t('settings.step2.content'),
          placement: 'bottom',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="settings-auto-resolve"]',
          title: t('settings.step3.title'),
          content: t('settings.step3.content'),
          placement: 'top',
          skipBeacon: true,
          skipScroll: false,
          scrollOffset: 80,
        },
        {
          target: '[data-tour="settings-account-id"]',
          title: t('settings.step4.title'),
          content: t('settings.step4.content'),
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

// ---------------------------------------------------------------------------
// Atendentes Tour
// ---------------------------------------------------------------------------
const AGENTS_ROUTE = '/settings/users';

export function SettingsAgentsTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-agents',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-agents-page"]',
          title: t('settingsAgents.step1.title'),
          content: t('settingsAgents.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-header"]',
          title: t('settingsAgents.step2.title'),
          content: t('settingsAgents.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-view-toggle"]',
          title: t('settingsAgents.step3.title'),
          content: t('settingsAgents.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-content"]',
          title: t('settingsAgents.step4.title'),
          content: t('settingsAgents.step4.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(AGENTS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(AGENTS_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Times Tour
// ---------------------------------------------------------------------------
const TEAMS_ROUTE = '/settings/teams';

export function SettingsTeamsTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-teams',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-teams-page"]',
          title: t('settingsTeams.step1.title'),
          content: t('settingsTeams.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-header"]',
          title: t('settingsTeams.step2.title'),
          content: t('settingsTeams.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-view-toggle"]',
          title: t('settingsTeams.step3.title'),
          content: t('settingsTeams.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-content"]',
          title: t('settingsTeams.step4.title'),
          content: t('settingsTeams.step4.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(TEAMS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(TEAMS_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Etiquetas Tour
// ---------------------------------------------------------------------------
const LABELS_ROUTE = '/settings/labels';

export function SettingsLabelsTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-labels',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-labels-page"]',
          title: t('settingsLabels.step1.title'),
          content: t('settingsLabels.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-labels-header"]',
          title: t('settingsLabels.step2.title'),
          content: t('settingsLabels.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-labels-content"]',
          title: t('settingsLabels.step3.title'),
          content: t('settingsLabels.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(LABELS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(LABELS_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Atributos Personalizados Tour
// ---------------------------------------------------------------------------
const CUSTOM_ATTRIBUTES_ROUTE = '/settings/attributes';

export function SettingsCustomAttributesTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-custom-attributes',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-custom-attributes-page"]',
          title: t('settingsCustomAttributes.step1.title'),
          content: t('settingsCustomAttributes.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-custom-attributes-header"]',
          title: t('settingsCustomAttributes.step2.title'),
          content: t('settingsCustomAttributes.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-custom-attributes-tabs"]',
          title: t('settingsCustomAttributes.step3.title'),
          content: t('settingsCustomAttributes.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(CUSTOM_ATTRIBUTES_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(CUSTOM_ATTRIBUTES_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Respostas Rápidas Tour
// ---------------------------------------------------------------------------
const CANNED_RESPONSES_ROUTE = '/settings/canned-responses';

export function SettingsCannedResponsesTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-canned-responses',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-canned-responses-page"]',
          title: t('settingsCannedResponses.step1.title'),
          content: t('settingsCannedResponses.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-canned-responses-header"]',
          title: t('settingsCannedResponses.step2.title'),
          content: t('settingsCannedResponses.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-canned-responses-content"]',
          title: t('settingsCannedResponses.step3.title'),
          content: t('settingsCannedResponses.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(CANNED_RESPONSES_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(CANNED_RESPONSES_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Macros Tour
// ---------------------------------------------------------------------------
const MACROS_ROUTE = '/settings/macros';

export function SettingsMacrosTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-macros',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-macros-page"]',
          title: t('settingsMacros.step1.title'),
          content: t('settingsMacros.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-macros-header"]',
          title: t('settingsMacros.step2.title'),
          content: t('settingsMacros.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-macros-content"]',
          title: t('settingsMacros.step3.title'),
          content: t('settingsMacros.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(MACROS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(MACROS_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Integrações Tour
// ---------------------------------------------------------------------------
const INTEGRATIONS_ROUTE = '/settings/integrations';

export function SettingsIntegrationsTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-integrations',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-integrations-page"]',
          title: t('settingsIntegrations.step1.title'),
          content: t('settingsIntegrations.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-header"]',
          title: t('settingsIntegrations.step2.title'),
          content: t('settingsIntegrations.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-search"]',
          title: t('settingsIntegrations.step3.title'),
          content: t('settingsIntegrations.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-categories"]',
          title: t('settingsIntegrations.step4.title'),
          content: t('settingsIntegrations.step4.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(INTEGRATIONS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(INTEGRATIONS_ROUTE);
  }, []);

  return <>{Tour}</>;
}

// ---------------------------------------------------------------------------
// Tokens de Acesso Tour
// ---------------------------------------------------------------------------
const ACCESS_TOKENS_ROUTE = '/settings/access-tokens';

export function SettingsAccessTokensTour() {
  const { t } = useTranslation('tours');
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-access-tokens',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-access-tokens-page"]',
          title: t('settingsAccessTokens.step1.title'),
          content: t('settingsAccessTokens.step1.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-access-tokens-header"]',
          title: t('settingsAccessTokens.step2.title'),
          content: t('settingsAccessTokens.step2.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-access-tokens-content"]',
          title: t('settingsAccessTokens.step3.title'),
          content: t('settingsAccessTokens.step3.content'),
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [t],
    ),
  });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    tourRegistry.register(ACCESS_TOKENS_ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(ACCESS_TOKENS_ROUTE);
  }, []);

  return <>{Tour}</>;
}
