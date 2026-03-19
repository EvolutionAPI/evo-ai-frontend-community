import CanvaService from '@/services/integrations/canvaService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const CanvaCallback = createCallbackPage({
  integrationName: 'Canva',
  service: CanvaService,
  iconPath: '/integrations/canva.png',
});
export default CanvaCallback;

