import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
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
import { Loader2, Lock, LockOpen, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

// --- Schema ---

const integrationSchema = z.object({
  clientId: z.string().optional(),
  clientSecret: z.string().optional().nullable(),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

const DEFAULTS: IntegrationFormData = {
  clientId: '',
  clientSecret: null,
};

function isSecretMasked(value: unknown): boolean {
  return typeof value === 'string' && value.includes('••••');
}

// --- SecretField subcomponent ---

interface SecretFieldProps {
  fieldName: 'clientSecret';
  label: string;
  placeholder: string;
  register: UseFormRegister<IntegrationFormData>;
  secretModified: boolean;
  onSecretModifiedChange: (modified: boolean) => void;
  secretConfigured: boolean;
  onClear: () => void;
  sectionKey: string;
  t: (key: string) => string;
}

function SecretField({
  fieldName,
  label,
  placeholder,
  register,
  secretModified,
  onSecretModifiedChange,
  secretConfigured,
  onClear,
  sectionKey,
  t,
}: SecretFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`${sectionKey}-${fieldName}`}>{label}</Label>
        {!secretModified && (
          secretConfigured ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <Lock className="h-3 w-3" />
              {t('integrations.secretConfigured')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/50">
              <LockOpen className="h-3 w-3" />
              {t('integrations.secretNotConfigured')}
            </span>
          )
        )}
      </div>
      <div className="relative">
        <Input
          id={`${sectionKey}-${fieldName}`}
          type="password"
          autoComplete="off"
          placeholder={placeholder}
          {...register(fieldName, {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onSecretModifiedChange(e.target.value.length > 0),
          })}
        />
        {secretConfigured && !secretModified && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground"
            title={t('integrations.clearSecret')}
            aria-label={t('integrations.clearSecret')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Integration Section ---

interface IntegrationSectionProps {
  title: string;
  sectionKey: string;
  form: ReturnType<typeof useForm<IntegrationFormData>>;
  saving: boolean;
  onSave: (data: IntegrationFormData) => void;
  secretModified: boolean;
  onSecretModifiedChange: (modified: boolean) => void;
  secretConfigured: boolean;
  t: (key: string) => string;
}

function IntegrationSection({
  title,
  sectionKey,
  form,
  saving,
  onSave,
  secretModified,
  onSecretModifiedChange,
  secretConfigured,
  t,
}: IntegrationSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form data-testid={`${sectionKey}-form`} onSubmit={form.handleSubmit(onSave)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={`${sectionKey}-clientId`}>{t(`integrations.${sectionKey}.fields.clientId`)}</Label>
            <Input
              id={`${sectionKey}-clientId`}
              placeholder={t(`integrations.${sectionKey}.placeholders.clientId`)}
              {...form.register('clientId')}
            />
          </div>

          <SecretField
            fieldName="clientSecret"
            label={t(`integrations.${sectionKey}.fields.clientSecret`)}
            placeholder={t(`integrations.${sectionKey}.placeholders.clientSecret`)}
            register={form.register}
            secretModified={secretModified}
            onSecretModifiedChange={onSecretModifiedChange}
            secretConfigured={secretConfigured}
            onClear={() => {
              form.setValue('clientSecret', '');
              onSecretModifiedChange(true);
            }}
            sectionKey={sectionKey}
            t={t}
          />

          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? t('integrations.saving') : t('integrations.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Integration config definition ---

interface IntegrationDef {
  key: string;
  configType: string;
  clientIdKey: string;
  clientSecretKey: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  { key: 'linear', configType: 'linear', clientIdKey: 'LINEAR_CLIENT_ID', clientSecretKey: 'LINEAR_CLIENT_SECRET' },
  { key: 'hubspot', configType: 'hubspot', clientIdKey: 'HUBSPOT_CLIENT_ID', clientSecretKey: 'HUBSPOT_CLIENT_SECRET' },
  { key: 'shopify', configType: 'shopify', clientIdKey: 'SHOPIFY_CLIENT_ID', clientSecretKey: 'SHOPIFY_CLIENT_SECRET' },
  { key: 'slack', configType: 'slack', clientIdKey: 'SLACK_CLIENT_ID', clientSecretKey: 'SLACK_CLIENT_SECRET' },
];

// --- Main component ---

export default function IntegrationsConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [secretModifiedStates, setSecretModifiedStates] = useState<Record<string, boolean>>({});
  const [secretConfiguredStates, setSecretConfiguredStates] = useState<Record<string, boolean>>({});

  const linearForm = useForm<IntegrationFormData>({ resolver: zodResolver(integrationSchema), defaultValues: DEFAULTS });
  const hubspotForm = useForm<IntegrationFormData>({ resolver: zodResolver(integrationSchema), defaultValues: DEFAULTS });
  const shopifyForm = useForm<IntegrationFormData>({ resolver: zodResolver(integrationSchema), defaultValues: DEFAULTS });
  const slackForm = useForm<IntegrationFormData>({ resolver: zodResolver(integrationSchema), defaultValues: DEFAULTS });

  const forms: Record<string, ReturnType<typeof useForm<IntegrationFormData>>> = {
    linear: linearForm,
    hubspot: hubspotForm,
    shopify: shopifyForm,
    slack: slackForm,
  };

  const buildFormValues = (data: Record<string, unknown>, def: IntegrationDef): IntegrationFormData => {
    const secretValue = data[def.clientSecretKey];
    return {
      clientId: (data[def.clientIdKey] as string) ?? '',
      clientSecret: isSecretMasked(secretValue) ? '' : ((secretValue as string) ?? ''),
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- forms are stable useForm instances
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        INTEGRATIONS.map((def) => adminConfigService.getConfig(def.configType)),
      );
      INTEGRATIONS.forEach((def, i) => {
        const data = results[i];
        const secretValue = data[def.clientSecretKey];
        setSecretConfiguredStates((prev) => ({
          ...prev,
          [def.key]: isSecretMasked(secretValue),
        }));
        setSecretModifiedStates((prev) => ({ ...prev, [def.key]: false }));
        forms[def.key].reset(buildFormValues(data, def));
      });
    } catch {
      toast.error(t('integrations.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const createSaveHandler = (def: IntegrationDef) => async (formData: IntegrationFormData) => {
    setSavingStates((prev) => ({ ...prev, [def.key]: true }));
    try {
      const payload: Record<string, unknown> = {
        [def.clientIdKey]: formData.clientId,
      };

      if (!secretModifiedStates[def.key] || formData.clientSecret === '') {
        payload[def.clientSecretKey] = null;
      } else {
        payload[def.clientSecretKey] = formData.clientSecret;
      }

      const data = await adminConfigService.saveConfig(def.configType, payload as AdminConfigData);
      const secretValue = data[def.clientSecretKey];
      setSecretConfiguredStates((prev) => ({
        ...prev,
        [def.key]: isSecretMasked(secretValue),
      }));
      setSecretModifiedStates((prev) => ({ ...prev, [def.key]: false }));
      forms[def.key].reset(buildFormValues(data, def));
      toast.success(t(`integrations.${def.key}.saveSuccess`));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t(`integrations.${def.key}.saveError`), {
        description: errorInfo.message,
      });
    } finally {
      setSavingStates((prev) => ({ ...prev, [def.key]: false }));
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
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('integrations.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('integrations.description')}</p>
      </div>

      {INTEGRATIONS.map((def) => (
        <IntegrationSection
          key={def.key}
          title={t(`integrations.${def.key}.cardTitle`)}
          sectionKey={def.key}
          form={forms[def.key]}
          saving={savingStates[def.key] ?? false}
          onSave={createSaveHandler(def)}
          secretModified={secretModifiedStates[def.key] ?? false}
          onSecretModifiedChange={(modified) =>
            setSecretModifiedStates((prev) => ({ ...prev, [def.key]: modified }))
          }
          secretConfigured={secretConfiguredStates[def.key] ?? false}
          t={t}
        />
      ))}
    </div>
  );
}
