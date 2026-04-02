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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-agents',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-agents-page"]',
          title: 'Atendentes',
          content: 'Nesta seção você gerencia todos os atendentes da sua equipe.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-header"]',
          title: 'Barra de Ferramentas',
          content: 'Use a busca para encontrar atendentes, crie novos ou faça convite em massa.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-view-toggle"]',
          title: 'Modo de Visualização',
          content: 'Alterne entre a visualização em cards e em tabela conforme sua preferência.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-agents-content"]',
          title: 'Lista de Atendentes',
          content: 'Aqui são exibidos todos os atendentes. Clique em um para editar ou remover.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-teams',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-teams-page"]',
          title: 'Times',
          content: 'Organize seus atendentes em times para facilitar a distribuição de conversas.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-header"]',
          title: 'Barra de Ferramentas',
          content: 'Crie novos times, importe/exporte dados e busque times existentes.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-view-toggle"]',
          title: 'Modo de Visualização',
          content: 'Alterne entre a visualização em cards e em tabela.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-teams-content"]',
          title: 'Lista de Times',
          content: 'Veja todos os times cadastrados. Clique em "Gerenciar Membros" para adicionar ou remover atendentes de um time.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-labels',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-labels-page"]',
          title: 'Etiquetas',
          content: 'Crie etiquetas coloridas para categorizar e organizar suas conversas.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-labels-header"]',
          title: 'Barra de Ferramentas',
          content: 'Pesquise etiquetas existentes ou crie uma nova clicando no botão "Nova Etiqueta".',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-labels-content"]',
          title: 'Lista de Etiquetas',
          content: 'Todas as etiquetas são exibidas aqui com seu nome, descrição e cor. Clique nos ícones de ação para editar ou excluir.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-custom-attributes',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-custom-attributes-page"]',
          title: 'Atributos Personalizados',
          content: 'Crie campos extras para enriquecer informações de conversas, contatos e pipelines.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-custom-attributes-header"]',
          title: 'Barra de Ferramentas',
          content: 'Pesquise atributos ou adicione novos clicando em "Novo Atributo".',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-custom-attributes-tabs"]',
          title: 'Categorias de Atributos',
          content: 'Use as abas para filtrar entre atributos de Conversa, Contato ou Pipeline.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-canned-responses',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-canned-responses-page"]',
          title: 'Respostas Rápidas',
          content: 'Crie atalhos de texto para agilizar o atendimento com respostas pré-definidas.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-canned-responses-header"]',
          title: 'Barra de Ferramentas',
          content: 'Busque respostas por código ou conteúdo, ou crie uma nova resposta rápida.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-canned-responses-content"]',
          title: 'Lista de Respostas Rápidas',
          content: 'Aqui ficam todas as respostas cadastradas com seu código de atalho e conteúdo. Durante o atendimento, use "/" para acessá-las rapidamente.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-macros',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-macros-page"]',
          title: 'Macros',
          content: 'Macros são sequências de ações automatizadas que podem ser aplicadas a conversas com um único clique.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-macros-header"]',
          title: 'Barra de Ferramentas',
          content: 'Crie novos macros ou busque entre os existentes pelo nome.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-macros-content"]',
          title: 'Lista de Macros',
          content: 'Todos os macros cadastrados aparecem aqui. Clique em um macro para editar suas ações, ou use o botão de execução para aplicá-lo.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-integrations',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-integrations-page"]',
          title: 'Integrações',
          content: 'Conecte o sistema a ferramentas externas como CRM, comunicação, produtividade e IA.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-header"]',
          title: 'Título e Descrição',
          content: 'Visão geral das integrações disponíveis na plataforma.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-search"]',
          title: 'Busca de Integrações',
          content: 'Encontre rapidamente uma integração específica pelo nome ou descrição.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-integrations-categories"]',
          title: 'Categorias',
          content: 'Filtre as integrações por categoria: CRM, Comunicação, Produtividade, IA ou Personalizadas. Cada card permite configurar ou ativar/desativar a integração.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
  const { Tour, controls } = useJoyride({
    tourKey: 'settings-access-tokens',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="settings-access-tokens-page"]',
          title: 'Tokens de Acesso',
          content: 'Gere e gerencie tokens de API para integrar o sistema com aplicações externas de forma segura.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-access-tokens-header"]',
          title: 'Barra de Ferramentas',
          content: 'Crie novos tokens ou pesquise entre os existentes pelo nome, valor ou escopo.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="settings-access-tokens-content"]',
          title: 'Lista de Tokens',
          content: 'Todos os tokens aparecem aqui com nome, escopos e validade. Use as ações para visualizar o valor completo, regenerar ou excluir o token.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
      ],
      [],
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
