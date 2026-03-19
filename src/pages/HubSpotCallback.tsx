import HubSpotService from '@/services/integrations/hubspotService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const HubSpotCallback = createCallbackPage({
  integrationName: 'HubSpot',
  service: HubSpotService,
  iconPath: '/integrations/hubspot.png',
  iconPathDark: '/integrations/hubspot-dark.png',
});

export default HubSpotCallback;
