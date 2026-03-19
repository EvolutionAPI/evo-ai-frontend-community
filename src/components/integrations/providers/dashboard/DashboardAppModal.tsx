import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card
} from '@evoapi/design-system';
import { Monitor, AlertCircle } from 'lucide-react';
import { DashboardApp, DashboardAppFormData } from '@/types/integrations';

interface DashboardAppModalProps {
  app?: DashboardApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DashboardAppFormData) => Promise<void>;
  isNew?: boolean;
  loading?: boolean;
}


export default function DashboardAppModal({
  app,
  open,
  onOpenChange,
  onSubmit,
  loading: submitting = false
}: DashboardAppModalProps) {
  const { t } = useLanguage('integrations');

  const [formData, setFormData] = useState<DashboardAppFormData>({
    title: '',
    content: {
      type: 'frame',
      url: ''
    },
    display_type: 'conversation',
    sidebar_menu: 'conversations',
    sidebar_position: 'after'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (app) {
      setFormData({
        title: app.title || '',
        content: {
          type: 'frame',
          url: (Array.isArray(app.content) ? app.content[0]?.url : (app.content as { url?: string })?.url) || ''
        },
        display_type: app.display_type || 'conversation',
        sidebar_menu: app.sidebar_menu || 'conversations',
        sidebar_position: app.sidebar_position || 'after'
      });
    } else {
      setFormData({
        title: '',
        content: {
          type: 'frame',
          url: ''
        },
        display_type: 'conversation',
        sidebar_menu: 'conversations',
        sidebar_position: 'after'
      });
    }
    setErrors({});
  }, [app, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('dashboardApps.modal.fields.title.required');
    }

    if (!formData.content.url.trim()) {
      newErrors.url = t('dashboardApps.modal.fields.url.required');
    } else if (!isValidUrl(formData.content.url)) {
      newErrors.url = t('dashboardApps.modal.fields.url.invalid');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            {app ? t('dashboardApps.modal.updateTitle') : t('dashboardApps.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('dashboardApps.modal.basicInfo')}</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('dashboardApps.modal.fields.title.label')} *
                </label>
                <Input
                  id="title"
                  placeholder={t('dashboardApps.modal.fields.title.placeholder')}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('dashboardApps.modal.fields.url.label')} *
                </label>
                <Input
                  id="url"
                  placeholder={t('dashboardApps.modal.fields.url.placeholder')}
                  value={formData.content.url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, url: e.target.value }
                  }))}
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && (
                  <p className="text-sm text-red-600 mt-1">{errors.url}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {t('dashboardApps.modal.fields.url.hint')}
                </p>
              </div>
            </div>
          </Card>

          {/* Display Configuration */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('dashboardApps.modal.displayConfig')}</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="display_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('dashboardApps.modal.fields.displayType.label')} *
                </label>
                <Select
                  value={formData.display_type}
                  onValueChange={(value: 'conversation' | 'sidebar') =>
                    setFormData(prev => ({ ...prev, display_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversation">
                      <div className="flex flex-col">
                        <span className="font-medium">{t('dashboardApps.modal.fields.displayType.conversation')}</span>
                        <span className="text-xs text-slate-500">{t('dashboardApps.modal.fields.displayType.conversationDescription')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sidebar">
                      <div className="flex flex-col">
                        <span className="font-medium">{t('dashboardApps.modal.fields.displayType.sidebar')}</span>
                        <span className="text-xs text-slate-500">{t('dashboardApps.modal.fields.displayType.sidebarDescription')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.display_type === 'sidebar' && (
                <>
                  <div>
                    <label htmlFor="sidebar_menu" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('dashboardApps.modal.fields.sidebarMenu.label')}
                    </label>
                    <Select
                      value={formData.sidebar_menu}
                      onValueChange={(value) =>
                        setFormData(prev => ({ ...prev, sidebar_menu: value as 'conversations' | 'contacts' | 'campaigns' | 'automation' | 'reports' | 'settings' }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversations">{t('dashboardApps.modal.fields.sidebarMenu.conversations')}</SelectItem>
                        <SelectItem value="contacts">{t('dashboardApps.modal.fields.sidebarMenu.contacts')}</SelectItem>
                        <SelectItem value="pipelines">{t('dashboardApps.modal.fields.sidebarMenu.pipelines')}</SelectItem>
                        <SelectItem value="campaigns">{t('dashboardApps.modal.fields.sidebarMenu.campaigns')}</SelectItem>
                        <SelectItem value="automation">{t('dashboardApps.modal.fields.sidebarMenu.automation')}</SelectItem>
                        <SelectItem value="agents">{t('dashboardApps.modal.fields.sidebarMenu.agents')}</SelectItem>
                        <SelectItem value="channels">{t('dashboardApps.modal.fields.sidebarMenu.channels')}</SelectItem>
                        <SelectItem value="settings">{t('dashboardApps.modal.fields.sidebarMenu.settings')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="sidebar_position" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('dashboardApps.modal.fields.sidebarPosition.label')}
                    </label>
                    <Select
                      value={formData.sidebar_position}
                      onValueChange={(value: 'before' | 'after') =>
                        setFormData(prev => ({ ...prev, sidebar_position: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">
                          <div className="flex flex-col">
                            <span className="font-medium">{t('dashboardApps.modal.fields.sidebarPosition.before')}</span>
                            <span className="text-xs text-slate-500">{t('dashboardApps.modal.fields.sidebarPosition.beforeDescription')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="after">
                          <div className="flex flex-col">
                            <span className="font-medium">{t('dashboardApps.modal.fields.sidebarPosition.after')}</span>
                            <span className="text-xs text-slate-500">{t('dashboardApps.modal.fields.sidebarPosition.afterDescription')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Info Box */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{t('dashboardApps.modal.info.title')}</strong> {t('dashboardApps.modal.info.description')}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('dashboardApps.modal.actions.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('dashboardApps.modal.actions.saving') : (app ? t('dashboardApps.modal.actions.update') : t('dashboardApps.modal.actions.create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
