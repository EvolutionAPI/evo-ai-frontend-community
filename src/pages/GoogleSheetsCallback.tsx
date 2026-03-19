import GoogleSheetsService from '@/services/integrations/googleSheetsService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const GoogleSheetsCallback = createCallbackPage({
  integrationName: 'Google Sheets',
  service: GoogleSheetsService,
  iconPath: '/integrations/google-sheets.png',
  iconPathDark: '/integrations/google-sheets.png',
  onSuccess: async (response, agentId) => {
    await GoogleSheetsService.saveConfiguration(agentId, {
      provider: 'google_sheets',
      email: response.email,
      connected: true,
      spreadsheets: response.spreadsheets || [],
    });
  },
});

export default GoogleSheetsCallback;
