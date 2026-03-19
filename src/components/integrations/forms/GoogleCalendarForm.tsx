import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function GoogleCalendarForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="GOOGLE_CALENDAR_CLIENT_ID"
        label={t('integrations.googleCalendar.clientId') || 'Google Calendar Client ID'}
        value={getValue('googleCalendarClientId')}
        onChange={(value) => onConfigChange('googleCalendarClientId', value)}
        placeholder="xxx.apps.googleusercontent.com"
      />
      <FormField
        id="GOOGLE_CALENDAR_CLIENT_SECRET"
        label={t('integrations.googleCalendar.clientSecret') || 'Google Calendar Client Secret'}
        value={getValue('googleCalendarClientSecret')}
        onChange={(value) => onConfigChange('googleCalendarClientSecret', value)}
        placeholder="GOCSPX-xxx"
        type="password"
      />
      <FormField
        id="GOOGLE_CALENDAR_REDIRECT_URI"
        label={t('integrations.googleCalendar.redirectUri') || 'Google Calendar Redirect URI'}
        value={getValue('googleCalendarRedirectUri')}
        onChange={(value) => onConfigChange('googleCalendarRedirectUri', value)}
        placeholder="https://your-domain.com/google-calendar/callback"
        type="url"
        description={t('integrations.googleCalendar.redirectUriDescription') || 'Redirect URI for Google Calendar OAuth. Configure this URL in Google Cloud Console for Calendar API access.'}
      />
    </div>
  );
}
