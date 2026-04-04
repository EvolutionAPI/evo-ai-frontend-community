import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Label,
  Button,
  Card,
  CardContent,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@evoapi/design-system';
import { toast } from 'sonner';
import { Loader2, Lock, LockOpen, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

// --- Schema factories ---

function createFacebookSchema() {
  return z.object({
    FB_APP_ID: z.string().optional(),
    FB_VERIFY_TOKEN: z.string().optional(),
    FB_APP_SECRET: z.string().optional().nullable(),
    FACEBOOK_API_VERSION: z.string().optional(),
    ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: z.union([z.boolean(), z.string()]).optional(),
    FB_FEED_COMMENTS_ENABLED: z.union([z.boolean(), z.string()]).optional(),
  });
}

function createWhatsappSchema() {
  return z.object({
    WP_APP_ID: z.string().optional(),
    WP_VERIFY_TOKEN: z.string().optional(),
    WP_APP_SECRET: z.string().optional().nullable(),
    WP_WHATSAPP_CONFIG_ID: z.string().optional(),
    WP_API_VERSION: z.string().optional(),
  });
}

function createInstagramSchema() {
  return z.object({
    INSTAGRAM_APP_ID: z.string().optional(),
    INSTAGRAM_APP_SECRET: z.string().optional().nullable(),
    INSTAGRAM_VERIFY_TOKEN: z.string().optional(),
    INSTAGRAM_API_VERSION: z.string().optional(),
    ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: z.union([z.boolean(), z.string()]).optional(),
  });
}

type FacebookFormData = z.infer<ReturnType<typeof createFacebookSchema>>;
type WhatsAppFormData = z.infer<ReturnType<typeof createWhatsappSchema>>;
type InstagramFormData = z.infer<ReturnType<typeof createInstagramSchema>>;

const FACEBOOK_DEFAULTS: FacebookFormData = {
  FB_APP_ID: '',
  FB_VERIFY_TOKEN: '',
  FB_APP_SECRET: null,
  FACEBOOK_API_VERSION: '',
  ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: false,
  FB_FEED_COMMENTS_ENABLED: false,
};

const WHATSAPP_DEFAULTS: WhatsAppFormData = {
  WP_APP_ID: '',
  WP_VERIFY_TOKEN: '',
  WP_APP_SECRET: null,
  WP_WHATSAPP_CONFIG_ID: '',
  WP_API_VERSION: '',
};

const INSTAGRAM_DEFAULTS: InstagramFormData = {
  INSTAGRAM_APP_ID: '',
  INSTAGRAM_APP_SECRET: null,
  INSTAGRAM_VERIFY_TOKEN: '',
  INSTAGRAM_API_VERSION: '',
  ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: false,
};

// Keys with _SECRET suffix are Fernet-encrypted; API returns masked_value
const FACEBOOK_SECRET_FIELDS = ['FB_APP_SECRET'];
const WHATSAPP_SECRET_FIELDS = ['WP_APP_SECRET'];
const INSTAGRAM_SECRET_FIELDS = ['INSTAGRAM_APP_SECRET'];

const FACEBOOK_BOOLEAN_FIELDS = ['ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT', 'FB_FEED_COMMENTS_ENABLED'];
const INSTAGRAM_BOOLEAN_FIELDS = ['ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT'];

function isSecretMasked(value: unknown): boolean {
  return typeof value === 'string' && value.includes('••••');
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
}

function buildFormValues<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  defaults: T,
  secretFields: string[],
  booleanFields: string[],
): T {
  const formValues: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(data)) {
    if (secretFields.includes(key)) {
      formValues[key] = isSecretMasked(value) ? '' : (value ?? '');
    } else if (booleanFields.includes(key)) {
      formValues[key] = toBool(value);
    } else {
      formValues[key] = value ?? formValues[key] ?? '';
    }
  }
  return formValues as T;
}

function updateSecretStatus(data: Record<string, unknown>, secretFields: string[]) {
  const configured: Record<string, boolean> = {};
  for (const key of secretFields) {
    configured[key] = isSecretMasked(data[key]);
  }
  return configured;
}

