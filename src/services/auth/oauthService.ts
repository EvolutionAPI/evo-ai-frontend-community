import apiAuth from '@/services/core/apiAuth';
import { extractData } from '@/utils/apiHelpers';
import type {
  OAuthAccount,
  CreateOAuthApplicationRequest,
  CreateOAuthAuthorizationRequest,
  OAuthAuthorizationResponse,
} from '@/types/auth';

// Re-export types for convenience
export type { OAuthAccount } from '@/types/auth';

export const getOAuthAccounts = async (): Promise<OAuthAccount[]> => {
  const response = await apiAuth.get('/oauth/accounts');
  return extractData<any>(response);
};

export const createOAuthApplication = async (
  data: CreateOAuthApplicationRequest,
): Promise<void> => {
  await apiAuth.post('/oauth/applications', data);
};

export const createOAuthAuthorization = async (
  data: CreateOAuthAuthorizationRequest,
): Promise<OAuthAuthorizationResponse> => {
  const response = await apiAuth.post('/oauth/authorize', data);
  return extractData<any>(response);
};
