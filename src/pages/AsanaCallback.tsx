import AsanaService from '@/services/integrations/asanaService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const AsanaCallback = createCallbackPage({
  integrationName: 'Asana',
  service: AsanaService,
  iconPath: '/integrations/asana.png',
});

export default AsanaCallback;
