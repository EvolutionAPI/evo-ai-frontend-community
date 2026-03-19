import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
} from '@evoapi/design-system';
import { Settings, LucideIcon } from 'lucide-react';

import { integrationsService } from '@/services/integrations';
import { Integration } from '@/types/integrations';

import IntegrationBackButton from '../shared/IntegrationBackButton';

interface OAuthIntegrationSettingsProps {
  integrationId: string;
  displayName: string;
  description: string;
  icon: LucideIcon;
  onBack?: () => void;
}

export default function OAuthIntegrationSettings({
  integrationId,
  displayName,
  description,
  icon: Icon,
  onBack,
}: OAuthIntegrationSettingsProps) {
  const { t } = useLanguage('integrations');
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState({
    get: false,
    delete: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const hasLoaded = useRef(false);

  // Load integration
  const loadIntegration = useCallback(async () => {
    setLoading(prev => ({ ...prev, get: true }));

    try {
      const integration = await integrationsService.getIntegration(integrationId);
      setIntegration(integration);
    } catch (error) {
      console.error(`Error loading ${integrationId} integration:`, error);
      toast.error(t('oauthSettings.messages.loadError', { name: displayName }));
    } finally {
      setLoading(prev => ({ ...prev, get: false }));
    }
  }, [integrationId, displayName, t]);

  // Initial load
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadIntegration();
    }
  }, [loadIntegration]);

  // Handlers
  const handleConnect = () => {
    if (!integration?.action) return;

    // OAuth integrations use an action URL for connection
    window.location.href = integration.action;
  };

  const handleConfigure = () => {
    // For OAuth integrations, this typically redirects to a configuration page
    // or opens a modal with additional settings
    toast.info(t('oauthSettings.configInDev'));
  };

  const handleDisconnect = () => {
    setDeleteDialogOpen(true);
  };

  // Confirm disconnect
  const confirmDisconnect = async () => {
    if (!integration) return;

    setLoading(prev => ({ ...prev, delete: true }));

    try {
      await integrationsService.deleteIntegration(integrationId);
      toast.success(t('oauthSettings.messages.disconnectSuccess', { name: displayName }));

      // Reload integration state
      await loadIntegration();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(`Error disconnecting ${integrationId}:`, error);
      toast.error(t('oauthSettings.messages.disconnectError', { name: displayName }));
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const integrationAction = integration?.enabled ? 'disconnect' : integration?.action;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none p-4 pb-0">
        <div className="flex items-center gap-4 mb-6">
          <IntegrationBackButton onBack={onBack} />
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">
                {t('oauthSettings.title', { name: displayName })}
              </h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 mt-6">
        {loading.get ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">{t('oauthSettings.loadingConfig')}</div>
          </div>
        ) : (
          integration && (
            <Card className="p-4">
              <div className="flex items-center">
                <div className="flex h-16 w-16 items-center justify-center mr-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-1">{integration.name || displayName}</h3>
                  <p className="text-muted-foreground text-sm">
                    {integration.description || description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {integration.enabled ? (
                    <>
                      {integrationAction !== 'disconnect' && (
                        <Button variant="outline" onClick={handleConfigure}>
                          <Settings className="w-4 h-4 mr-2" />
                          {t('oauthSettings.configure')}
                        </Button>
                      )}
                      <Button variant="destructive" onClick={handleDisconnect}>
                        {t('oauthSettings.disconnect')}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleConnect}>{t('oauthSettings.connect')}</Button>
                  )}
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Disconnect Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('oauthSettings.dialog.disconnectTitle', { name: displayName })}
            </DialogTitle>
            <DialogDescription>
              {t('oauthSettings.dialog.disconnectDescription', { name: displayName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading.delete}
            >
              {t('oauthSettings.dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDisconnect} disabled={loading.delete}>
              {loading.delete
                ? t('oauthSettings.dialog.disconnecting')
                : t('oauthSettings.dialog.disconnect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
