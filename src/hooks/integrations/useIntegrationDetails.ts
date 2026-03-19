import { useState, useEffect, useCallback } from 'react';
import { Integration } from '@/types/integrations';
import { integrationsService } from '@/services/integrations';
import { toast } from 'sonner';

interface UseIntegrationDetailsOptions {
  integrationId: string;
  autoLoad?: boolean;
}

interface UseIntegrationDetailsReturn {
  integration: Integration | null;
  configuration: any;
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadDetails: () => Promise<void>;
  updateConfiguration: (config: any) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  testConnection: () => Promise<void>;
}

export function useIntegrationDetails(
  options: UseIntegrationDetailsOptions,
): UseIntegrationDetailsReturn {
  const { integrationId, autoLoad = true } = options;
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [configuration, setConfiguration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!integrationId) return;

    setLoading(true);
    setError(null);

    try {
      // Load integration details
      const integration = await integrationsService.getIntegration(integrationId);
      setIntegration(integration || null);

      // Load specific configuration based on integration type
      let configData = null;

      switch (integrationId) {
        case 'slack': {
          const slackConfig = await integrationsService.getSlackConfiguration();
          configData = slackConfig || null;
          break;
        }
        case 'hubspot': {
          const hubspotConfig = await integrationsService.getHubSpotConfiguration();
          configData = hubspotConfig || null;
          break;
        }
        case 'linear': {
          const linearConfig = await integrationsService.getLinearConfiguration();
          configData = linearConfig || null;
          break;
        }
        case 'shopify': {
          const shopifyConfig = await integrationsService.getShopifyConfiguration();
          configData = shopifyConfig || null;
          break;
        }
        case 'openai': {
          const openaiConfig = await integrationsService.getOpenAIConfiguration();
          configData = openaiConfig || null;
          break;
        }
        case 'dialogflow': {
          const dialogflowConfig = await integrationsService.getDialogflowConfiguration();
          configData = dialogflowConfig || null;
          break;
        }
        case 'bms': {
          const bmsConfig = await integrationsService.getBMSConfiguration();
          configData = bmsConfig || null;
          break;
        }
        case 'leadsquared': {
          const leadsquaredConfig = await integrationsService.getLeadSquaredConfiguration();
          configData = leadsquaredConfig || null;
          break;
        }
        default:
          // For generic integrations, try to get configuration
          try {
            const genericConfig = await integrationsService.getIntegrationConfiguration(
              integrationId,
            );
            configData = genericConfig || null;
          } catch (err) {
            // Configuration may not exist yet
            console.error('No configuration found for integration:', integrationId, err);
          }
      }

      setConfiguration(configData);
    } catch (err) {
      const errorMessage = 'Erro ao carregar detalhes da integração';
      setError(errorMessage);
      console.error('Error loading integration details:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [integrationId]);

  const updateConfiguration = useCallback(
    async (config: any) => {
      if (!integrationId) return;

      setSaving(true);
      try {
        // Update configuration based on integration type
        switch (integrationId) {
          case 'slack':
            await integrationsService.updateSlackConfiguration(config);
            break;
          case 'hubspot':
            await integrationsService.updateHubSpotConfiguration(config);
            break;
          case 'linear':
            await integrationsService.updateLinearConfiguration(config);
            break;
          case 'shopify':
            await integrationsService.updateShopifyConfiguration(config);
            break;
          case 'openai':
            await integrationsService.updateOpenAIConfiguration(config);
            break;
          case 'dialogflow':
            await integrationsService.updateDialogflowConfiguration(config);
            break;
          case 'bms':
            await integrationsService.updateBMSConfiguration(config);
            break;
          case 'leadsquared':
            await integrationsService.updateLeadSquaredConfiguration(config);
            break;
          default:
            await integrationsService.updateIntegrationConfiguration(integrationId, config);
        }

        toast.success('Configuração atualizada com sucesso');
        await loadDetails(); // Reload to get updated data
      } catch (err) {
        console.error('Error updating configuration:', err);
        toast.error('Erro ao atualizar configuração');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [integrationId, loadDetails],
  );

  const disconnect = useCallback(async () => {
    if (!integrationId) return;

    try {
      // Special handling for OAuth integrations
      if (['slack', 'hubspot', 'linear', 'shopify'].includes(integrationId)) {
        await integrationsService.deleteIntegration(integrationId);
      } else {
        await integrationsService.toggleIntegration(integrationId, false);
      }

      toast.success('Integração desconectada com sucesso');
      await loadDetails();
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      toast.error('Erro ao desconectar integração');
      throw err;
    }
  }, [integrationId, loadDetails]);

  const reconnect = useCallback(async () => {
    if (!integrationId || !integration) return;

    try {
      if (integration.action && integration.action.startsWith('http')) {
        // OAuth flow - redirect to provider
        window.location.href = integration.action;
      } else {
        await integrationsService.toggleIntegration(integrationId, true);
        toast.success('Integração reconectada com sucesso');
        await loadDetails();
      }
    } catch (err) {
      console.error('Error reconnecting integration:', err);
      toast.error('Erro ao reconectar integração');
      throw err;
    }
  }, [integrationId, integration, loadDetails]);

  const testConnection = useCallback(async () => {
    if (!integrationId) return;

    try {
      await integrationsService.testIntegration(integrationId);
      toast.success('Teste de conexão realizado com sucesso');
    } catch (err) {
      console.error('Error testing integration:', err);
      toast.error('Erro ao testar conexão');
      throw err;
    }
  }, [integrationId]);

  useEffect(() => {
    if (autoLoad) {
      loadDetails();
    }
  }, [autoLoad, loadDetails]);

  return {
    integration,
    configuration,
    loading,
    saving,
    error,
    loadDetails,
    updateConfiguration,
    disconnect,
    reconnect,
    testConnection,
  };
}
