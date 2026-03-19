import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Card,
  Switch,
  Label
} from '@evoapi/design-system';
import { MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { BMSHook, BMSFormData, IntegrationHook } from '@/types/integrations';

interface BMSModalProps {
  hook?: IntegrationHook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isNew?: boolean;
  loading?: boolean;
}

export default function BMSModal({
  hook,
  open,
  onOpenChange,
  onSubmit,
  isNew: _ = false,
  loading: submitting = false
}: BMSModalProps) {
  const { t } = useLanguage('integrations');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BMSFormData>({
    api_key: '',
    enable_contact_sync: true,
    enable_label_sync: true,
    enable_custom_attributes_sync: false,
    enable_campaign_sync: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const bmsHook = hook as BMSHook | undefined;
    if (bmsHook?.settings) {
      setFormData({
        api_key: bmsHook.settings.api_key || '',
        enable_contact_sync: bmsHook.settings.enable_contact_sync ?? true,
        enable_label_sync: bmsHook.settings.enable_label_sync ?? true,
        enable_custom_attributes_sync: bmsHook.settings.enable_custom_attributes_sync ?? false,
        enable_campaign_sync: bmsHook.settings.enable_campaign_sync ?? false,
      });
    } else {
      setFormData({
        api_key: '',
        enable_contact_sync: true,
        enable_label_sync: true,
        enable_custom_attributes_sync: false,
        enable_campaign_sync: false,
      });
    }
    setErrors({});
  }, [hook, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.api_key.trim()) {
      newErrors.api_key = t('bms.modal.fields.apiKey.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData as unknown as Record<string, unknown>);
    } catch {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const openBMSDoc = () => {
    window.open('https://docs.brius.com/api', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {hook ? t('bms.modal.updateTitle') : t('bms.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Description */}
          <div className="text-sm text-muted-foreground">
            {t('bms.modal.description')}
          </div>

          {/* API Configuration */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('bms.modal.apiConfig')}</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('bms.modal.fields.apiKey.label')} *
                </label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder={t('bms.modal.fields.apiKey.placeholder')}
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  className={errors.api_key ? 'border-red-500' : ''}
                />
                {errors.api_key && (
                  <p className="text-sm text-red-600 mt-1">{errors.api_key}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {t('bms.modal.fields.apiKey.hint')}
                </p>
              </div>
            </div>
          </Card>

          {/* Sync Options */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('bms.modal.syncOptions')}</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_contact_sync">{t('bms.modal.fields.contactSync.label')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('bms.modal.fields.contactSync.description')}
                  </p>
                </div>
                <Switch
                  id="enable_contact_sync"
                  checked={formData.enable_contact_sync}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_contact_sync: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_label_sync">{t('bms.modal.fields.labelSync.label')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('bms.modal.fields.labelSync.description')}
                  </p>
                </div>
                <Switch
                  id="enable_label_sync"
                  checked={formData.enable_label_sync}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_label_sync: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_custom_attributes_sync">{t('bms.modal.fields.customAttributesSync.label')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('bms.modal.fields.customAttributesSync.description')}
                  </p>
                </div>
                <Switch
                  id="enable_custom_attributes_sync"
                  checked={formData.enable_custom_attributes_sync}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_custom_attributes_sync: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_campaign_sync">{t('bms.modal.fields.campaignSync.label')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('bms.modal.fields.campaignSync.description')}
                  </p>
                </div>
                <Switch
                  id="enable_campaign_sync"
                  checked={formData.enable_campaign_sync}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_campaign_sync: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* Features Info */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">
              {t('bms.modal.features.title')}
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li>• {t('bms.modal.features.bidirectionalSync')}</li>
              <li>• {t('bms.modal.features.labelSync')}</li>
              <li>• {t('bms.modal.features.customAttributes')}</li>
              <li>• {t('bms.modal.features.campaignSync')}</li>
              <li>• {t('bms.modal.features.centralizedHistory')}</li>
            </ul>
          </Card>

          {/* Security Warning */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>{t('bms.modal.security.title')}</strong> {t('bms.modal.security.description')}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={openBMSDoc}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t('bms.modal.actions.documentation')}
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('bms.modal.actions.cancel')}
              </Button>
              <Button type="submit" disabled={loading || submitting}>
                {loading || submitting ? t('bms.modal.actions.saving') : (hook ? t('bms.modal.actions.update') : t('bms.modal.actions.configure'))}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
