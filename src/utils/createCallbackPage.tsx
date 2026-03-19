import CallbackPage from '@/components/integrations/CallbackPage';

interface IntegrationService {
  completeAuthorization: (
    accountId: string,
    agentId: string,
    code: string,
    state: string
  ) => Promise<{ success: boolean; error?: string; username?: string }>;
}

interface CallbackConfig {
  integrationName: string;
  service: IntegrationService;
  iconPath?: string;
  iconPathDark?: string;
  onSuccess?: (response: any, accountId: string, agentId: string) => Promise<void> | void;
  redirectPath?: string | ((agentId: string) => string);
}

/**
 * Helper function to create a callback page component
 * This eliminates code duplication across all callback pages
 */
export function createCallbackPage({ integrationName, service, iconPath, iconPathDark, onSuccess, redirectPath }: CallbackConfig) {
  function CallbackComponent() {
    return (
      <CallbackPage
        integrationName={integrationName}
        onCallback={async (code, state, accountId, agentId) => {
          // MCP integrations require both accountId and agentId
          if (!accountId || !agentId) {
            throw new Error('Account ID and Agent ID are required for MCP integrations');
          }
          return await service.completeAuthorization(accountId, agentId, code, state);
        }}
        onSuccess={onSuccess}
        redirectPath={redirectPath}
        iconPath={iconPath}
        iconPathDark={iconPathDark}
      />
    );
  }

  CallbackComponent.displayName = `${integrationName}Callback`;
  return CallbackComponent;
}

