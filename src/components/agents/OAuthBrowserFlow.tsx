'use client';

import { useState } from 'react';
import { Button, Input } from '@evoapi/design-system';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { startOAuthFlow, completeOAuthFlow } from '@/services/agents/agentService';

interface OAuthBrowserFlowProps {
  name?: string;
  onSuccess: (keyId: string) => void;
  onCancel: () => void;
}

type FlowState = 'idle' | 'waiting' | 'submitting' | 'success' | 'error';

export function OAuthBrowserFlow({ name = 'OpenAI Codex', onSuccess, onCancel }: OAuthBrowserFlowProps) {
  const [state, setState] = useState<FlowState>('idle');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [keyId, setKeyId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartAuth = async () => {
    try {
      setState('idle');
      const data = await startOAuthFlow(name);
      setKeyId(data.key_id);
      window.open(data.authorize_url, '_blank');
      setState('waiting');
    } catch (err) {
      setState('error');
      setErrorMessage('Failed to start OAuth flow.');
    }
  };

  const handleCompleteAuth = async () => {
    if (!callbackUrl.includes('code=')) return;
    try {
      setState('submitting');
      await completeOAuthFlow(keyId, callbackUrl);
      setState('success');
      setTimeout(() => onSuccess(keyId), 1500);
    } catch (err) {
      setState('error');
      setErrorMessage('Failed to complete authentication. Please try again.');
    }
  };

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-sm font-medium text-green-600">Connected successfully!</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-red-600">{errorMessage}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleStartAuth}>Try Again</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (state === 'waiting' || state === 'submitting') {
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Follow these steps:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
            <li>Sign in to your ChatGPT account in the tab that opened</li>
            <li>After authorizing, your browser will show an error page — this is expected</li>
            <li>Copy the full URL from your browser's address bar</li>
            <li>Paste it below and click Confirm</li>
          </ol>
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Paste the callback URL here (contains ?code=...)"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            disabled={state === 'submitting'}
            className="font-mono text-xs"
          />
          {callbackUrl && !callbackUrl.includes('code=') && (
            <p className="text-xs text-amber-600">URL must contain a "code=" parameter</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={state === 'submitting'}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteAuth}
            disabled={!callbackUrl.includes('code=') || state === 'submitting'}
          >
            {state === 'submitting' ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // idle state
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-sm text-muted-foreground text-center">
        Connect your ChatGPT Plus or Pro subscription to use GPT models.
      </p>
      <Button onClick={handleStartAuth} className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Connect with ChatGPT
      </Button>
    </div>
  );
}
