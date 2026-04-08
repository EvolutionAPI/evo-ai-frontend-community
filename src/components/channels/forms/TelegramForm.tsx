import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '../shared/FormField';
import { FormSection } from '../shared/FormSection';
import { FormData } from '@/hooks/channels/useChannelForm';

interface TelegramFormProps {
  form: FormData;
  onFormChange: (key: string, value: string | boolean) => void;
}

export const TelegramForm = ({ form, onFormChange }: TelegramFormProps) => {
  const { t } = useLanguage('telegram');
  const getStr = (key: string, fallback = ''): string =>
    typeof form[key] === 'string' ? (form[key] as string) : fallback;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2" data-tour="telegram-bot-token">
          <FormField
            label={t('fields.botToken.label')}
            value={getStr('bot_token')}
            onChange={value => onFormChange('bot_token', value)}
            placeholder={t('fields.botToken.placeholder')}
            required
            helpText={t('fields.botToken.helpText')}
          />
        </div>
      </div>

      <FormSection
        title={t('howToCreate.title')}
        className="bg-blue-50/10 border-blue-200/20"
        data-tour="telegram-instructions"
      >
        <div className="text-sm text-sidebar-foreground/70 space-y-2">
          <p><strong>1.</strong> {t('howToCreate.step1')}</p>
          <p><strong>2.</strong> {t('howToCreate.step2')}</p>
          <p><strong>3.</strong> {t('howToCreate.step3')}</p>
          <p><strong>4.</strong> {t('howToCreate.step4')}</p>
          <p><strong>5.</strong> {t('howToCreate.step5')}</p>
        </div>
      </FormSection>
    </div>
  );
};
