import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, Globe } from 'lucide-react';

import {
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evoapi/design-system';

import { useLanguage } from '@/hooks/useLanguage';
import { type Locale } from '@/i18n/config';
import { setupService } from '@/services/setup/setupService';
import { clearSetupCache } from '@/contexts/GlobalConfigContext';

import logo from '@/assets/EVO_CRM.png';

type SetupFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage, changeLanguage } = useLanguage('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const setupSchema = useMemo(() => z
    .object({
      first_name: z
        .string()
        .min(1, { message: t('form.firstName.errors.required') })
        .min(2, { message: t('form.firstName.errors.minLength') }),
      last_name: z
        .string()
        .min(1, { message: t('form.lastName.errors.required') })
        .min(2, { message: t('form.lastName.errors.minLength') }),
      email: z
        .string()
        .min(1, { message: t('form.email.errors.required') })
        .email({ message: t('form.email.errors.invalid') }),
      password: z
        .string()
        .min(1, { message: t('form.password.errors.required') })
        .min(8, { message: t('form.password.errors.minLength') })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/, {
          message: t('form.password.errors.complexity'),
        }),
      password_confirmation: z
        .string()
        .min(1, { message: t('form.confirmPassword.errors.required') }),
    })
    .refine(data => data.password === data.password_confirmation, {
      message: t('form.confirmPassword.errors.mismatch'),
      path: ['password_confirmation'],
    }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await setupService.bootstrap(data);

      clearSetupCache();

      toast.success(t('success.title'), {
        description: t('success.description'),
      });

      if (result.survey_token) {
        sessionStorage.setItem('survey_token', result.survey_token);
        navigate('/setup/onboarding', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || t('error.generic');

      if (err?.response?.status === 409) {
        setError(t('error.alreadySetup'));
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng as Locale);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-t from-primary/20 via-background/95 to-background">
      <div className="absolute top-4 right-4">
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <Globe className="h-4 w-4 text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-BR">{t('language.portuguese')}</SelectItem>
            <SelectItem value="en">{t('language.english')}</SelectItem>
            <SelectItem value="es">{t('language.spanish')}</SelectItem>
            <SelectItem value="fr">{t('language.french')}</SelectItem>
            <SelectItem value="it">{t('language.italian')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={logo}
            alt="EVO CRM"
            className="h-10"
          />
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('form.firstName.label')}</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder={t('form.firstName.placeholder')}
                  disabled={isLoading}
                  {...register('first_name')}
                />
                {errors.first_name && (
                  <p className="text-destructive text-sm">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t('form.lastName.label')}</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder={t('form.lastName.placeholder')}
                  disabled={isLoading}
                  {...register('last_name')}
                />
                {errors.last_name && (
                  <p className="text-destructive text-sm">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('form.email.label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('form.email.placeholder')}
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('form.password.label')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('form.password.placeholder')}
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t('form.confirmPassword.label')}</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder={t('form.confirmPassword.placeholder')}
                disabled={isLoading}
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <p className="text-destructive text-sm">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('form.submit.loading') : t('form.submit.idle')}
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>{t('footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
