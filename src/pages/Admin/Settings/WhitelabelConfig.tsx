import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Switch,
} from '@evoapi/design-system';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

// --- Schema factory with i18n ---

function createWhitelabelSchema(t: (key: string) => string) {
  return z.object({
    WHITELABEL_ENABLED: z.union([z.boolean(), z.string()]).optional(),
    WHITELABEL_LOGO_LIGHT: z.string().optional(),
    WHITELABEL_LOGO_DARK: z.string().optional(),
    WHITELABEL_PRIMARY_COLOR_LIGHT: z.string().optional(),
    WHITELABEL_PRIMARY_COLOR_DARK: z.string().optional(),
    WHITELABEL_PRIMARY_FOREGROUND_LIGHT: z.string().optional(),
    WHITELABEL_PRIMARY_FOREGROUND_DARK: z.string().optional(),
    WHITELABEL_COMPANY_NAME: z.string().optional(),
    WHITELABEL_SYSTEM_NAME: z.string().optional(),
    WHITELABEL_TERMS_OF_SERVICE_URL: z.string().url(t('whitelabel.validation.invalidUrl')).or(z.literal('')).optional(),
    WHITELABEL_PRIVACY_POLICY_URL: z.string().url(t('whitelabel.validation.invalidUrl')).or(z.literal('')).optional(),
  });
}

type WhitelabelFormData = z.infer<ReturnType<typeof createWhitelabelSchema>>;

const DEFAULTS: WhitelabelFormData = {
  WHITELABEL_ENABLED: false,
  WHITELABEL_LOGO_LIGHT: '',
  WHITELABEL_LOGO_DARK: '',
  WHITELABEL_PRIMARY_COLOR_LIGHT: '',
  WHITELABEL_PRIMARY_COLOR_DARK: '',
  WHITELABEL_PRIMARY_FOREGROUND_LIGHT: '',
  WHITELABEL_PRIMARY_FOREGROUND_DARK: '',
  WHITELABEL_COMPANY_NAME: '',
  WHITELABEL_SYSTEM_NAME: '',
  WHITELABEL_TERMS_OF_SERVICE_URL: '',
  WHITELABEL_PRIVACY_POLICY_URL: '',
};

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
}

function buildFormValues(data: Record<string, unknown>): WhitelabelFormData {
  const formValues: Record<string, unknown> = { ...DEFAULTS };
  for (const [key, value] of Object.entries(data)) {
    formValues[key] = value ?? formValues[key] ?? '';
  }
  return formValues as WhitelabelFormData;
}

