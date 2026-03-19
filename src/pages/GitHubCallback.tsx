import GitHubService from '@/services/integrations/githubService';
import { createCallbackPage } from '@/utils/createCallbackPage';

const GitHubCallback = createCallbackPage({
  integrationName: 'GitHub',
  service: GitHubService,
  iconPath: '/integrations/github.png',
});

export default GitHubCallback;
