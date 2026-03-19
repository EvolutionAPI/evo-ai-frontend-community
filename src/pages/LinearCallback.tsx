import LinearService from '@/services/integrations/linearService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const LinearCallback = createCallbackPage({
  integrationName: 'Linear',
  service: LinearService,
  iconPath: '/integrations/linear.png',
  iconPathDark: '/integrations/linear-dark.png',
});

export default LinearCallback;
