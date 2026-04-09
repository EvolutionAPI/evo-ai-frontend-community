import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller, UseFormRegister, Path } from 'react-hook-form';
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

function createEvolutionSchema() {
  return z.object({
    EVOLUTION_API_URL: z.string().optional(),
    EVOLUTION_ADMIN_SECRET: z.string().optional().nullable(),
  });
}

function createEvolutionGoSchema() {
  return z.object({
    EVOLUTION_GO_API_URL: z.string().optional(),
    EVOLUTION_GO_ADMIN_SECRET: z.string().optional().nullable(),
    EVOLUTION_GO_INSTANCE_ID: z.string().optional(),
    EVOLUTION_GO_INSTANCE_SECRET: z.string().optional().nullable(),
  });
}

function createTwitterSchema() {
  return z.object({
    TWITTER_APP_ID: z.string().optional(),
    TWITTER_CONSUMER_KEY: z.string().optional(),
    TWITTER_CONSUMER_SECRET: z.string().optional().nullable(),
    TWITTER_ENVIRONMENT: z.string().optional(),
  });
}

type FacebookFormData = z.infer<ReturnType<typeof createFacebookSchema>>;
type WhatsAppFormData = z.infer<ReturnType<typeof createWhatsappSchema>>;
type InstagramFormData = z.infer<ReturnType<typeof createInstagramSchema>>;
type EvolutionFormData = z.infer<ReturnType<typeof createEvolutionSchema>>;
type EvolutionGoFormData = z.infer<ReturnType<typeof createEvolutionGoSchema>>;
type TwitterFormData = z.infer<ReturnType<typeof createTwitterSchema>>;

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

const EVOLUTION_DEFAULTS: EvolutionFormData = {
  EVOLUTION_API_URL: '',
  EVOLUTION_ADMIN_SECRET: null,
};

const EVOLUTION_GO_DEFAULTS: EvolutionGoFormData = {
  EVOLUTION_GO_API_URL: '',
  EVOLUTION_GO_ADMIN_SECRET: null,
  EVOLUTION_GO_INSTANCE_ID: '',
  EVOLUTION_GO_INSTANCE_SECRET: null,
};

const TWITTER_DEFAULTS: TwitterFormData = {
  TWITTER_APP_ID: '',
  TWITTER_CONSUMER_KEY: '',
  TWITTER_CONSUMER_SECRET: null,
  TWITTER_ENVIRONMENT: '',
};

