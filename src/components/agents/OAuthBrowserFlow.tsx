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

// The backend pins the redirect URI to this value; any callback pasted by the
// user must start with it, otherwise we refuse to send it to auth-complete.
const EXPECTED_CALLBACK_ORIGIN = 'http://localhost:1455/auth/callback';

interface ParsedCallback {
  code: string;
  state: string;
}

/**
 * Parse a callback URL pasted by the user and validate that it came from the
 * expected redirect target, that it carries both `code` and `state`, and that
 * `state` matches the value we generated at start-auth. Throws a user-facing
 * Error otherwise.
 */
function parseCallbackUrl(raw: string, expectedState: string): ParsedCallback {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error('Invalid callback URL. Please paste the full URL from the browser.');
  }

  const callbackBase = `${url.origin}${url.pathname}`;
  if (callbackBase !== EXPECTED_CALLBACK_ORIGIN) {
    throw new Error(
      `Unexpected callback origin "${callbackBase}". Expected "${EXPECTED_CALLBACK_ORIGIN}".`
    );
  }

  const error = url.searchParams.get('error');
  if (error) {
    const description = url.searchParams.get('error_description') || '';
    throw new Error(`Authorization rejected: ${error}${description ? ` (${description})` : ''}`);
  }

  const code = url.searchParams.get('code');
  if (!code) {
    throw new Error('Callback URL is missing the "code" parameter.');
  }

  const returnedState = url.searchParams.get('state');
  if (!returnedState || returnedState !== expectedState) {
    throw new Error('State mismatch — the callback URL does not belong to this flow.');
  }

  return { code, state: returnedState };
}

function extractStateFromAuthorizeUrl(authorizeUrl: string): string {
  try {
    return new URL(authorizeUrl).searchParams.get('state') || '';
  } catch {
    return '';
  }
}

export function OAuthBrowserFlow({ name = 'OpenAI Codex', onSuccess, onCancel }: OAuthBrowserFlowProps) {
  const [state, setState] = useState<FlowState>('idle');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [keyId, setKeyId] = useState('');
  const [expectedState, setExpectedState] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartAuth = async () => {
    try {
      setState('idle');
      setErrorMessage('');
      const data = await startOAuthFlow(name);
      setKeyId(data.key_id);
      setExpectedState(extractStateFromAuthorizeUrl(data.authorize_url));
      window.open(data.authorize_url, '_blank');
      setState('waiting');
    } catch (err) {
      console.error('OAuthBrowserFlow: startOAuthFlow failed', err);
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start OAuth flow.');
    }
  };

  const handleCompleteAuth = async () => {
    try {
      // Fail early with a clear message if the pasted URL is malformed,
      // has the wrong origin, carries an error, or has a wrong state.
      parseCallbackUrl(callbackUrl, expectedState);
    } catch (err) {
      console.warn('OAuthBrowserFlow: callback URL rejected', err);
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Invalid callback URL.');
      return;
    }

    try {
      setState('submitting');
      await completeOAuthFlow(keyId, callbackUrl);
      setState('success');
      setTimeout(() => onSuccess(keyId), 1500);
    } catch (err) {
      console.error('OAuthBrowserFlow: completeOAuthFlow failed', err);
      setState('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to complete authentication. Please try again.'
      );
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
        <p className="text-sm text-red-600 text-center max-w-md">{errorMessage}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleStartAuth}>Try Again</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (state === 'waiting' || state === 'submitting') {
    const urlLooksComplete = callbackUrl.includes('code=') && callbackUrl.includes('state=');
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
            placeholder="Paste the callback URL here (contains ?code=...&state=...)"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            disabled={state === 'submitting'}
            className="font-mono text-xs"
          />
          {callbackUrl && !urlLooksComplete && (
            <p className="text-xs text-amber-600">
              URL must contain both a "code=" and a "state=" parameter
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={state === 'submitting'}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteAuth}
            disabled={!urlLooksComplete || state === 'submitting'}
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
