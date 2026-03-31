import React from 'react';
import { AlertTriangle, Settings } from 'lucide-react';

import { Button } from '@evoapi/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@evoapi/design-system/card';

import { useLanguage } from '@/hooks/useLanguage';

interface ChannelDiagnosticProps {
  inboxId: string;
  onClose: () => void;
}

export const ChannelDiagnostic: React.FC<ChannelDiagnosticProps> = ({
  inboxId,
  onClose,
}) => {
  const { t } = useLanguage('chat');

  return (
    <Card className="max-w-md mx-auto mt-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          {t('channelDiagnostic.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-3">
            {t('channelDiagnostic.description')}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t('channelDiagnostic.inboxId')}</span>
              <span className="text-orange-600">#{inboxId}</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-100 p-3 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">{t('channelDiagnostic.possibleSolutions')}</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• {t('channelDiagnostic.solutions.checkChannel')}</li>
            <li>• {t('channelDiagnostic.solutions.confirmCredentials')}</li>
            <li>• {t('channelDiagnostic.solutions.testConnectivity')}</li>
            <li>• {t('channelDiagnostic.solutions.checkWebhooks')}</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              // Abrir configurações em nova aba
              window.open(`/settings/inboxes/${inboxId}`, '_blank');
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            {t('channelDiagnostic.settings')}
          </Button>

          <Button size="sm" variant="ghost" onClick={onClose} className="flex-1">
            {t('channelDiagnostic.close')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelDiagnostic;
