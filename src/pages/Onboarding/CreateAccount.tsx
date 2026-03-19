import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { Button, Input, Label, Alert, AlertDescription } from '@evoapi/design-system';
import { accountService } from '@/services/account/accountService';
import type { CreateAccount } from '@/types/settings';
import { useAuth } from '@/contexts/AuthContext';

type CreateAccountFormData = {
  account_name: string;
  user_full_name: string;
  support_email: string;
};

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage('onboarding');
  const { user, refreshUser } = useAuth();

  const createAccountSchema = z.object({
    account_name: z
      .string()
      .min(1, { message: t('createAccount.form.organizationName.errors.required') })
      .min(2, { message: t('createAccount.form.organizationName.errors.minLength') }),
    user_full_name: z
      .string()
      .min(1, { message: t('createAccount.form.userFullName.errors.required') })
      .min(2, { message: t('createAccount.form.userFullName.errors.minLength') }),
    support_email: z
      .string()
      .min(1, { message: t('createAccount.form.support_email.errors.required') })
      .email({ message: t('createAccount.form.support_email.errors.invalid') }),
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      account_name: '',
      user_full_name: user?.name || '',
      support_email: ''
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload: CreateAccount = {
        account_name: data.account_name,
        user_full_name: data.user_full_name,
        email: user?.email || '',
        support_email: data.support_email,
        password: '', // Not needed since user is already authenticated
        locale: localStorage.getItem('i18nextLng') || 'en',
      };

      await accountService.createAccount(payload);

      toast.success(t('createAccount.success.title'), {
        description: t('createAccount.success.description'),
      });

      // Refresh user data to get the new account
      await refreshUser();

      // Redirect to conversations
      navigate('/conversations', { replace: true });
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      setError(err.message || t('createAccount.error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-t from-primary/20 via-background/95 to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t('createAccount.title')}</h1>
          <p className="text-muted-foreground">{t('createAccount.subtitle')}</p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">{t('createAccount.form.organizationName.label')}</Label>
              <Input
                id="account_name"
                type="text"
                placeholder={t('createAccount.form.organizationName.placeholder')}
                disabled={isLoading}
                {...register('account_name')}
              />
              {errors.account_name && (
                <p className="text-destructive text-sm">{errors.account_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_full_name">{t('createAccount.form.userFullName.label')}</Label>
              <Input
                id="user_full_name"
                type="text"
                placeholder={t('createAccount.form.userFullName.placeholder')}
                disabled={isLoading}
                {...register('user_full_name')}
              />
              {errors.user_full_name && (
                <p className="text-destructive text-sm">{errors.user_full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('createAccount.form.email.label')}</Label>
              <Input type="email" value={user?.email || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                {t('createAccount.form.email.helper')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_email">{t('createAccount.form.support_email.label')}</Label>
              <Input 
                id="support_email"
                type="email"
                placeholder={t('createAccount.form.support_email.label')}
                disabled={isLoading}
                {...register('support_email')}
              />
              {errors.support_email && (
                <p className="text-destructive text-sm">{errors.support_email.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('createAccount.form.support_email.helper')}
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? t('createAccount.form.submitButton.loading')
                : t('createAccount.form.submitButton.idle')}
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>{t('createAccount.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
