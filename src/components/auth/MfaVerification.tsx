import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
} from '@evoapi/design-system';
import { Shield, Smartphone, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import logo from '@/assets/EVO_CRM.png';

interface MfaVerificationProps {
  email: string;
  method: 'totp' | 'email';
  tempToken: string;
  onVerificationSuccess: (code: string) => Promise<void>;
  onResendEmailCode?: () => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
}

const MfaVerification = ({
  email,
  method,
  onVerificationSuccess,
  onResendEmailCode,
  onBack,
  isLoading = false,
}: MfaVerificationProps) => {
  const { t } = useLanguage('auth');
  const [code, setCode] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown para reenvio de email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error(t('auth.mfa.code.complete'));
      return;
    }

    try {
      await onVerificationSuccess(code);
    } catch (error: unknown) {
      setAttemptCount(prev => prev + 1);

      const apiError = error as { response?: { data?: { attempts_remaining?: number }; status?: number } };
      if (apiError.response?.data?.attempts_remaining !== undefined) {
        setRemainingAttempts(apiError.response.data.attempts_remaining);
      }

      if (apiError.response?.status === 423) {
        toast.error(t('auth.mfa.accountLocked'));
      } else {
        toast.error(t('auth.mfa.code.invalid', { remaining: remainingAttempts - 1 }));
      }
    }
  };

  const handleResendCode = async () => {
    if (!onResendEmailCode || !canResend) return;

    try {
      await onResendEmailCode();
      setCanResend(false);
      setResendCooldown(60); // 1 minute cooldown
      toast.success(t('auth.mfa.email.codeSent'));
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 429) {
        toast.error(t('auth.mfa.email.waitBeforeResend'));
      } else {
        toast.error(t('auth.mfa.sendError'));
      }
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  const isEmailMethod = method === 'email';
  const isTotpMethod = method === 'totp';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-t from-primary/20 via-background/95 to-background relative">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src={logo}
            alt="EVO CRM"
            className="h-10 mx-auto"
          />
        </div>

        {/* Formulário */}
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              {isTotpMethod ? (
                <Smartphone className="h-6 w-6 text-primary" />
              ) : (
                <Mail className="h-6 w-6 text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-bold">
              {t('auth.mfa.title')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isTotpMethod ? (
                t('auth.mfa.totp.description')
              ) : (
                <>
                  {t('auth.mfa.email.description')} <strong>{email}</strong>
                </>
              )}
            </p>
          </div>

          <div className="space-y-6">
            {/* Alert for remaining attempts */}
            {attemptCount > 0 && remainingAttempts > 0 && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {t('auth.mfa.remainingAttempts', { count: remainingAttempts })}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  {t('auth.mfa.code.label')}
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={t('auth.mfa.code.placeholder')}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground text-center">
                  {t('auth.mfa.code.hint')}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full"
                size="lg"
              >
                {isLoading ? t('auth.mfa.verifying') : t('auth.mfa.verify')}
              </Button>
            </form>

            {/* Email-specific actions */}
            {isEmailMethod && (
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendCode}
                    disabled={!canResend || isLoading}
                    className="text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {resendCooldown > 0
                      ? t('auth.mfa.email.resendIn', { seconds: resendCooldown })
                      : t('auth.mfa.email.resendButton')
                    }
                  </Button>
                </div>
              </div>
            )}

            {/* Back button */}
            {onBack && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('auth.mfa.backToLogin')}
                </Button>
              </div>
            )}

            {/* Help text */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {isTotpMethod ? (
                  t('auth.mfa.help.totp')
                ) : (
                  t('auth.mfa.help.email')
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaVerification;