function buildPayload(
  formData: Record<string, unknown>,
  secretFields: string[],
  secretModified: Record<string, boolean>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(formData)) {
    if (secretFields.includes(key)) {
      if (!secretModified[key] || value === '') {
        payload[key] = null;
      } else {
        payload[key] = value;
      }
    } else {
      payload[key] = value;
    }
  }
  return payload;
}

// --- SecretField subcomponent ---

interface SecretFieldProps<T extends Record<string, unknown>> {
  fieldName: string & keyof T;
  label: string;
  placeholder: string;
  register: UseFormRegister<T>;
  secretModified: Record<string, boolean>;
  onSecretModifiedChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  secretConfigured: Record<string, boolean>;
  onClear: () => void;
  t: (key: string) => string;
}

function SecretField<T extends Record<string, unknown>>({
  fieldName,
  label,
  placeholder,
  register,
  secretModified,
  onSecretModifiedChange,
  secretConfigured,
  onClear,
  t,
}: SecretFieldProps<T>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldName}>{label}</Label>
        {!secretModified[fieldName] && (
          secretConfigured[fieldName] ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <Lock className="h-3 w-3" />
              {t('channels.secretConfigured')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/50">
              <LockOpen className="h-3 w-3" />
              {t('channels.secretNotConfigured')}
            </span>
          )
        )}
      </div>
      <div className="relative">
        <Input
          id={fieldName}
          type="password"
          autoComplete="off"
          placeholder={placeholder}
          {...register(fieldName, {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onSecretModifiedChange((prev) => ({ ...prev, [fieldName]: e.target.value.length > 0 })),
          })}
        />
        {secretConfigured[fieldName] && !secretModified[fieldName] && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground"
            title={t('channels.clearSecret')}
            aria-label={t('channels.clearSecret')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Toggle field subcomponent ---

interface ToggleFieldProps {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
}

function ToggleField({ name, label, control }: ToggleFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-center justify-between">
          <Label htmlFor={name}>{label}</Label>
          <Switch
            id={name}
            checked={toBool(field.value)}
            onCheckedChange={field.onChange}
          />
        </div>
      )}
    />
  );
}

// --- Main component ---