// Keys with _SECRET suffix are Fernet-encrypted; API returns masked_value
const FACEBOOK_SECRET_FIELDS = ['FB_APP_SECRET'];
const WHATSAPP_SECRET_FIELDS = ['WP_APP_SECRET'];
const INSTAGRAM_SECRET_FIELDS = ['INSTAGRAM_APP_SECRET'];
const EVOLUTION_SECRET_FIELDS = ['EVOLUTION_ADMIN_SECRET'];
const EVOLUTION_GO_SECRET_FIELDS = ['EVOLUTION_GO_ADMIN_SECRET', 'EVOLUTION_GO_INSTANCE_SECRET'];
const TWITTER_SECRET_FIELDS = ['TWITTER_CONSUMER_SECRET'];

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
          {...register(fieldName as Path<T>, {
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

// --- TextField subcomponent ---

interface TextFieldProps {
  id: string;
  label: string;
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: { message?: string };
  type?: string;
  readOnly?: boolean;
}

function TextField({ id, label, placeholder, register, error, type, readOnly }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        type={type}
        readOnly={readOnly}
        className={readOnly ? 'bg-muted cursor-not-allowed' : undefined}
        {...register}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

// --- ChannelFormCard subcomponent ---

interface ChannelFormCardProps {
  onSubmit: () => void;
  saving: boolean;
  t: (key: string) => string;
  children: React.ReactNode;
}

function ChannelFormCard({ onSubmit, saving, t, children }: ChannelFormCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          {children}
          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? t('channels.saving') : t('channels.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
  const [savingEvolution, setSavingEvolution] = useState(false);
  const [savingEvolutionGo, setSavingEvolutionGo] = useState(false);
  const [savingTwitter, setSavingTwitter] = useState(false);

  const [fbSecretModified, setFbSecretModified] = useState<Record<string, boolean>>({});
  const [fbSecretConfigured, setFbSecretConfigured] = useState<Record<string, boolean>>({});
  const [wpSecretModified, setWpSecretModified] = useState<Record<string, boolean>>({});
  const [wpSecretConfigured, setWpSecretConfigured] = useState<Record<string, boolean>>({});
  const [igSecretModified, setIgSecretModified] = useState<Record<string, boolean>>({});
  const [igSecretConfigured, setIgSecretConfigured] = useState<Record<string, boolean>>({});
  const [evoSecretModified, setEvoSecretModified] = useState<Record<string, boolean>>({});
  const [evoSecretConfigured, setEvoSecretConfigured] = useState<Record<string, boolean>>({});
  const [evoGoSecretModified, setEvoGoSecretModified] = useState<Record<string, boolean>>({});
  const [evoGoSecretConfigured, setEvoGoSecretConfigured] = useState<Record<string, boolean>>({});
  const [twSecretModified, setTwSecretModified] = useState<Record<string, boolean>>({});
  const [twSecretConfigured, setTwSecretConfigured] = useState<Record<string, boolean>>({});

  const facebookSchema = useMemo(() => createFacebookSchema(), []);
  const whatsappSchema = useMemo(() => createWhatsappSchema(), []);
  const instagramSchema = useMemo(() => createInstagramSchema(), []);
  const evolutionSchema = useMemo(() => createEvolutionSchema(), []);
  const evolutionGoSchema = useMemo(() => createEvolutionGoSchema(), []);
  const twitterSchema = useMemo(() => createTwitterSchema(), []);

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

  const evolutionForm = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: EVOLUTION_DEFAULTS,
  });

  const evolutionGoForm = useForm<EvolutionGoFormData>({
    resolver: zodResolver(evolutionGoSchema),
    defaultValues: EVOLUTION_GO_DEFAULTS,
  });

  const twitterForm = useForm<TwitterFormData>({
    resolver: zodResolver(twitterSchema),
    defaultValues: TWITTER_DEFAULTS,
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [fbData, wpData, igData, evoData, evoGoData, twData] = await Promise.all([
        adminConfigService.getConfig('facebook'),
        adminConfigService.getConfig('whatsapp'),
        adminConfigService.getConfig('instagram'),
        adminConfigService.getConfig('evolution'),
        adminConfigService.getConfig('evolution_go'),
        adminConfigService.getConfig('twitter'),
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

      setEvoSecretConfigured(updateSecretStatus(evoData, EVOLUTION_SECRET_FIELDS));
      setEvoSecretModified({});
      evolutionForm.reset(buildFormValues(evoData, EVOLUTION_DEFAULTS, EVOLUTION_SECRET_FIELDS, []));

      setEvoGoSecretConfigured(updateSecretStatus(evoGoData, EVOLUTION_GO_SECRET_FIELDS));
      setEvoGoSecretModified({});
      evolutionGoForm.reset(buildFormValues(evoGoData, EVOLUTION_GO_DEFAULTS, EVOLUTION_GO_SECRET_FIELDS, []));

      setTwSecretConfigured(updateSecretStatus(twData, TWITTER_SECRET_FIELDS));
      setTwSecretModified({});
      twitterForm.reset(buildFormValues(twData, TWITTER_DEFAULTS, TWITTER_SECRET_FIELDS, []));
    } catch {
      toast.error(t('channels.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [facebookForm, whatsappForm, instagramForm, evolutionForm, evolutionGoForm, twitterForm, t]);

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

  const onSubmitEvolution = async (formData: EvolutionFormData) => {
    setSavingEvolution(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, EVOLUTION_SECRET_FIELDS, evoSecretModified);
      const data = await adminConfigService.saveConfig('evolution', payload as AdminConfigData);
      setEvoSecretConfigured(updateSecretStatus(data, EVOLUTION_SECRET_FIELDS));
      setEvoSecretModified({});
      evolutionForm.reset(buildFormValues(data, EVOLUTION_DEFAULTS, EVOLUTION_SECRET_FIELDS, []));
      toast.success(t('channels.evolution.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.evolution.saveError'), { description: errorInfo.message });
    } finally {
      setSavingEvolution(false);
    }
  };

  const onSubmitEvolutionGo = async (formData: EvolutionGoFormData) => {
    setSavingEvolutionGo(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, EVOLUTION_GO_SECRET_FIELDS, evoGoSecretModified);
      const data = await adminConfigService.saveConfig('evolution_go', payload as AdminConfigData);
      setEvoGoSecretConfigured(updateSecretStatus(data, EVOLUTION_GO_SECRET_FIELDS));
      setEvoGoSecretModified({});
      evolutionGoForm.reset(buildFormValues(data, EVOLUTION_GO_DEFAULTS, EVOLUTION_GO_SECRET_FIELDS, []));
      toast.success(t('channels.evolutionGo.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.evolutionGo.saveError'), { description: errorInfo.message });
    } finally {
      setSavingEvolutionGo(false);
    }
  };

  const onSubmitTwitter = async (formData: TwitterFormData) => {
    setSavingTwitter(true);
    try {
      const payload = buildPayload(formData as Record<string, unknown>, TWITTER_SECRET_FIELDS, twSecretModified);
      const data = await adminConfigService.saveConfig('twitter', payload as AdminConfigData);
      setTwSecretConfigured(updateSecretStatus(data, TWITTER_SECRET_FIELDS));
      setTwSecretModified({});
      twitterForm.reset(buildFormValues(data, TWITTER_DEFAULTS, TWITTER_SECRET_FIELDS, []));
      toast.success(t('channels.twitter.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('channels.twitter.saveError'), { description: errorInfo.message });
    } finally {
      setSavingTwitter(false);
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

  const handleClearEvoSecret = (fieldName: keyof EvolutionFormData) => {
    evolutionForm.setValue(fieldName, '');
    setEvoSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleClearEvoGoSecret = (fieldName: keyof EvolutionGoFormData) => {
    evolutionGoForm.setValue(fieldName, '');
    setEvoGoSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleClearTwSecret = (fieldName: keyof TwitterFormData) => {
    twitterForm.setValue(fieldName, '');
    setTwSecretModified((prev) => ({ ...prev, [fieldName]: true }));
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
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="facebook">{t('channels.facebook.tabTitle')}</TabsTrigger>
          <TabsTrigger value="whatsapp">{t('channels.whatsapp.tabTitle')}</TabsTrigger>
          <TabsTrigger value="instagram">{t('channels.instagram.tabTitle')}</TabsTrigger>
          <TabsTrigger value="evolution">{t('channels.evolution.tabTitle')}</TabsTrigger>
          <TabsTrigger value="evolution_go">{t('channels.evolutionGo.tabTitle')}</TabsTrigger>
          <TabsTrigger value="twitter">{t('channels.twitter.tabTitle')}</TabsTrigger>
        </TabsList>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="mt-4">
          <ChannelFormCard onSubmit={facebookForm.handleSubmit(onSubmitFacebook)} saving={savingFacebook} t={t}>
            <TextField
              id="FB_APP_ID"
              label={t('channels.facebook.fields.appId')}
              placeholder={t('channels.facebook.placeholders.appId')}
              register={facebookForm.register('FB_APP_ID')}
              error={facebookForm.formState.errors.FB_APP_ID}
            />
            <TextField
              id="FB_VERIFY_TOKEN"
              label={t('channels.facebook.fields.verifyToken')}
              placeholder={t('channels.facebook.placeholders.verifyToken')}
              type="password"
              register={facebookForm.register('FB_VERIFY_TOKEN')}
              error={facebookForm.formState.errors.FB_VERIFY_TOKEN}
            />
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
            <TextField
              id="FACEBOOK_API_VERSION"
              label={t('channels.facebook.fields.apiVersion')}
              placeholder={t('channels.facebook.placeholders.apiVersion')}
              register={facebookForm.register('FACEBOOK_API_VERSION')}
              error={facebookForm.formState.errors.FACEBOOK_API_VERSION}
            />
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
          </ChannelFormCard>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="mt-4">
          <ChannelFormCard onSubmit={whatsappForm.handleSubmit(onSubmitWhatsapp)} saving={savingWhatsapp} t={t}>
            <TextField
              id="WP_APP_ID"
              label={t('channels.whatsapp.fields.appId')}
              placeholder={t('channels.whatsapp.placeholders.appId')}
              register={whatsappForm.register('WP_APP_ID')}
              error={whatsappForm.formState.errors.WP_APP_ID}
            />
            <TextField
              id="WP_VERIFY_TOKEN"
              label={t('channels.whatsapp.fields.verifyToken')}
              placeholder={t('channels.whatsapp.placeholders.verifyToken')}
              type="password"
              register={whatsappForm.register('WP_VERIFY_TOKEN')}
              error={whatsappForm.formState.errors.WP_VERIFY_TOKEN}
            />
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
            <TextField
              id="WP_WHATSAPP_CONFIG_ID"
              label={t('channels.whatsapp.fields.configId')}
              placeholder={t('channels.whatsapp.placeholders.configId')}
              register={whatsappForm.register('WP_WHATSAPP_CONFIG_ID')}
              error={whatsappForm.formState.errors.WP_WHATSAPP_CONFIG_ID}
            />
            <TextField
              id="WP_API_VERSION"
              label={t('channels.whatsapp.fields.apiVersion')}
              placeholder={t('channels.whatsapp.placeholders.apiVersion')}
              register={whatsappForm.register('WP_API_VERSION')}
              error={whatsappForm.formState.errors.WP_API_VERSION}
            />
          </ChannelFormCard>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="mt-4">
          <ChannelFormCard onSubmit={instagramForm.handleSubmit(onSubmitInstagram)} saving={savingInstagram} t={t}>
            <TextField
              id="INSTAGRAM_APP_ID"
              label={t('channels.instagram.fields.appId')}
              placeholder={t('channels.instagram.placeholders.appId')}
              register={instagramForm.register('INSTAGRAM_APP_ID')}
              error={instagramForm.formState.errors.INSTAGRAM_APP_ID}
            />
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
            <TextField
              id="INSTAGRAM_VERIFY_TOKEN"
              label={t('channels.instagram.fields.verifyToken')}
              placeholder={t('channels.instagram.placeholders.verifyToken')}
              type="password"
              register={instagramForm.register('INSTAGRAM_VERIFY_TOKEN')}
              error={instagramForm.formState.errors.INSTAGRAM_VERIFY_TOKEN}
            />
            <TextField
              id="INSTAGRAM_API_VERSION"
              label={t('channels.instagram.fields.apiVersion')}
              placeholder={t('channels.instagram.placeholders.apiVersion')}
              register={instagramForm.register('INSTAGRAM_API_VERSION')}
              readOnly
            />
            <div className="space-y-3 rounded-md border p-4">
              <ToggleField
                name="ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT"
                label={t('channels.instagram.fields.humanAgent')}
                control={instagramForm.control}
              />
            </div>
          </ChannelFormCard>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="mt-4">
          <ChannelFormCard onSubmit={evolutionForm.handleSubmit(onSubmitEvolution)} saving={savingEvolution} t={t}>
            <TextField
              id="EVOLUTION_API_URL"
              label={t('channels.evolution.fields.apiUrl')}
              placeholder={t('channels.evolution.placeholders.apiUrl')}
              register={evolutionForm.register('EVOLUTION_API_URL')}
              error={evolutionForm.formState.errors.EVOLUTION_API_URL}
            />
            <SecretField<EvolutionFormData>
              fieldName="EVOLUTION_ADMIN_SECRET"
              label={t('channels.evolution.fields.adminSecret')}
              placeholder={t('channels.evolution.placeholders.adminSecret')}
              register={evolutionForm.register}
              secretModified={evoSecretModified}
              onSecretModifiedChange={setEvoSecretModified}
              secretConfigured={evoSecretConfigured}
              onClear={() => handleClearEvoSecret('EVOLUTION_ADMIN_SECRET')}
              t={t}
            />
          </ChannelFormCard>
        </TabsContent>

        {/* Evolution Go Tab */}
        <TabsContent value="evolution_go" className="mt-4">
          <ChannelFormCard onSubmit={evolutionGoForm.handleSubmit(onSubmitEvolutionGo)} saving={savingEvolutionGo} t={t}>
            <TextField
              id="EVOLUTION_GO_API_URL"
              label={t('channels.evolutionGo.fields.apiUrl')}
              placeholder={t('channels.evolutionGo.placeholders.apiUrl')}
              register={evolutionGoForm.register('EVOLUTION_GO_API_URL')}
              error={evolutionGoForm.formState.errors.EVOLUTION_GO_API_URL}
            />
            <SecretField<EvolutionGoFormData>
              fieldName="EVOLUTION_GO_ADMIN_SECRET"
              label={t('channels.evolutionGo.fields.adminSecret')}
              placeholder={t('channels.evolutionGo.placeholders.adminSecret')}
              register={evolutionGoForm.register}
              secretModified={evoGoSecretModified}
              onSecretModifiedChange={setEvoGoSecretModified}
              secretConfigured={evoGoSecretConfigured}
              onClear={() => handleClearEvoGoSecret('EVOLUTION_GO_ADMIN_SECRET')}
              t={t}
            />
            <TextField
              id="EVOLUTION_GO_INSTANCE_ID"
              label={t('channels.evolutionGo.fields.instanceId')}
              placeholder={t('channels.evolutionGo.placeholders.instanceId')}
              register={evolutionGoForm.register('EVOLUTION_GO_INSTANCE_ID')}
              error={evolutionGoForm.formState.errors.EVOLUTION_GO_INSTANCE_ID}
            />
            <SecretField<EvolutionGoFormData>
              fieldName="EVOLUTION_GO_INSTANCE_SECRET"
              label={t('channels.evolutionGo.fields.instanceSecret')}
              placeholder={t('channels.evolutionGo.placeholders.instanceSecret')}
              register={evolutionGoForm.register}
              secretModified={evoGoSecretModified}
              onSecretModifiedChange={setEvoGoSecretModified}
              secretConfigured={evoGoSecretConfigured}
              onClear={() => handleClearEvoGoSecret('EVOLUTION_GO_INSTANCE_SECRET')}
              t={t}
            />
          </ChannelFormCard>
        </TabsContent>

        {/* Twitter Tab */}
        <TabsContent value="twitter" className="mt-4">
          <ChannelFormCard onSubmit={twitterForm.handleSubmit(onSubmitTwitter)} saving={savingTwitter} t={t}>
            <TextField
              id="TWITTER_APP_ID"
              label={t('channels.twitter.fields.appId')}
              placeholder={t('channels.twitter.placeholders.appId')}
              register={twitterForm.register('TWITTER_APP_ID')}
              error={twitterForm.formState.errors.TWITTER_APP_ID}
            />
            <TextField
              id="TWITTER_CONSUMER_KEY"
              label={t('channels.twitter.fields.consumerKey')}
              placeholder={t('channels.twitter.placeholders.consumerKey')}
              register={twitterForm.register('TWITTER_CONSUMER_KEY')}
              error={twitterForm.formState.errors.TWITTER_CONSUMER_KEY}
            />
            <SecretField<TwitterFormData>
              fieldName="TWITTER_CONSUMER_SECRET"
              label={t('channels.twitter.fields.consumerSecret')}
              placeholder={t('channels.twitter.placeholders.consumerSecret')}
              register={twitterForm.register}
              secretModified={twSecretModified}
              onSecretModifiedChange={setTwSecretModified}
              secretConfigured={twSecretConfigured}
              onClear={() => handleClearTwSecret('TWITTER_CONSUMER_SECRET')}
              t={t}
            />
            <TextField
              id="TWITTER_ENVIRONMENT"
              label={t('channels.twitter.fields.environment')}
              placeholder={t('channels.twitter.placeholders.environment')}
              register={twitterForm.register('TWITTER_ENVIRONMENT')}
              error={twitterForm.formState.errors.TWITTER_ENVIRONMENT}
            />
          </ChannelFormCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
