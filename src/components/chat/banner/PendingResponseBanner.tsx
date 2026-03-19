import { useState } from 'react';
import { Button } from '@evoapi/design-system/button';
import { Badge } from '@evoapi/design-system/badge';
import { Shield, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import FacebookModerationService from '@/services/channels/facebookModerationService';
import { FacebookCommentModeration } from '@/types';

interface PendingResponseBannerProps {
  moderation: FacebookCommentModeration;
  onModerationUpdated?: () => void;
}

export default function PendingResponseBanner({
  moderation,
  onModerationUpdated,
}: PendingResponseBannerProps) {
  const { t } = useLanguage('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await FacebookModerationService.approveModeration(moderation.id);
      toast.success(t('messages.moderation.banner.approved'));
      onModerationUpdated?.();
    } catch (error) {
      console.error('Error approving moderation:', error);
      toast.error(t('messages.moderation.banner.approveError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await FacebookModerationService.rejectModeration(moderation.id, rejectionReason);
      toast.success(t('messages.moderation.banner.rejected'));
      setRejectionReason('');
      onModerationUpdated?.();
    } catch (error) {
      console.error('Error rejecting moderation:', error);
      toast.error(t('messages.moderation.banner.rejectError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    setIsProcessing(true);
    try {
      await FacebookModerationService.regenerateResponse(moderation.id);
      toast.success(t('messages.moderation.banner.regenerated'));
      onModerationUpdated?.();
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error(t('messages.moderation.banner.regenerateError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!moderation.response_content) {
    return null;
  }

  return (
    <div className="mx-4 mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              {t('messages.moderation.banner.pendingApproval')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t('messages.moderation.banner.responseReady')}
            </span>
          </div>
          <div className="bg-background rounded-md p-3 mb-3 border border-border">
            <p className="text-sm font-medium mb-1 text-foreground">
              {t('messages.moderation.banner.generatedResponse')}
            </p>
            <p className="text-sm text-muted-foreground">{moderation.response_content}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('messages.moderation.banner.approve')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {t('messages.moderation.banner.regenerate')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4" />
              {t('messages.moderation.banner.reject')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
