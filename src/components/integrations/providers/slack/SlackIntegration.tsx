import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, Button, Badge, Input, Switch } from '@evoapi/design-system';
import { Users, Hash, Bell, Settings, AlertCircle } from 'lucide-react';
import { IntegrationHeader, IntegrationStatus, IntegrationActions } from '../../base';
import { Integration, SlackConfiguration } from '@/types/integrations';
import { integrationsService } from '@/services/integrations';
import { toast } from 'sonner';

interface SlackIntegrationProps {
  integration: Integration;
  onBack: () => void;
}

export default function SlackIntegration({ integration, onBack }: SlackIntegrationProps) {
  const { t } = useLanguage('integrations');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SlackConfiguration | null>(null);
  const [formData, setFormData] = useState({
    webhook_url: '',
    reference_id: '',
    flag_reference_id: false,
    enable_notifications: true,
    selected_channels: [] as string[],
  });

  useEffect(() => {
    loadSlackConfiguration();
  }, []);

  const loadSlackConfiguration = async () => {
    setLoading(true);
    try {
      const config = await integrationsService.getSlackConfiguration();
      if (config) {
        setConfig(config);
        setFormData({
          webhook_url: config.webhook_url || '',
          reference_id: config.reference_id || '',
          flag_reference_id: config.flag_reference_id || false,
          enable_notifications: config.enable_notifications ?? true,
          selected_channels: config.selected_channels || [],
        });
      }
    } catch (error) {
      console.error('Error loading Slack configuration:', error);
      toast.error(t('slack.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await integrationsService.updateSlackConfiguration(formData);
      toast.success(t('slack.messages.saveSuccess'));
      await loadSlackConfiguration();
    } catch (error) {
      console.error('Error saving Slack configuration:', error);
      toast.error(t('slack.messages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await integrationsService.deleteIntegration('slack');
      toast.success(t('slack.messages.disconnectSuccess'));
      onBack();
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast.error(t('slack.messages.disconnectError'));
    }
  };

  const getStatusType = () => {
    if (!integration.enabled) return 'disconnected';
    if (!config?.webhook_url) return 'pending';
    return 'connected';
  };

  const getConnectionInfo = () => {
    if (!config) return undefined;

    return {
      account: config.team_name,
      workspace: config.channel_name,
      permissions: ['messages:read', 'messages:write', 'channels:read'],
    };
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-6 w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <IntegrationHeader
        integration={integration}
        onBack={onBack}
        subtitle={t('slack.subtitle')}
        onExternalLink={() => window.open('https://slack.com', '_blank')}
      >
        <IntegrationActions
          integration={integration}
          onToggle={integration.enabled ? handleDisconnect : undefined}
          isProcessing={saving}
        />
      </IntegrationHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h3 className="text-lg font-semibold">{t('slack.configuration.title')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="webhook_url"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('slack.configuration.webhookUrl.label')} *
                </label>
                <Input
                  id="webhook_url"
                  placeholder={t('slack.configuration.webhookUrl.placeholder')}
                  value={formData.webhook_url}
                  onChange={e => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  disabled={!integration.enabled}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('slack.configuration.webhookUrl.hint')}
                </p>
              </div>

              <div>
                <label
                  htmlFor="reference_id"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t('slack.configuration.referenceId.label')}
                </label>
                <Input
                  id="reference_id"
                  placeholder={t('slack.configuration.referenceId.placeholder')}
                  value={formData.reference_id}
                  onChange={e => setFormData(prev => ({ ...prev, reference_id: e.target.value }))}
                  disabled={!integration.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('slack.configuration.flagReferenceId.label')}
                  </span>
                  <p className="text-xs text-slate-500">
                    {t('slack.configuration.flagReferenceId.description')}
                  </p>
                </div>
                <Switch
                  checked={formData.flag_reference_id}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, flag_reference_id: checked }))
                  }
                  disabled={!integration.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('slack.configuration.enableNotifications.label')}
                  </span>
                  <p className="text-xs text-slate-500">
                    {t('slack.configuration.enableNotifications.description')}
                  </p>
                </div>
                <Switch
                  checked={formData.enable_notifications}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, enable_notifications: checked }))
                  }
                  disabled={!integration.enabled}
                />
              </div>
            </div>

            {integration.enabled && (
              <div className="flex justify-end pt-4 border-t mt-6">
                <Button onClick={handleSave} disabled={saving || !formData.webhook_url}>
                  {saving ? t('slack.configuration.saving') : t('slack.configuration.saveButton')}
                </Button>
              </div>
            )}
          </Card>

          {/* Channel Configuration */}
          {config && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5" />
                <h3 className="text-lg font-semibold">{t('slack.channels.title')}</h3>
              </div>

              <div className="space-y-3">
                {config.available_channels?.map(channel => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-medium">{channel.name}</div>
                        <div className="text-xs text-slate-500">
                          {channel.is_private
                            ? t('slack.channels.private')
                            : t('slack.channels.public')}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.selected_channels.includes(channel.id)}
                      onCheckedChange={checked => {
                        setFormData(prev => ({
                          ...prev,
                          selected_channels: checked
                            ? [...prev.selected_channels, channel.id]
                            : prev.selected_channels.filter(id => id !== channel.id),
                        }));
                      }}
                      disabled={!integration.enabled}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <IntegrationStatus
            status={getStatusType()}
            connection={getConnectionInfo()}
            lastSyncAt={config?.updated_at}
            onRefresh={loadSlackConfiguration}
            onReconnect={() => (window.location.href = integration.action || '')}
            errorMessage={!config?.webhook_url ? t('slack.status.errorMessage') : undefined}
          />

          {/* Stats */}
          {config && (
            <Card className="p-4">
              <h4 className="font-semibold mb-3">{t('slack.stats.title')}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{t('slack.stats.members')}</span>
                  </div>
                  <span className="font-medium">{config.member_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{t('slack.stats.channels')}</span>
                  </div>
                  <span className="font-medium">{config.available_channels?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{t('slack.stats.notifications')}</span>
                  </div>
                  <Badge variant={formData.enable_notifications ? 'success' : 'secondary'}>
                    {formData.enable_notifications
                      ? t('slack.stats.active')
                      : t('slack.stats.inactive')}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Help */}
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">{t('slack.help.title')}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t('slack.help.step1')}
                  <br />
                  {t('slack.help.step2')}
                  <br />
                  {t('slack.help.step3')}
                  <br />
                  {t('slack.help.step4')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
