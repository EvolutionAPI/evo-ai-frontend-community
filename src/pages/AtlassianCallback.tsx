import AtlassianService from '@/services/integrations/atlassianService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const AtlassianCallback = createCallbackPage({
  integrationName: 'Atlassian',
  service: AtlassianService,
  iconPath: '/integrations/atlassian.png',
});

export default AtlassianCallback;

