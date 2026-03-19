import NotionService from '@/services/integrations/notionService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const NotionCallback = createCallbackPage({
  integrationName: 'Notion',
  service: NotionService,
  iconPath: '/integrations/notion.png',
});

export default NotionCallback;
