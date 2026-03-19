import { useState, useEffect, useCallback } from 'react';
import { Webhook, WebhookFormData } from '@/types/integrations';
import { webhooksService } from '@/services/integrations';
import { toast } from 'sonner';

interface UseWebhooksOptions {
  autoLoad?: boolean;
}

interface UseWebhooksReturn {
  webhooks: Webhook[];
  loading: boolean;
  error: string | null;
  loadWebhooks: () => Promise<void>;
  createWebhook: (data: WebhookFormData) => Promise<void>;
  updateWebhook: (id: string, data: WebhookFormData) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  testWebhook: (id: string) => Promise<void>;
  getWebhookById: (id: string) => Webhook | undefined;
}

export function useWebhooks(options: UseWebhooksOptions = {}): UseWebhooksReturn {
  const { autoLoad = true } = options;
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await webhooksService.getWebhooks();
      setWebhooks(response.data);
    } catch (err) {
      const errorMessage = 'Erro ao carregar webhooks';
      setError(errorMessage);
      console.error('Error loading webhooks:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWebhook = useCallback(
    async (data: WebhookFormData) => {
      try {
        await webhooksService.createWebhook(data);
        toast.success('Webhook criado com sucesso');
        await loadWebhooks(); // Reload list
      } catch (err) {
        console.error('Error creating webhook:', err);
        toast.error('Erro ao criar webhook');
        throw err;
      }
    },
    [loadWebhooks],
  );

  const updateWebhook = useCallback(
    async (id: string, data: WebhookFormData) => {
      try {
        await webhooksService.updateWebhook(id, data);
        toast.success('Webhook atualizado com sucesso');
        await loadWebhooks(); // Reload list
      } catch (err) {
        console.error('Error updating webhook:', err);
        toast.error('Erro ao atualizar webhook');
        throw err;
      }
    },
    [loadWebhooks],
  );

  const deleteWebhook = useCallback(
    async (id: string) => {
      try {
        await webhooksService.deleteWebhook(id);
        toast.success('Webhook excluído com sucesso');
        await loadWebhooks(); // Reload list
      } catch (err) {
        console.error('Error deleting webhook:', err);
        toast.error('Erro ao excluir webhook');
        throw err;
      }
    },
    [loadWebhooks],
  );

  const testWebhook = useCallback(async (id: string) => {
    try {
      await webhooksService.testWebhook(id);
      toast.success('Teste de webhook enviado com sucesso');
    } catch (err) {
      console.error('Error testing webhook:', err);
      toast.error('Erro ao testar webhook');
      throw err;
    }
  }, []);

  const getWebhookById = useCallback(
    (id: string) => {
      return webhooks.find(webhook => webhook.id === id);
    },
    [webhooks],
  );

  useEffect(() => {
    if (autoLoad) {
      loadWebhooks();
    }
  }, [autoLoad, loadWebhooks]);

  return {
    webhooks,
    loading,
    error,
    loadWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    getWebhookById,
  };
}
