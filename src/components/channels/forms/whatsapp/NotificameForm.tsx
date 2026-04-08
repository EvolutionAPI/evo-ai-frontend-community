import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '../../shared/FormField';
import { FormSection } from '../../shared/FormSection';
import { FormData } from '@/hooks/channels/useChannelForm';
import { sanitizeInboxName } from '@/utils/sanitizeName';
import { PhoneInput } from '@/components/shared/PhoneInput';

interface NotificameFormProps {
  form: FormData;
  onFormChange: (key: string, value: string | boolean) => void;
}

export const NotificameForm = ({ form, onFormChange }: NotificameFormProps) => {
  const { t } = useLanguage('whatsapp');
  const getStr = (key: string, fallback = ''): string =>
    typeof form[key] === 'string' ? (form[key] as string) : fallback;

  const handleDisplayNameChange = (value: string) => {
    onFormChange('display_name', value);
    onFormChange('name', sanitizeInboxName(value));
  };

  return (
    <div className="space-y-6">
      {/* Display Name and Channel Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tour="whatsapp-credentials">
        <FormField
          label={t('notificameForm.fields.displayName.label')}
          value={getStr('display_name')}
          onChange={handleDisplayNameChange}
          placeholder={t('notificameForm.fields.displayName.placeholder')}
          helpText={t('notificameForm.fields.displayName.helpText')}
          required
        />
        <FormField
          label={t('notificameForm.fields.channelName.label')}
          value={getStr('name')}
          onChange={value => onFormChange('name', value)}
          placeholder={t('notificameForm.fields.channelName.placeholder')}
          helpText={t('notificameForm.fields.channelName.helpText')}
          required
          readOnly
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="text-sm font-medium text-sidebar-foreground/80 block mb-1">
          {t('notificameForm.fields.phoneNumber.label')} <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={getStr('phone_number')}
          onChange={value => onFormChange('phone_number', value)}
          placeholder={t('notificameForm.fields.phoneNumber.placeholder')}
          defaultCountry="BR"
        />
      </div>

      {/* API Token */}
      <FormField
        label={t('notificameForm.fields.apiToken.label')}
        value={getStr('api_token')}
        onChange={value => onFormChange('api_token', value)}
        placeholder={t('notificameForm.fields.apiToken.placeholder')}
        required
      />

      {/* Channel ID */}
      <FormField
        label={t('notificameForm.fields.channel.label')}
        value={getStr('channel_id')}
        onChange={value => onFormChange('channel_id', value)}
        placeholder={t('notificameForm.fields.channel.placeholder')}
        required
      />

      {/* Help Section */}
      <FormSection
        title={t('notificameForm.help.title')}
        className="bg-green-50/10 border-green-200/20"
        data-tour="whatsapp-help"
      >
        <div className="text-sm text-sidebar-foreground/70 space-y-2">
          <p>
            <strong>
              {t('notificameForm.help.apiToken.title')}:
            </strong>{' '}
            {t('notificameForm.help.apiToken.description')}
          </p>
          <p>
            <strong>
              {t('notificameForm.help.channelId.title')}:
            </strong>{' '}
            {t('notificameForm.help.channelId.description')}
          </p>
          <p>
            <strong>{t('notificameForm.help.phone.title')}:</strong>{' '}
            {t('notificameForm.help.phone.description')}
          </p>
          <p>
            <strong>
              {t('notificameForm.help.support.title')}:
            </strong>{' '}
            {t('notificameForm.help.support.description')}
          </p>
        </div>
      </FormSection>
    </div>
  );
};
