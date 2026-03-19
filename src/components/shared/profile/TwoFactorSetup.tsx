import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  RadioGroup,
  RadioGroupItem,
  Badge,
} from '@evoapi/design-system';
import { Shield, Smartphone, Mail, AlertTriangle, Check, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { twoFactorService } from '@/services/profile/twoFactorService';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorSetupProps {
  onUpdate?: () => void;
}

const TwoFactorSetup = ({ onUpdate }: TwoFactorSetupProps) => {
  const { t } = useLanguage('profile');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const mfaEnabled = user?.mfa_enabled ?? false;

  // Setup state
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email'>('totp');
  const [setupStep, setSetupStep] = useState<'method' | 'configure' | 'verify' | 'backup'>('method');

  // TOTP setup
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Verification
  const [verificationCode, setVerificationCode] = useState('');

  // Disable dialog
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);

  const handleEnableMfa = async () => {
    setIsLoading(true);
    try {
      const response = await twoFactorService.enable(selectedMethod);

      if (selectedMethod === 'totp') {
        setQrCode(response.qr_code || '');
        setSecretKey(response.secret || '');
        setBackupCodes(response.backup_codes || []);
        setSetupStep('configure');
      } else {
        setSetupStep('verify');
        toast.success(t('twoFactor.notifications.emailCodeSent'));
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 401) {
        toast.error(t('twoFactor.notifications.passwordIncorrect'));
      } else {
        toast.error(t('twoFactor.notifications.enableError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error(t('twoFactor.verify.errors.invalidCode'));
      return;
    }

    setIsLoading(true);
    try {
      await twoFactorService.verify(verificationCode, selectedMethod, true);

      if (selectedMethod === 'totp' && backupCodes.length > 0) {
        setSetupStep('backup');
      } else {
        toast.success(t('twoFactor.notifications.enabled'));
        setSetupDialogOpen(false);
        resetSetupState();
        onUpdate?.();
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { attempts_remaining?: number } } };
      const attemptsRemaining = apiError.response?.data?.attempts_remaining;
      if (attemptsRemaining !== undefined) {
        toast.error(t('twoFactor.verify.errors.attemptsRemaining', { attempts: attemptsRemaining }));
      } else {
        toast.error(t('twoFactor.verify.errors.invalidCode'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setIsLoading(true);
    try {
      await twoFactorService.disable();
      toast.success(t('twoFactor.notifications.disabled'));
      setDisableDialogOpen(false);
      onUpdate?.();
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 401) {
        toast.error(t('twoFactor.notifications.passwordIncorrect'));
      } else {
        toast.error(t('twoFactor.notifications.disableError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await twoFactorService.regenerateBackupCodes();
      setBackupCodes(response.backup_codes);
      setSetupStep('backup');
      setSetupDialogOpen(true);
      toast.success(t('twoFactor.backupCodes.regenerated'));
    } catch {
      toast.error(t('twoFactor.notifications.backupCodesError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    setIsLoading(true);
    try {
      await twoFactorService.sendEmailCode();
      toast.success(t('twoFactor.notifications.emailCodeResent'));
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 429) {
        toast.error(t('twoFactor.notifications.emailCodeRateLimit'));
      } else {
        toast.error(t('twoFactor.notifications.emailCodeError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('accessToken.notifications.copied'));
    } catch {
      toast.error(t('accessToken.notifications.copyError'));
    }
  };

  const copyAllBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    await copyToClipboard(codesText);
  };

  const resetSetupState = () => {
    setSetupStep('method');
    setVerificationCode('');
    setQrCode('');
    setSecretKey('');
    setBackupCodes([]);
    setSelectedMethod('totp');
  };

  const renderSetupDialog = () => {
    switch (setupStep) {
      case 'method':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('twoFactor.setup.title')}</DialogTitle>
              <DialogDescription>
                {t('twoFactor.setup.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>{t('twoFactor.setup.methodSelection')}</Label>
                <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'totp' | 'email')}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="totp" id="totp" />
                    <Label htmlFor="totp" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">{t('twoFactor.setup.totp.title')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('twoFactor.setup.totp.description')}
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">{t('twoFactor.setup.email.title')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('twoFactor.setup.email.description')}
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSetupDialogOpen(false);
                resetSetupState();
              }}>
                {t('twoFactor.setup.actions.cancel')}
              </Button>
              <Button onClick={handleEnableMfa} disabled={isLoading}>
                {isLoading ? t('twoFactor.setup.actions.processing') : t('twoFactor.setup.actions.continue')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'configure':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('twoFactor.configure.title')}</DialogTitle>
              <DialogDescription>
                {t('twoFactor.configure.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {qrCode ? (
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                    className="flex justify-center items-center"
                    style={{ minHeight: '200px', minWidth: '200px' }}
                  />
                </div>
              ) : (
                <div className="flex justify-center p-4 bg-gray-100 rounded-lg border">
                  <div className="text-center">
                    <p className="text-gray-500">{t('twoFactor.configure.qrCodeLoading')}</p>
                    <p className="text-sm text-gray-400">{t('twoFactor.configure.qrCodeError')}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('twoFactor.configure.manualKey')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={secretKey || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('twoFactor.configure.manualKeyDescription')}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSetupDialogOpen(false);
                resetSetupState();
              }              }>
                {t('twoFactor.setup.actions.cancel')}
              </Button>
              <Button onClick={() => setSetupStep('verify')}>
                {t('twoFactor.configure.actions.configured')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'verify':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('twoFactor.verify.title')}</DialogTitle>
              <DialogDescription>
                {selectedMethod === 'totp'
                  ? t('twoFactor.verify.descriptionTotp')
                  : t('twoFactor.verify.descriptionEmail')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">{t('twoFactor.verify.codeLabel')}</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {selectedMethod === 'email' && (
                <Button
                  variant="link"
                  onClick={handleResendEmailCode}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('twoFactor.verify.resendEmail')}
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSetupStep(selectedMethod === 'totp' ? 'configure' : 'method')}>
                {t('twoFactor.verify.actions.back')}
              </Button>
              <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? t('twoFactor.verify.actions.verifying') : t('twoFactor.verify.actions.verify')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'backup':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('twoFactor.backupCodes.title')}</DialogTitle>
              <DialogDescription>
                {t('twoFactor.backupCodes.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('twoFactor.backupCodes.warning')}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={copyAllBackupCodes}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('twoFactor.backupCodes.copyAll')}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setSetupDialogOpen(false);
                resetSetupState();
                onUpdate?.();
                toast.success(t('twoFactor.notifications.enabled'));
              }}>
                <Check className="h-4 w-4 mr-2" />
                {t('twoFactor.backupCodes.complete')}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('twoFactor.title')}</CardTitle>
            </div>
            {mfaEnabled && (
              <Badge variant="default">
                {t('twoFactor.status.enabled')}
              </Badge>
            )}
          </div>
          <CardDescription>
            {t('twoFactor.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaEnabled ? (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {t('twoFactor.info')}
                </AlertDescription>
              </Alert>
              <Button onClick={() => setSetupDialogOpen(true)}>
                <Shield className="h-4 w-4 mr-2" />
                {t('twoFactor.actions.enable')}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t('twoFactor.status.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('twoFactor.status.configured')}
                  </p>
                </div>
                <Badge variant="success">
                  <Check className="h-3 w-3 mr-1" />
                  {t('twoFactor.status.enabled')}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t('twoFactor.backupCodes.title')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('twoFactor.backupCodes.regenerateDescription')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('twoFactor.backupCodes.regenerate')}
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setDisableDialogOpen(true)}
                >
                  {t('twoFactor.actions.disable')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={(open) => {
        if (!open) resetSetupState();
        setSetupDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          {renderSetupDialog()}
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('twoFactor.disable.title')}</DialogTitle>
            <DialogDescription>
              {t('twoFactor.disable.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('twoFactor.disable.warning')}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              {t('twoFactor.disable.actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMfa}
              disabled={isLoading}
            >
              {isLoading ? t('twoFactor.disable.actions.disabling') : t('twoFactor.disable.actions.disable')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoFactorSetup;
