import PayPalService from '@/services/integrations/paypalService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const PayPalCallback = createCallbackPage({
  integrationName: 'PayPal',
  service: PayPalService,
  iconPath: '/integrations/paypal.png',
});

export default PayPalCallback;
