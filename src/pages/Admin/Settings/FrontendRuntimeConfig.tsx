import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Label,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evoapi/design-system';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

function createFrontendRuntimeSchema(_t: (key: string) => string) {
  return z.object({
    RECAPTCHA_SITE_KEY: z.string().optional().nullable(),
    CLARITY_PROJECT_ID: z.string().optional().nullable(),
  });
}

type FrontendRuntimeFormData = z.infer<ReturnType<typeof createFrontendRuntimeSchema>>;

const DEFAULTS: FrontendRuntimeFormData = {
  RECAPTCHA_SITE_KEY: '',
  CLARITY_PROJECT_ID: '',
};

function buildFormValues(data: Record<string, unknown>): FrontendRuntimeFormData {
  return {
    RECAPTCHA_SITE_KEY: (data.RECAPTCHA_SITE_KEY as string) ?? '',
    CLARITY_PROJECT_ID: (data.CLARITY_PROJECT_ID as string) ?? '',
  };
}

export default function FrontendRuntimeConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const schema = useMemo(() => createFrontendRuntimeSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FrontendRuntimeFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminConfigService.getConfig('frontend_runtime');
      reset(buildFormValues(data));
    } catch {
      toast.error(t('frontendRuntime.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [reset, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmit = async (formData: FrontendRuntimeFormData) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        RECAPTCHA_SITE_KEY: formData.RECAPTCHA_SITE_KEY || '',
        CLARITY_PROJECT_ID: formData.CLARITY_PROJECT_ID || '',
      };

      const data = await adminConfigService.saveConfig('frontend_runtime', payload as AdminConfigData);
      reset(buildFormValues(data));
      toast.success(t('frontendRuntime.messages.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('frontendRuntime.messages.saveError'), {
        description: errorInfo.message,
      });
    } finally {
      setSaving(false);
    }
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
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('frontendRuntime.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('frontendRuntime.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('frontendRuntime.fields.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="RECAPTCHA_SITE_KEY">{t('frontendRuntime.fields.recaptchaSiteKey')}</Label>
              <Input
                id="RECAPTCHA_SITE_KEY"
                placeholder={t('frontendRuntime.placeholders.recaptchaSiteKey')}
                {...register('RECAPTCHA_SITE_KEY')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="CLARITY_PROJECT_ID">{t('frontendRuntime.fields.clarityProjectId')}</Label>
              <Input
                id="CLARITY_PROJECT_ID"
                placeholder={t('frontendRuntime.placeholders.clarityProjectId')}
                {...register('CLARITY_PROJECT_ID')}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? t('frontendRuntime.saving') : t('frontendRuntime.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
