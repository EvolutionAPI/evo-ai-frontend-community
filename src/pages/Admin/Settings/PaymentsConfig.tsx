import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Loader2, Lock, LockOpen, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { adminConfigService } from '@/services/admin/adminConfigService';
import { extractError } from '@/utils/apiHelpers';
import type { AdminConfigData } from '@/types/admin/adminConfig';

// --- Schema factory with i18n ---

function createPaymentsSchema(t: (key: string) => string) {
  return z.object({
    STRIPE_PUBLISHABLE_KEY: z.string().min(1, t('payments.validation.publishableKeyRequired')),
    STRIPE_KEY_SECRET: z.string().optional().nullable(),
    STRIPE_WEBHOOK_SECRET: z.string().optional().nullable(),
  });
}

type PaymentsFormData = z.infer<ReturnType<typeof createPaymentsSchema>>;

type PaymentsFieldKey = keyof PaymentsFormData;

const DEFAULTS: PaymentsFormData = {
  STRIPE_PUBLISHABLE_KEY: '',
  STRIPE_KEY_SECRET: null,
  STRIPE_WEBHOOK_SECRET: null,
};

const SECRET_FIELDS = ['STRIPE_KEY_SECRET', 'STRIPE_WEBHOOK_SECRET'];

function isSecretMasked(value: unknown): boolean {
  return typeof value === 'string' && value.includes('••••');
}

function buildFormValues(data: Record<string, unknown>): PaymentsFormData {
  const formValues: Record<string, unknown> = { ...DEFAULTS };
  for (const [key, value] of Object.entries(data)) {
    if (SECRET_FIELDS.includes(key)) {
      formValues[key] = isSecretMasked(value) ? '' : (value ?? '');
    } else {
      formValues[key] = value ?? formValues[key] ?? '';
    }
  }
  return formValues as PaymentsFormData;
}

export default function PaymentsConfig() {
  const { t } = useLanguage('adminSettings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [secretModified, setSecretModified] = useState<Record<string, boolean>>({});
  const [secretConfigured, setSecretConfigured] = useState<Record<string, boolean>>({});

  const paymentsSchema = useMemo(() => createPaymentsSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentsFormData>({
    resolver: zodResolver(paymentsSchema),
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
      const data = await adminConfigService.getConfig('stripe_payments');
      updateSecretStatus(data);
      reset(buildFormValues(data));
    } catch (error) {
      toast.error(t('payments.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [reset, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmit = async (formData: PaymentsFormData) => {
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

      const data = await adminConfigService.saveConfig('stripe_payments', payload as AdminConfigData);
      updateSecretStatus(data);
      reset(buildFormValues(data));

      toast.success(t('payments.messages.saveSuccess'));
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(t('payments.messages.saveError'), {
        description: errorInfo.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSecretChange = (fieldName: string, value: string) => {
    setSecretModified((prev) => ({ ...prev, [fieldName]: value.length > 0 }));
  };

  const handleClearSecret = (fieldName: string) => {
    setValue(fieldName as PaymentsFieldKey, '');
    setSecretModified((prev) => ({ ...prev, [fieldName]: true }));
  };

  const renderSecretField = (fieldName: string, label: string, placeholder: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldName}>{label}</Label>
        {!secretModified[fieldName] && (
          secretConfigured[fieldName] ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <Lock className="h-3 w-3" />
              {t('payments.secretConfigured')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-sidebar-foreground/50">
              <LockOpen className="h-3 w-3" />
              {t('payments.secretNotConfigured')}
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
          {...register(fieldName as PaymentsFieldKey, {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSecretChange(fieldName, e.target.value),
          })}
        />
        {secretConfigured[fieldName] && !secretModified[fieldName] && (
          <button
            type="button"
            onClick={() => handleClearSecret(fieldName)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground"
            title={t('payments.clearSecret')}
            aria-label={t('payments.clearSecret')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );

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
        <h2 className="text-xl font-semibold text-sidebar-foreground">{t('payments.title')}</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{t('payments.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('payments.fields.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="STRIPE_PUBLISHABLE_KEY">{t('payments.fields.publishableKey')}</Label>
              <Input
                id="STRIPE_PUBLISHABLE_KEY"
                placeholder={t('payments.placeholders.publishableKey')}
                {...register('STRIPE_PUBLISHABLE_KEY')}
              />
              {errors.STRIPE_PUBLISHABLE_KEY && (
                <p className="text-xs text-destructive">{errors.STRIPE_PUBLISHABLE_KEY.message}</p>
              )}
            </div>

            {renderSecretField('STRIPE_KEY_SECRET', t('payments.fields.secretKey'), t('payments.placeholders.secretKey'))}
            {renderSecretField('STRIPE_WEBHOOK_SECRET', t('payments.fields.webhookSecret'), t('payments.placeholders.webhookSecret'))}

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? t('payments.saving') : t('payments.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
