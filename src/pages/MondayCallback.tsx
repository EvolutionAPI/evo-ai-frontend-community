import MondayService from '@/services/integrations/mondayService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const MondayCallback = createCallbackPage({
  integrationName: 'Monday',
  service: MondayService,
  iconPath: '/integrations/monday.png',
});

export default MondayCallback;