export default function ChannelConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [savingFacebook, setSavingFacebook] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [savingInstagram, setSavingInstagram] = useState(false);

  const [fbSecretModified, setFbSecretModified] = useState<Record<string, boolean>>({});
  const [fbSecretConfigured, setFbSecretConfigured] = useState<Record<string, boolean>>({});
  const [wpSecretModified, setWpSecretModified] = useState<Record<string, boolean>>({});
  const [wpSecretConfigured, setWpSecretConfigured] = useState<Record<string, boolean>>({});
  const [igSecretModified, setIgSecretModified] = useState<Record<string, boolean>>({});
  const [igSecretConfigured, setIgSecretConfigured] = useState<Record<string, boolean>>({});

  const facebookSchema = useMemo(() => createFacebookSchema(), []);
  const whatsappSchema = useMemo(() => createWhatsappSchema(), []);
  const instagramSchema = useMemo(() => createInstagramSchema(), []);

  const facebookForm = useForm<FacebookFormData>({
    resolver: zodResolver(facebookSchema),
    defaultValues: FACEBOOK_DEFAULTS,
  });

  const whatsappForm = useForm<WhatsAppFormData>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: WHATSAPP_DEFAULTS,
  });

  const instagramForm = useForm<InstagramFormData>({
    resolver: zodResolver(instagramSchema),
    defaultValues: INSTAGRAM_DEFAULTS,
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [fbData, wpData, igData] = await Promise.all([
        adminConfigService.getConfig('facebook'),
        adminConfigService.getConfig('whatsapp'),
        adminConfigService.getConfig('instagram'),
      ]);

      setFbSecretConfigured(updateSecretStatus(fbData, FACEBOOK_SECRET_FIELDS));
      setFbSecretModified({});
      facebookForm.reset(buildFormValues(fbData, FACEBOOK_DEFAULTS, FACEBOOK_SECRET_FIELDS, FACEBOOK_BOOLEAN_FIELDS));

      setWpSecretConfigured(updateSecretStatus(wpData, WHATSAPP_SECRET_FIELDS));
      setWpSecretModified({});
      whatsappForm.reset(buildFormValues(wpData, WHATSAPP_DEFAULTS, WHATSAPP_SECRET_FIELDS, []));

      setIgSecretConfigured(updateSecretStatus(igData, INSTAGRAM_SECRET_FIELDS));
      setIgSecretModified({});
      instagramForm.reset(buildFormValues(igData, INSTAGRAM_DEFAULTS, INSTAGRAM_SECRET_FIELDS, INSTAGRAM_BOOLEAN_FIELDS));
    } catch {
      toast.error(t('channels.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [facebookForm, whatsappForm, instagramForm, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmitFacebook = async (formData: FacebookFormData) => {
    setSavingFacebook(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, FACEBOOK_SECRET_FIELDS, fbSecretModified);
      const data = await adminConfigService.saveConfig('facebook', payload as AdminConfigData);
      setFbSecretConfigured(updateSecretStatus(data, FACEBOOK_SECRET_FIELDS));
      setFbSecretModified({});
      facebookForm.reset(buildFormValues(data, FACEBOOK_DEFAULTS, FACEBOOK_SECRET_FIELDS, FACEBOOK_BOOLEAN_FIELDS));
      toast.success(t('channels.facebook.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.facebook.saveError'), { description: errorInfo.message });
    } finally {
      setSavingFacebook(false);
    }
  };

  const onSubmitWhatsapp = async (formData: WhatsAppFormData) => {
    setSavingWhatsapp(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, WHATSAPP_SECRET_FIELDS, wpSecretModified);
      const data = await adminConfigService.saveConfig('whatsapp', payload as AdminConfigData);
      setWpSecretConfigured(updateSecretStatus(data, WHATSAPP_SECRET_FIELDS));
      setWpSecretModified({});
      whatsappForm.reset(buildFormValues(data, WHATSAPP_DEFAULTS, WHATSAPP_SECRET_FIELDS, []));
      toast.success(t('channels.whatsapp.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.whatsapp.saveError'), { description: errorInfo.message });
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const onSubmitInstagram = async (formData: InstagramFormData) => {
    setSavingInstagram(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, INSTAGRAM_SECRET_FIELDS, igSecretModified);
      const data = await adminConfigService.saveConfig('instagram', payload as AdminConfigData);
      setIgSecretConfigured(updateSecretStatus(data, INSTAGRAM_SECRET_FIELDS));
      setIgSecretModified({});
      instagramForm.reset(buildFormValues(data, INSTAGRAM_DEFAULTS, INSTAGRAM_SECRET_FIELDS, INSTAGRAM_BOOLEAN_FIELDS));
      toast.success(t('channels.instagram.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.instagram.saveError'), { description: errorInfo.message });
    } finally {
      setSavingInstagram(false);
    }
  };

  const handleClearFbSecret = (fieldName: keyof FacebookFormData) => {
    facebookForm.setValue(fieldName, '');
    setFbSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleClearWpSecret = (fieldName: keyof WhatsAppFormData) => {
    whatsappForm.setValue(fieldName, '');
    setWpSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleClearIgSecret = (fieldName: keyof InstagramFormData) => {
    instagramForm.setValue(fieldName, '');
    setIgSecretModified((prev) => ({ ...prev, [fieldName]: true }));
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
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('channels.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('channels.description')}</p>
      </div>

      <Tabs defaultValue="facebook">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="facebook">{t('channels.facebook.tabTitle')}</TabsTrigger>
          <TabsTrigger value="whatsapp">{t('channels.whatsapp.tabTitle')}</TabsTrigger>
          <TabsTrigger value="instagram">{t('channels.instagram.tabTitle')}</TabsTrigger>
        </TabsList>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={facebookForm.handleSubmit(onSubmitFacebook)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="FB_APP_ID">{t('channels.facebook.fields.appId')}</Label>
                  <Input
                    id="FB_APP_ID"
                    placeholder={t('channels.facebook.placeholders.appId')}
                    {...facebookForm.register('FB_APP_ID')}
                  />
                  {facebookForm.formState.errors.FB_APP_ID && (
                    <p className="text-xs text-destructive">{facebookForm.formState.errors.FB_APP_ID.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="FB_VERIFY_TOKEN">{t('channels.facebook.fields.verifyToken')}</Label>
                  <Input
                    id="FB_VERIFY_TOKEN"
                    type="password"
                    autoComplete="off"
                    placeholder={t('channels.facebook.placeholders.verifyToken')}
                    {...facebookForm.register('FB_VERIFY_TOKEN')}
                  />
                  {facebookForm.formState.errors.FB_VERIFY_TOKEN && (
                    <p className="text-xs text-destructive">{facebookForm.formState.errors.FB_VERIFY_TOKEN.message}</p>
                  )}
                </div>

                <SecretField<FacebookFormData>
                  fieldName="FB_APP_SECRET"
                  label={t('channels.facebook.fields.appSecret')}
                  placeholder={t('channels.facebook.placeholders.appSecret')}
                  register={facebookForm.register}
                  secretModified={fbSecretModified}
                  onSecretModifiedChange={setFbSecretModified}
                  secretConfigured={fbSecretConfigured}
                  onClear={() => handleClearFbSecret('FB_APP_SECRET')}
                  t={t}
                />

                <div className="space-y-2">
                  <Label htmlFor="FACEBOOK_API_VERSION">{t('channels.facebook.fields.apiVersion')}</Label>
                  <Input
                    id="FACEBOOK_API_VERSION"
                    placeholder={t('channels.facebook.placeholders.apiVersion')}
                    {...facebookForm.register('FACEBOOK_API_VERSION')}
                  />
                  {facebookForm.formState.errors.FACEBOOK_API_VERSION && (
                    <p className="text-xs text-destructive">{facebookForm.formState.errors.FACEBOOK_API_VERSION.message}</p>
                  )}
                </div>

                <div className="space-y-3 rounded-md border p-4">
                  <ToggleField
                    name="ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT"
                    label={t('channels.facebook.fields.humanAgent')}
                    control={facebookForm.control}
                  />
                  <ToggleField
                    name="FB_FEED_COMMENTS_ENABLED"
                    label={t('channels.facebook.fields.feedComments')}
                    control={facebookForm.control}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={savingFacebook}>
                    {savingFacebook && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {savingFacebook ? t('channels.saving') : t('channels.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={whatsappForm.handleSubmit(onSubmitWhatsapp)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="WP_APP_ID">{t('channels.whatsapp.fields.appId')}</Label>
                  <Input
                    id="WP_APP_ID"
                    placeholder={t('channels.whatsapp.placeholders.appId')}
                    {...whatsappForm.register('WP_APP_ID')}
                  />
                  {whatsappForm.formState.errors.WP_APP_ID && (
                    <p className="text-xs text-destructive">{whatsappForm.formState.errors.WP_APP_ID.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="WP_VERIFY_TOKEN">{t('channels.whatsapp.fields.verifyToken')}</Label>
                  <Input
                    id="WP_VERIFY_TOKEN"
                    type="password"
                    autoComplete="off"
                    placeholder={t('channels.whatsapp.placeholders.verifyToken')}
                    {...whatsappForm.register('WP_VERIFY_TOKEN')}
                  />
                  {whatsappForm.formState.errors.WP_VERIFY_TOKEN && (
                    <p className="text-xs text-destructive">{whatsappForm.formState.errors.WP_VERIFY_TOKEN.message}</p>
                  )}
                </div>

                <SecretField<WhatsAppFormData>
                  fieldName="WP_APP_SECRET"
                  label={t('channels.whatsapp.fields.appSecret')}
                  placeholder={t('channels.whatsapp.placeholders.appSecret')}
                  register={whatsappForm.register}
                  secretModified={wpSecretModified}
                  onSecretModifiedChange={setWpSecretModified}
                  secretConfigured={wpSecretConfigured}
                  onClear={() => handleClearWpSecret('WP_APP_SECRET')}
                  t={t}
                />

                <div className="space-y-2">
                  <Label htmlFor="WP_WHATSAPP_CONFIG_ID">{t('channels.whatsapp.fields.configId')}</Label>
                  <Input
                    id="WP_WHATSAPP_CONFIG_ID"
                    placeholder={t('channels.whatsapp.placeholders.configId')}
                    {...whatsappForm.register('WP_WHATSAPP_CONFIG_ID')}
                  />
                  {whatsappForm.formState.errors.WP_WHATSAPP_CONFIG_ID && (
                    <p className="text-xs text-destructive">{whatsappForm.formState.errors.WP_WHATSAPP_CONFIG_ID.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="WP_API_VERSION">{t('channels.whatsapp.fields.apiVersion')}</Label>
                  <Input
                    id="WP_API_VERSION"
                    placeholder={t('channels.whatsapp.placeholders.apiVersion')}
                    {...whatsappForm.register('WP_API_VERSION')}
                  />
                  {whatsappForm.formState.errors.WP_API_VERSION && (
                    <p className="text-xs text-destructive">{whatsappForm.formState.errors.WP_API_VERSION.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={savingWhatsapp}>
                    {savingWhatsapp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {savingWhatsapp ? t('channels.saving') : t('channels.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={instagramForm.handleSubmit(onSubmitInstagram)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="INSTAGRAM_APP_ID">{t('channels.instagram.fields.appId')}</Label>
                  <Input
                    id="INSTAGRAM_APP_ID"
                    placeholder={t('channels.instagram.placeholders.appId')}
                    {...instagramForm.register('INSTAGRAM_APP_ID')}
                  />
                  {instagramForm.formState.errors.INSTAGRAM_APP_ID && (
                    <p className="text-xs text-destructive">{instagramForm.formState.errors.INSTAGRAM_APP_ID.message}</p>
                  )}
                </div>

                <SecretField<InstagramFormData>
                  fieldName="INSTAGRAM_APP_SECRET"
                  label={t('channels.instagram.fields.appSecret')}
                  placeholder={t('channels.instagram.placeholders.appSecret')}
                  register={instagramForm.register}
                  secretModified={igSecretModified}
                  onSecretModifiedChange={setIgSecretModified}
                  secretConfigured={igSecretConfigured}
                  onClear={() => handleClearIgSecret('INSTAGRAM_APP_SECRET')}
                  t={t}
                />

                <div className="space-y-2">
                  <Label htmlFor="INSTAGRAM_VERIFY_TOKEN">{t('channels.instagram.fields.verifyToken')}</Label>
                  <Input
                    id="INSTAGRAM_VERIFY_TOKEN"
                    type="password"
                    autoComplete="off"
                    placeholder={t('channels.instagram.placeholders.verifyToken')}
                    {...instagramForm.register('INSTAGRAM_VERIFY_TOKEN')}
                  />
                  {instagramForm.formState.errors.INSTAGRAM_VERIFY_TOKEN && (
                    <p className="text-xs text-destructive">{instagramForm.formState.errors.INSTAGRAM_VERIFY_TOKEN.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="INSTAGRAM_API_VERSION">{t('channels.instagram.fields.apiVersion')}</Label>
                  <Input
                    id="INSTAGRAM_API_VERSION"
                    placeholder={t('channels.instagram.placeholders.apiVersion')}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                    {...instagramForm.register('INSTAGRAM_API_VERSION')}
                  />
                </div>

                <div className="space-y-3 rounded-md border p-4">
                  <ToggleField
                    name="ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT"
                    label={t('channels.instagram.fields.humanAgent')}
                    control={instagramForm.control}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={savingInstagram}>
                    {savingInstagram && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {savingInstagram ? t('channels.saving') : t('channels.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
