import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Label,
  Textarea,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evoapi/design-system';
import { toast } from 'sonner';
import { Loader2, Lock, LockOpen, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

// --- Schema factory with i18n ---

function createPushNotificationsSchema(t: (key: string) => string) {
  return z.object({
    FIREBASE_PROJECT_ID: z.string().optional().nullable(),
    FIREBASE_CREDENTIALS_SECRET: z.string().optional().nullable(),
    IOS_APP_ID: z.string().optional().nullable(),
    ANDROID_BUNDLE_ID: z.string().optional().nullable(),
  });
}

type PushNotificationsFormData = z.infer<ReturnType<typeof createPushNotificationsSchema>>;

type PushNotificationsFieldKey = keyof PushNotificationsFormData;

const DEFAULTS: PushNotificationsFormData = {
  FIREBASE_PROJECT_ID: '',
  FIREBASE_CREDENTIALS_SECRET: null,
  IOS_APP_ID: '',
  ANDROID_BUNDLE_ID: '',
};

const SECRET_FIELDS = ['FIREBASE_CREDENTIALS_SECRET'];

function isSecretMasked(value: unknown): boolean {
  return typeof value === 'string' && value.includes('••••');
}

function buildFormValues(data: Record<string, unknown>): PushNotificationsFormData {
  const formValues: Record<string, unknown> = { ...DEFAULTS };
  for (const [key, value] of Object.entries(data)) {
    if (SECRET_FIELDS.includes(key)) {
      formValues[key] = isSecretMasked(value) ? '' : (value ?? '');
    } else {
      formValues[key] = value ?? formValues[key] ?? '';
    }
  }
  return formValues as PushNotificationsFormData;
}

export default function PushNotificationsConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [secretModified, setSecretModified] = useState<Record<string, boolean>>({});
  const [secretConfigured, setSecretConfigured] = useState<Record<string, boolean>>({});

  const schema = useMemo(() => createPushNotificationsSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PushNotificationsFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const updateSecretStatus = (data: Record<string, unknown>) => {
    const configured: Record<string, boolean> = {};
    for (const key of SECRET_FIELDS) {
      configured[key] = isSecretMasked(data[key]);
    }
    setSecretConfigured(configured);
    setSecretModified({});
  };

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminConfigService.getConfig('push_notifications');
      updateSecretStatus(data);
      reset(buildFormValues(data));
    } catch (error) {
      toast.error(t('pushNotifications.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [reset, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmit = async (formData: PushNotificationsFormData) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (SECRET_FIELDS.includes(key)) {
          if (!secretModified[key] || value === '') {
            payload[key] = null;
          } else {
            payload[key] = value;
          }
        } else {
          payload[key] = value;
        }
      }

      const data = await adminConfigService.saveConfig('push_notifications', payload as AdminConfigData);
      updateSecretStatus(data);
      reset(buildFormValues(data));

      toast.success(t('pushNotifications.messages.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('pushNotifications.messages.saveError'), {
        description: errorInfo.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSecretChange = (fieldName: string, value: string) => {
    setSecretModified((prev) => ({ ...prev, [fieldName]: value.length > 0 }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await adminConfigService.testConnection('push_notifications');
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(t('pushNotifications.messages.testFailed'), { description: result.message });
      }
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('pushNotifications.messages.testFailed'), { description: errorInfo.message });
    } finally {
      setTesting(false);
    }
  };

  const handleClearSecret = (fieldName: string) => {
    setValue(fieldName as PushNotificationsFieldKey, '');
    setSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('pushNotifications.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('pushNotifications.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pushNotifications.fields.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="FIREBASE_PROJECT_ID">{t('pushNotifications.fields.projectId')}</Label>
              <Input
                id="FIREBASE_PROJECT_ID"
                placeholder={t('pushNotifications.placeholders.projectId')}
                {...register('FIREBASE_PROJECT_ID')}
              />
              {errors.FIREBASE_PROJECT_ID && (
                <p className="text-xs text-destructive">{errors.FIREBASE_PROJECT_ID.message}</p>
              )}
            </div>

            {/* Credentials JSON — secret textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="FIREBASE_CREDENTIALS_SECRET">{t('pushNotifications.fields.credentialsJson')}</Label>
                {!secretModified['FIREBASE_CREDENTIALS_SECRET'] && (
                  secretConfigured['FIREBASE_CREDENTIALS_SECRET'] ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <Lock className="h-3 w-3" />
                      {t('pushNotifications.secretConfigured')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/50">
                      <LockOpen className="h-3 w-3" />
                      {t('pushNotifications.secretNotConfigured')}
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="FIREBASE_CREDENTIALS_SECRET"
                  rows={6}
                  className="font-mono text-sm"
                  placeholder={t('pushNotifications.placeholders.credentialsJson')}
                  {...register('FIREBASE_CREDENTIALS_SECRET', {
                    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleSecretChange('FIREBASE_CREDENTIALS_SECRET', e.target.value),
                  })}
                />
                {secretConfigured['FIREBASE_CREDENTIALS_SECRET'] && !secretModified['FIREBASE_CREDENTIALS_SECRET'] && (
                  <button
                    type="button"
                    onClick={() => handleClearSecret('FIREBASE_CREDENTIALS_SECRET')}
                    className="absolute right-2 top-2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    title={t('pushNotifications.clearSecret')}
                    aria-label={t('pushNotifications.clearSecret')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="IOS_APP_ID">{t('pushNotifications.fields.iosAppId')}</Label>
              <Input
                id="IOS_APP_ID"
                placeholder={t('pushNotifications.placeholders.iosAppId')}
                {...register('IOS_APP_ID')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ANDROID_BUNDLE_ID">{t('pushNotifications.fields.androidBundleId')}</Label>
              <Input
                id="ANDROID_BUNDLE_ID"
                placeholder={t('pushNotifications.placeholders.androidBundleId')}
                {...register('ANDROID_BUNDLE_ID')}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="submit" disabled={saving || testing}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? t('pushNotifications.saving') : t('pushNotifications.save')}
              </Button>
              <Button type="button" variant="outline" onClick={handleTestConnection} disabled={saving || testing}>
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {testing ? t('pushNotifications.testing') : t('pushNotifications.testConnection')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