export default function WhitelabelConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const whitelabelSchema = useMemo(() => createWhitelabelSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<WhitelabelFormData>({
    resolver: zodResolver(whitelabelSchema),
    defaultValues: DEFAULTS,
  });

  const enabled = toBool(watch('WHITELABEL_ENABLED'));

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminConfigService.getConfig('whitelabel');
      reset(buildFormValues(data));
    } catch (error) {
      toast.error(t('whitelabel.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [reset, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmit = async (formData: WhitelabelFormData) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...formData };

      const data = await adminConfigService.saveConfig('whitelabel', payload as AdminConfigData);
      reset(buildFormValues(data));

      toast.success(t('whitelabel.messages.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('whitelabel.messages.saveError'), {
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
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('whitelabel.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('whitelabel.description')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Enable/Disable */}
        <Card>
          <CardContent className="pt-6">
            <Controller
              name="WHITELABEL_ENABLED"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="WHITELABEL_ENABLED">
                      {t('whitelabel.fields.enabled')}
                    </Label>
                    <p className="text-xs text-sidebar-foreground/50 mt-0.5">
                      {t('whitelabel.fields.enabledDescription')}
                    </p>
                  </div>
                  <Switch
                    id="WHITELABEL_ENABLED"
                    checked={toBool(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Logos */}
        <Card className={!enabled ? 'opacity-50' : ''} {...(!enabled ? { inert: true as unknown as '' } : {})}>
          <CardHeader>
            <CardTitle className="text-base">{t('whitelabel.sections.logos')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_LOGO_LIGHT">{t('whitelabel.fields.logoLight')}</Label>
              <Input
                id="WHITELABEL_LOGO_LIGHT"
                placeholder={t('whitelabel.placeholders.logoLight')}
                {...register('WHITELABEL_LOGO_LIGHT')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_LOGO_DARK">{t('whitelabel.fields.logoDark')}</Label>
              <Input
                id="WHITELABEL_LOGO_DARK"
                placeholder={t('whitelabel.placeholders.logoDark')}
                {...register('WHITELABEL_LOGO_DARK')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className={!enabled ? 'opacity-50' : ''} {...(!enabled ? { inert: true as unknown as '' } : {})}>
          <CardHeader>
            <CardTitle className="text-base">{t('whitelabel.sections.colors')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="WHITELABEL_PRIMARY_COLOR_LIGHT">{t('whitelabel.fields.primaryColorLight')}</Label>
                <Input
                  id="WHITELABEL_PRIMARY_COLOR_LIGHT"
                  placeholder="#3B82F6"
                  {...register('WHITELABEL_PRIMARY_COLOR_LIGHT')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="WHITELABEL_PRIMARY_COLOR_DARK">{t('whitelabel.fields.primaryColorDark')}</Label>
                <Input
                  id="WHITELABEL_PRIMARY_COLOR_DARK"
                  placeholder="#60A5FA"
                  {...register('WHITELABEL_PRIMARY_COLOR_DARK')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="WHITELABEL_PRIMARY_FOREGROUND_LIGHT">{t('whitelabel.fields.foregroundLight')}</Label>
                <Input
                  id="WHITELABEL_PRIMARY_FOREGROUND_LIGHT"
                  placeholder="#FFFFFF"
                  {...register('WHITELABEL_PRIMARY_FOREGROUND_LIGHT')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="WHITELABEL_PRIMARY_FOREGROUND_DARK">{t('whitelabel.fields.foregroundDark')}</Label>
                <Input
                  id="WHITELABEL_PRIMARY_FOREGROUND_DARK"
                  placeholder="#FFFFFF"
                  {...register('WHITELABEL_PRIMARY_FOREGROUND_DARK')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding Text */}
        <Card className={!enabled ? 'opacity-50' : ''} {...(!enabled ? { inert: true as unknown as '' } : {})}>
          <CardHeader>
            <CardTitle className="text-base">{t('whitelabel.sections.branding')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_COMPANY_NAME">{t('whitelabel.fields.companyName')}</Label>
              <Input
                id="WHITELABEL_COMPANY_NAME"
                placeholder={t('whitelabel.placeholders.companyName')}
                {...register('WHITELABEL_COMPANY_NAME')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_SYSTEM_NAME">{t('whitelabel.fields.systemName')}</Label>
              <Input
                id="WHITELABEL_SYSTEM_NAME"
                placeholder={t('whitelabel.placeholders.systemName')}
                {...register('WHITELABEL_SYSTEM_NAME')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal URLs */}
        <Card className={!enabled ? 'opacity-50' : ''} {...(!enabled ? { inert: true as unknown as '' } : {})}>
          <CardHeader>
            <CardTitle className="text-base">{t('whitelabel.sections.legal')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_TERMS_OF_SERVICE_URL">{t('whitelabel.fields.termsUrl')}</Label>
              <Input
                id="WHITELABEL_TERMS_OF_SERVICE_URL"
                placeholder="https://example.com/terms"
                {...register('WHITELABEL_TERMS_OF_SERVICE_URL')}
              />
              {errors.WHITELABEL_TERMS_OF_SERVICE_URL && (
                <p className="text-xs text-destructive">{errors.WHITELABEL_TERMS_OF_SERVICE_URL.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="WHITELABEL_PRIVACY_POLICY_URL">{t('whitelabel.fields.privacyUrl')}</Label>
              <Input
                id="WHITELABEL_PRIVACY_POLICY_URL"
                placeholder="https://example.com/privacy"
                {...register('WHITELABEL_PRIVACY_POLICY_URL')}
              />
              {errors.WHITELABEL_PRIVACY_POLICY_URL && (
                <p className="text-xs text-destructive">{errors.WHITELABEL_PRIVACY_POLICY_URL.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="pt-2">
          <Button type="submit" disabled={saving} aria-label={t('whitelabel.save')}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? t('whitelabel.saving') : t('whitelabel.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
