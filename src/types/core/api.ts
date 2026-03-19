/**
 * Standard API Response Types
 *
 * return responses in this standardized format.
 */

/**
 * Pagination metadata returned by paginated endpoints
 */
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
}

/**
 * Metadata included in all API responses
 */
export interface ResponseMeta {
  timestamp: string;
  pagination?: PaginationMeta;
  path?: string;
  method?: string;
}

/**
 * Error information structure
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

/**
 * Standard success response structure
 * @template T - The type of data being returned
 */
export interface StandardResponse<T = any> {
  success: true;
  data: T;
  meta: ResponseMeta;
  message?: string;
}

/**
 * Paginated response structure
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T = any> {
  success: true | false;
  data: T[];
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
  message?: string;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  success: false;
  error: ErrorInfo;
  meta: ResponseMeta;
}

/**
 * Union type for any API response
 */
export type ApiResponse<T = any> = StandardResponse<T> | ErrorResponse;

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard error codes as defined in API_RESPONSE_STANDARD.md
 */
export enum ApiErrorCode {
  // 400 Bad Request
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 401 Unauthorized
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ERR_INVALID_TOKEN = 'ERR_INVALID_TOKEN',
  ERR_EXPIRED_TOKEN = 'ERR_EXPIRED_TOKEN',
  ERR_TOKEN_NOT_FOUND = 'ERR_TOKEN_NOT_FOUND',

  // 403 Forbidden
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // 404 Not Found
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  NOT_FOUND = 'NOT_FOUND',
  JOURNEY_NOT_FOUND = 'JOURNEY_NOT_FOUND',
  CONTACT_NOT_FOUND = 'CONTACT_NOT_FOUND',
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',

  // 409 Conflict
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  CONFLICT = 'CONFLICT',

  // 422 Unprocessable Entity
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',

  // 500 Internal Server Error
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
}

/**
 * Type guard to check if response is a standard success response
 */
export function isStandardResponse<T>(data: any): data is StandardResponse<T> {
  return data && typeof data === 'object' && data.success === true && 'data' in data;
}

/**
 * Type guard to check if response is a paginated response
 */
export function isPaginatedResponse<T>(data: any): data is PaginatedResponse<T> {
  return (
    isStandardResponse(data) &&
    Array.isArray(data.data) &&
    data.meta?.pagination !== undefined
  );
}

/**
 * Type guard to check if response is an error response
 */
export function isErrorResponse(data: any): data is ErrorResponse {
  return data && typeof data === 'object' && data.success === false && 'error' in data;
}
