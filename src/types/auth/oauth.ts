export interface OAuthAccount {
  account_id: number;
  account_name: string;
}

export interface CreateOAuthApplicationRequest {
  client_id: string;
  account_id: number;
  redirect_uri: string;
}

export interface CreateOAuthAuthorizationRequest {
  client_id: string;
  redirect_uri: string;
  scope: string;
  state?: string | null;
  code_challenge?: string | null;
  code_challenge_method?: string | null;
}

export interface OAuthAuthorizationResponse {
  code: string;
  state?: string;
}