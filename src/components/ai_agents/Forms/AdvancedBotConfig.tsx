import { useCallback } from 'react';
import {
  Label,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Textarea,
} from '@evoapi/design-system';
import { Zap, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface AdvancedBotConfigData {
  // Configurações de mensagem
  message_wait_time: number; // Tempo de espera de mensagens (segundos)
  message_signature: string; // Assinatura da mensagem

  // Configurações de segmentação de texto
  enable_text_segmentation: boolean; // Habilitar segmentação de texto
  max_characters_per_segment: number; // Máximo de caracteres por segmento
  min_segment_size: number; // Tamanho mínimo do segmento
  character_delay_ms: number; // Delay por caractere (milissegundos)
}

interface AdvancedBotConfigProps {
  data: AdvancedBotConfigData;
  onChange: (data: AdvancedBotConfigData) => void;
  isReadOnly?: boolean;
}

const AdvancedBotConfig = ({ data, onChange, isReadOnly = false }: AdvancedBotConfigProps) => {
  const { t } = useLanguage('aiAgents');
  const handleInputChange = useCallback(
    (field: keyof AdvancedBotConfigData, value: string | number | boolean) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange],
  );

  return (
    <div className="space-y-6">
      {/* Card das Configurações de Mensagem */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>{t('advancedBot.messageHandling')}</CardTitle>
              <CardDescription>
                {t('advancedBot.messageHandlingDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-wait-time" className="text-sm font-medium">
              {t('advancedBot.messageWaitTime')}
            </Label>
            <Input
              id="message-wait-time"
              type="number"
              min={0}
              max={60}
              value={data.message_wait_time}
              onChange={e => {
                const value = parseInt(e.target.value);
                handleInputChange('message_wait_time', isNaN(value) ? 5 : value);
              }}
              disabled={isReadOnly}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              {t('advancedBot.messageWaitTimeDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-signature" className="text-sm font-medium">
              {t('advancedBot.messageSignature')}
            </Label>
            <Textarea
              id="message-signature"
              value={data.message_signature || ''}
              onChange={e => handleInputChange('message_signature', e.target.value)}
              placeholder={t('advancedBot.messageSignaturePlaceholder')}
              rows={3}
              disabled={isReadOnly}
            />
            <p className="text-xs text-muted-foreground">
              {t('advancedBot.messageSignatureDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card das Configurações de Segmentação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>{t('advancedBot.textSegmentation')}</CardTitle>
              <CardDescription>
                {t('advancedBot.textSegmentationDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-text-segmentation"
              checked={data.enable_text_segmentation}
              onCheckedChange={value => handleInputChange('enable_text_segmentation', value)}
              disabled={isReadOnly}
            />
            <Label htmlFor="enable-text-segmentation" className="text-sm font-medium">
              {t('advancedBot.enableTextSegmentation')}
            </Label>
          </div>

          {data.enable_text_segmentation && (
            <div className="space-y-4 ml-6 border-l-2 border-purple-200 pl-4">
              <div className="space-y-2">
                <Label htmlFor="max-characters-per-segment" className="text-sm font-medium">
                  {t('advancedBot.maxCharactersPerSegment')}
                </Label>
                <Input
                  id="max-characters-per-segment"
                  type="number"
                  min={50}
                  max={2000}
                  value={data.max_characters_per_segment}
                  onChange={e => handleInputChange('max_characters_per_segment', parseInt(e.target.value) || 300)}
                  disabled={isReadOnly}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  {t('advancedBot.maxCharactersDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-segment-size" className="text-sm font-medium">
                  {t('advancedBot.minSegmentSize')}
                </Label>
                <Input
                  id="min-segment-size"
                  type="number"
                  min={10}
                  max={500}
                  value={data.min_segment_size}
                  onChange={e => handleInputChange('min_segment_size', parseInt(e.target.value) || 50)}
                  disabled={isReadOnly}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  {t('advancedBot.minSegmentDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="character-delay-ms" className="text-sm font-medium">
                  {t('advancedBot.characterDelayMs')}
                </Label>
                <Input
                  id="character-delay-ms"
                  type="number"
                  min={0}
                  max={1000}
                  step={0.01}
                  value={data.character_delay_ms}
                  onChange={e => handleInputChange('character_delay_ms', parseFloat(e.target.value) || 0.05)}
                  disabled={isReadOnly}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  {t('advancedBot.characterDelayDescription')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedBotConfig;
