import { useState, useEffect } from 'react';
import InboxesService from '@/services/channels/inboxesService';
import chatService from '@/services/chat/chatService';
import { Inbox } from '@/types/channels/inbox';
import type { Pipeline } from '@/types/chat/api';

interface FilterOptions {
  inboxes: Array<{ label: string; value: string }>;
  teams: Array<{ label: string; value: string }>;
  labels: Array<{ label: string; value: string }>;
  pipelines: Array<{ label: string; value: string }>;
  loading: boolean;
  error: string | null;
}

interface UseFilterOptionsParams {
  /**
   * Se false, não carrega dados automaticamente
   * Útil para carregar apenas quando modal é aberto
   * @default true
   */
  enabled?: boolean;
}

export const useFilterOptions = (params: UseFilterOptionsParams = {}): FilterOptions => {
  const { enabled = true } = params;

  const [options, setOptions] = useState<FilterOptions>({
    inboxes: [],
    teams: [],
    labels: [],
    pipelines: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    const loadOptions = async () => {
      setOptions(prev => ({ ...prev, loading: true, error: null }));

      try {
        // ✅ Carregar inboxes e pipelines
        const [inboxesResponse, pipelinesResponse] = await Promise.allSettled([
          InboxesService.list(),
          chatService.getAvailablePipelines(),
        ]);

        // ✅ Processar inboxes
        const inboxes: Array<{ label: string; value: string }> = [];
        if (inboxesResponse.status === 'fulfilled') {
          inboxes.push(
            ...inboxesResponse.value.data.map((inbox: Inbox) => {
              // Extrair o nome do tipo do canal (ex: "Channel::Whatsapp" -> "WhatsApp")
              const channelTypeName =
                inbox.channel_type?.split('::')[1] || inbox.channel_type || 'Unknown';
              return {
                label: `${inbox.name} (${channelTypeName})`,
                value: inbox.id.toString(),
              };
            }),
          );
        }

        // ✅ Processar pipelines
        const pipelines: Array<{ label: string; value: string }> = [];
        if (pipelinesResponse.status === 'fulfilled') {
          // O chatService já processa a resposta e retorna Pipeline[]
          const pipelinesData = pipelinesResponse.value || [];

          if (Array.isArray(pipelinesData)) {
            pipelines.push(
              ...pipelinesData.map((pipeline: Pipeline) => ({
                label: pipeline.name,
                value: pipeline.id.toString(),
              })),
            );
          } else {
            console.warn('⚠️ Pipelines data não é um array:', pipelinesData);
          }
        }

        // ❌ Teams e Labels temporariamente vazios (APIs não implementadas no chatService)
        const teams: Array<{ label: string; value: string }> = [];
        const labels: Array<{ label: string; value: string }> = [];

        setOptions({
          inboxes,
          teams,
          labels,
          pipelines,
          loading: false,
          error: null,
        });

        // ✅ Log de erros individuais sem falhar o hook
        if (inboxesResponse.status === 'rejected') {
          console.warn('Erro ao carregar inboxes:', inboxesResponse.reason);
        }
        if (pipelinesResponse.status === 'rejected') {
          console.warn('Erro ao carregar pipelines:', pipelinesResponse.reason);
        }
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
        setOptions(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar opções de filtro',
        }));
      }
    };

    loadOptions();
  }, [enabled]);

  return options;
};
