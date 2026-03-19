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
import { IntegrationHook } from '@/types/integrations';

import IntegrationBackButton from '../shared/IntegrationBackButton';

interface GenericIntegrationSettingsProps {
  appId: string;
  displayName: string;
  description: string;
  icon: LucideIcon;
  configComponent: React.ComponentType<{
    hook?: IntegrationHook;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    isNew?: boolean;
    loading?: boolean;
  }>;
  onBack?: () => void;
}

export default function GenericIntegrationSettings({
  appId,
  displayName,
  description,
  icon: Icon,
  configComponent: ConfigComponent,
  onBack,
}: GenericIntegrationSettingsProps) {
  const { t } = useLanguage('integrations');
  const [hook, setHook] = useState<IntegrationHook | null>(null);
  const [loading, setLoading] = useState({
    get: false,
    create: false,
    update: false,
    delete: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const hasLoaded = useRef(false);

  // Load integration hook
  const loadIntegrationHook = useCallback(async () => {
    setLoading(prev => ({ ...prev, get: true }));

    try {
      const hookData = await integrationsService.getIntegrationHook(appId);
      setHook(hookData);
    } catch (error) {
      console.error(`Error loading ${appId} hook:`, error);
      toast.error(t('genericSettings.messages.loadError', { name: displayName }));
    } finally {
      setLoading(prev => ({ ...prev, get: false }));
    }
  }, [appId, displayName, t]);

  // Initial load
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadIntegrationHook();
    }
  }, [loadIntegrationHook]);

  // Handlers
  const handleConfigure = () => {
    setConfigModalOpen(true);
  };

  const handleDeleteIntegration = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfigFormSubmit = async (data: Record<string, unknown>) => {
    setLoading(prev => ({ ...prev, [hook ? 'update' : 'create']: true }));

    try {
      if (hook) {
        // Update existing hook
        await integrationsService.updateIntegrationHook(hook.id, data);
        toast.success(t('genericSettings.messages.updateSuccess', { name: displayName }));
      } else {
        // Create new hook
        await integrationsService.createIntegrationHook(appId, data);
        toast.success(t('genericSettings.messages.createSuccess', { name: displayName }));
      }

      // Reload hook data
      await loadIntegrationHook();

      // Close modal
      setConfigModalOpen(false);
    } catch (error) {
      console.error(`Error saving ${appId} config:`, error);
      toast.error(
        hook
          ? t('genericSettings.messages.updateError', { name: displayName })
          : t('genericSettings.messages.createError', { name: displayName }),
      );
    } finally {
      setLoading(prev => ({ ...prev, create: false, update: false }));
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!hook) return;

    setLoading(prev => ({ ...prev, delete: true }));

    try {
      await integrationsService.deleteIntegrationHook(hook.id);
      toast.success(t('genericSettings.messages.deleteSuccess', { name: displayName }));

      // Clear hook state
      setHook(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(`Error deleting ${appId} hook:`, error);
      toast.error(t('genericSettings.messages.deleteError', { name: displayName }));
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleConfigModalClose = (open: boolean) => {
    if (!open) {
      setConfigModalOpen(false);
    }
  };

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
                {t('genericSettings.title', { name: displayName })}
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
            <div className="text-muted-foreground">{t('genericSettings.loadingConfig')}</div>
          </div>
        ) : (
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex h-16 w-16 items-center justify-center mr-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium mb-1">{displayName}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
              <div className="flex items-center gap-3">
                {hook ? (
                  <>
                    <Button variant="outline" onClick={handleConfigure}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('genericSettings.configure')}
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteIntegration}>
                      {t('genericSettings.disconnect')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleConfigure}>{t('genericSettings.connect')}</Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('genericSettings.dialog.deleteTitle', { name: displayName })}
            </DialogTitle>
            <DialogDescription>
              {t('genericSettings.dialog.deleteDescription', { name: displayName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading.delete}
            >
              {t('genericSettings.dialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading.delete}>
              {loading.delete
                ? t('genericSettings.dialog.removing')
                : t('genericSettings.dialog.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <ConfigComponent
        hook={hook || undefined}
        open={configModalOpen}
        onOpenChange={handleConfigModalClose}
        onSubmit={handleConfigFormSubmit}
        isNew={!hook}
        loading={loading.create || loading.update}
      />
    </div>
  );
}
