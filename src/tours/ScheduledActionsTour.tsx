import { useEffect, useMemo, useRef } from 'react';
import type { Step } from 'react-joyride';
import { useJoyride } from '@/hooks/useJoyride';
import { tourRegistry } from './tourRegistry';

const ROUTE = '/contacts/scheduled-actions';

export function ScheduledActionsTour() {
  const { Tour, controls } = useJoyride({
    tourKey: 'scheduled-actions',
    steps: useMemo<Step[]>(
      () => [
        {
          target: '[data-tour="scheduled-actions-page"]',
          title: 'Ações Agendadas',
          content: 'Aqui você visualiza e gerencia todas as ações programadas para serem executadas automaticamente em contatos — como envio de mensagens em datas específicas.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="scheduled-actions-search"]',
          title: 'Buscar Ações',
          content: 'Pesquise ações agendadas pelo nome do contato, tipo de ação ou qualquer outro campo para encontrar rapidamente o que precisa.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="scheduled-actions-new-button"]',
          title: 'Nova Ação Agendada',
          content: 'Clique aqui para criar uma nova ação agendada. Você poderá escolher o contato, definir o tipo de ação e configurar a data e hora de execução.',
          placement: 'auto',
          disableBeacon: true,
          disableScrolling: true,
        },
        {
          target: '[data-tour="scheduled-actions-content"]',
          title: 'Lista de Ações',
          content: 'Todas as ações agendadas aparecem aqui com status (agendada, executada, cancelada) e contagem regressiva. Use as ações da linha para editar ou cancelar uma ação antes da execução.',
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
    tourRegistry.register(ROUTE, () => controlsRef.current.reset(true));
    return () => tourRegistry.unregister(ROUTE);
  }, []);

  return <>{Tour}</>;
}
