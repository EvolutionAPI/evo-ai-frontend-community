import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Switch,
  Textarea,
  Checkbox,
  Card
} from '@evoapi/design-system';
import { Globe, AlertCircle } from 'lucide-react';
import { Webhook } from '@/types/integrations';

interface WebhookModalProps {
  webhook?: Webhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isNew?: boolean;
  loading?: boolean;
}

const EVENT_IDS = [
  // Conversation Events
  'conversation_created',
  'conversation_updated',
  'conversation_status_changed',
  'conversation_typing_on',
  'conversation_typing_off',
  // Contact Events
  'contact_created',
  'contact_updated',
  // Message Events
  'message_created',
  'message_updated',
  // Inbox Events
  'inbox_created',
  'inbox_updated',
  // Webwidget Events
  'webwidget_triggered',
  // Pipeline Item Events
  'pipeline_item.created',
  'pipeline_item.updated',
  'pipeline_item.completed',
  'pipeline_item.cancelled',
  // Pipeline Task Events
  'pipeline_task.created',
  'pipeline_task.updated',
  'pipeline_task.completed',
  'pipeline_task.overdue',
  'pipeline_task.cancelled'
];

export default function WebhookModal({ webhook, open, onOpenChange, onSubmit, loading: submitting = false }: WebhookModalProps) {
  const { t } = useLanguage('integrations');

  const AVAILABLE_EVENTS = EVENT_IDS.map(id => ({
    id,
    name: t(`webhooks.modal.eventTypes.${id}.name`),
    description: t(`webhooks.modal.eventTypes.${id}.description`)
  }));

  const [formData, setFormData] = useState({
    url: '',
    enabled: true,
    subscriptions: [] as string[],
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (webhook) {
      setFormData({
        url: webhook.url || '',
        enabled: webhook.enabled ?? true,
        subscriptions: webhook.subscriptions || [],
        description: webhook.description || ''
      });
    } else {
      setFormData({
        url: '',
        enabled: true,
        subscriptions: [],
        description: ''
      });
    }
    setErrors({});
  }, [webhook, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.url.trim()) {
      newErrors.url = t('webhooks.modal.fields.url.required');
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = t('webhooks.modal.fields.url.invalid');
    }

    if (formData.subscriptions.length === 0) {
      newErrors.subscriptions = t('webhooks.modal.fields.subscriptions.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch {
      // Error is handled by parent component
    }
  };

  const handleEventToggle = (eventId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subscriptions: checked
        ? [...prev.subscriptions, eventId]
        : prev.subscriptions.filter(id => id !== eventId)
    }));
  };

  const handleSelectAll = () => {
    const allEventIds = AVAILABLE_EVENTS.map(e => e.id);
    const allSelected = allEventIds.every(id => formData.subscriptions.includes(id));

    setFormData(prev => ({
      ...prev,
      subscriptions: allSelected ? [] : allEventIds
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {webhook ? t('webhooks.modal.updateTitle') : t('webhooks.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {/* Basic Configuration */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">{t('webhooks.modal.basicConfig')}</h4>

              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('webhooks.modal.fields.url.label')} *
                  </label>
                  <Input
                    id="url"
                    placeholder={t('webhooks.modal.fields.url.placeholder')}
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className={errors.url ? 'border-red-500' : ''}
                  />
                  {errors.url && (
                    <p className="text-sm text-red-600 mt-1">{errors.url}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {t('webhooks.modal.fields.url.hint')}
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('webhooks.modal.fields.description.label')}
                  </label>
                  <Textarea
                    id="description"
                    placeholder={t('webhooks.modal.fields.description.placeholder')}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('webhooks.modal.fields.enabled.label')}
                    </span>
                    <p className="text-xs text-slate-500">
                      {t('webhooks.modal.fields.enabled.description')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            </Card>

            {/* Events Configuration */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{t('webhooks.modal.events')}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {AVAILABLE_EVENTS.every(e => formData.subscriptions.includes(e.id))
                    ? t('webhooks.modal.eventList.deselectAll')
                    : t('webhooks.modal.eventList.selectAll')}
                </Button>
              </div>

              {errors.subscriptions && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                      {errors.subscriptions}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Checkbox
                      id={event.id}
                      checked={formData.subscriptions.includes(event.id)}
                      onCheckedChange={(checked) => handleEventToggle(event.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={event.id} className="font-medium cursor-pointer block">
                        {event.name}
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Info Box */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{t('webhooks.modal.info.title')}</strong> {t('webhooks.modal.info.description')}
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 px-6 pb-6 border-t mt-4 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('webhooks.modal.actions.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('webhooks.modal.actions.saving') : (webhook ? t('webhooks.modal.actions.update') : t('webhooks.modal.actions.create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
