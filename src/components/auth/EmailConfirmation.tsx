import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Button, Alert, AlertDescription } from '@evoapi/design-system';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { confirmEmail, resendConfirmation } from '@/services/auth/authService';

import { AppLogo } from '@/components/AppLogo';

const EmailConfirmation = () => {
  const { t } = useLanguage('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>(
    'pending',
  );
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const confirmationToken = searchParams.get('confirmation_token');

  useEffect(() => {
    if (confirmationToken) {
      handleConfirmEmail();
    }
  }, [confirmationToken]);

  const handleConfirmEmail = async () => {
    if (!confirmationToken) {
      setConfirmationStatus('error');
      setMessage(t('auth.emailConfirmation.tokenNotFound'));
      return;
    }

    setIsLoading(true);
    try {
      await confirmEmail(confirmationToken);
      setConfirmationStatus('success');
      setMessage(t('auth.emailConfirmation.success'));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      setConfirmationStatus('error');
      setMessage(
        error?.response?.data?.message ||
          t('auth.emailConfirmation.error'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error(t('auth.emailConfirmation.resend.enterEmail'));
      return;
    }

    setIsLoading(true);
    try {
      await resendConfirmation(email);
      toast.success(t('auth.emailConfirmation.resend.success'));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('auth.emailConfirmation.resend.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (confirmationStatus) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return isLoading ? (
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        ) : (
          <Mail className="h-12 w-12 text-primary" />
        );
    }
  };

  const getStatusVariant = () => {
    switch (confirmationStatus) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-t from-primary/20 via-background/95 to-background relative">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <AppLogo className="h-10 mx-auto" />
        </div>

        {/* Card */}
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center mb-4">{getStatusIcon()}</div>
            <h2 className="text-2xl font-bold">{t('auth.emailConfirmation.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {confirmationToken ? t('auth.emailConfirmation.confirming') : t('auth.emailConfirmation.confirm')}
            </p>
          </div>

          <div className="space-y-4">
            {message && (
              <Alert variant={getStatusVariant()}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {confirmationStatus === 'success' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('auth.emailConfirmation.redirecting')}
                </p>
              </div>
            )}

            {(confirmationStatus === 'error' || !confirmationToken) && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('auth.emailConfirmation.resend.title')}
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.emailConfirmation.resend.placeholder')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <Button
                  onClick={handleResendConfirmation}
                  disabled={isLoading || !email}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('auth.emailConfirmation.resend.sending')}
                    </>
                  ) : (
                    t('auth.emailConfirmation.resend.button')
                  )}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button variant="link" onClick={() => navigate('/auth')} className="text-sm">
                {t('auth.emailConfirmation.backToLogin')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
