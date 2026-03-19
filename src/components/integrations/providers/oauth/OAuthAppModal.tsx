import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Card
} from '@evoapi/design-system';
import { Key, AlertCircle } from 'lucide-react';
import { OAuthApplication } from '@/types/integrations';

interface OAuthAppModalProps {
  app?: OAuthApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isNew?: boolean;
  loading?: boolean;
}

const DEFAULT_SCOPES = [
  'read:conversations',
  'write:conversations',
  'read:contacts',
  'write:contacts',
  'read:messages',
  'write:messages'
];

export default function OAuthAppModal({
  app,
  open,
  onOpenChange,
  onSubmit,
  loading: submitting = false
}: OAuthAppModalProps) {
  const { t } = useLanguage('integrations');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    redirect_uri: '',
    scopes: DEFAULT_SCOPES.join(' ')
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name || '',
        redirect_uri: app.redirect_uri || '',
        scopes: (Array.isArray(app.scopes) ? app.scopes.join(' ') : app.scopes) || DEFAULT_SCOPES.join(' ')
      });
    } else {
      setFormData({
        name: '',
        redirect_uri: '',
        scopes: DEFAULT_SCOPES.join(' ')
      });
    }
    setErrors({});
  }, [app, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('oauth.modal.fields.name.required');
    }

    if (!formData.redirect_uri.trim()) {
      newErrors.redirect_uri = t('oauth.modal.fields.redirectUri.required');
    } else if (!isValidUrl(formData.redirect_uri)) {
      newErrors.redirect_uri = t('oauth.modal.fields.redirectUri.invalid');
    }

    if (!formData.scopes.trim()) {
      newErrors.scopes = t('oauth.modal.fields.scopes.required');
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

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        redirect_uri: formData.redirect_uri,
        scopes: formData.scopes.trim()
      });
    } catch {
      // Error is handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const handleScopePreset = (preset: 'read' | 'write' | 'admin') => {
    const presets = {
      read: [
        'read:conversations',
        'read:contacts',
        'read:messages',
        'read:reports'
      ],
      write: [
        'read:conversations',
        'write:conversations',
        'read:contacts',
        'write:contacts',
        'read:messages',
        'write:messages'
      ],
      admin: [
        'read:conversations',
        'write:conversations',
        'read:contacts',
        'write:contacts',
        'read:messages',
        'write:messages',
        'read:reports',
        'write:reports',
        'read:agents',
        'write:agents',
        'read:teams',
        'write:teams'
      ]
    };

    setFormData(prev => ({
      ...prev,
      scopes: presets[preset].join(' ')
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {app ? t('oauth.modal.updateTitle') : t('oauth.modal.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('oauth.modal.basicInfo')}</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('oauth.modal.fields.name.label')} *
                </label>
                <Input
                  id="name"
                  placeholder={t('oauth.modal.fields.name.placeholder')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="redirect_uri" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('oauth.modal.fields.redirectUri.label')} *
                </label>
                <Input
                  id="redirect_uri"
                  placeholder={t('oauth.modal.fields.redirectUri.placeholder')}
                  value={formData.redirect_uri}
                  onChange={(e) => setFormData(prev => ({ ...prev, redirect_uri: e.target.value }))}
                  className={errors.redirect_uri ? 'border-red-500' : ''}
                />
                {errors.redirect_uri && (
                  <p className="text-sm text-red-600 mt-1">{errors.redirect_uri}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {t('oauth.modal.fields.redirectUri.hint')}
                </p>
              </div>

            </div>
          </Card>

          {/* Scopes Configuration */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">{t('oauth.modal.scopes')}</h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="scopes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('oauth.modal.fields.scopes.label')} *
                </label>
                <Textarea
                  id="scopes"
                  placeholder={t('oauth.modal.fields.scopes.placeholder')}
                  value={formData.scopes}
                  onChange={(e) => setFormData(prev => ({ ...prev, scopes: e.target.value }))}
                  rows={3}
                  className={errors.scopes ? 'border-red-500' : ''}
                />
                {errors.scopes && (
                  <p className="text-sm text-red-600 mt-1">{errors.scopes}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {t('oauth.modal.fields.scopes.hint')}
                </p>
              </div>

              {/* Scope Presets */}
              <div>
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('oauth.modal.presets.title')}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScopePreset('read')}
                  >
                    {t('oauth.modal.presets.readOnly')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScopePreset('write')}
                  >
                    {t('oauth.modal.presets.readWrite')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScopePreset('admin')}
                  >
                    {t('oauth.modal.presets.admin')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Info */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <strong>{t('oauth.modal.security.title')}</strong> {t('oauth.modal.security.description')}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('oauth.modal.actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading || submitting}>
              {loading || submitting ? t('oauth.modal.actions.saving') : (app ? t('oauth.modal.actions.update') : t('oauth.modal.actions.create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
