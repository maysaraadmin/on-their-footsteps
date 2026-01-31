/**
 * Standardized error types for consistent error handling
 */

// Base error interface
export interface BaseError {
  message: string;
  code?: string;
  status?: number;
  timestamp: string;
  context?: Record<string, any>;
}

// API Error
export interface ApiError extends BaseError {
  status: number;
  data?: any;
  headers?: Record<string, string>;
  config?: any;
}

// Network Error
export interface NetworkError extends BaseError {
  type: 'timeout' | 'network' | 'server' | 'unknown';
  originalError?: Error;
}

// Validation Error
export interface ValidationError extends BaseError {
  field: string;
  value?: any;
  rule: string;
}

// Authentication Error
export interface AuthError extends BaseError {
  type: 'unauthorized' | 'forbidden' | 'token_expired' | 'invalid_credentials';
  requiresReauth?: boolean;
}

// Application Error
export interface AppError extends BaseError {
  component?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

// Error response format
export interface ErrorResponse {
  success: false;
  error: ApiError | NetworkError | ValidationError | AuthError | AppError;
  timestamp: string;
  requestId?: string;
}

// Success response format
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// API Response type
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Error factory functions
export const createApiError = (
  message: string,
  status: number,
  data?: any,
  context?: Record<string, any>
): ApiError => ({
  message,
  status,
  ...(data && { data }),
  timestamp: new Date().toISOString(),
  ...(context && { context })
});

export const createNetworkError = (
  message: string,
  type: NetworkError['type'],
  originalError?: Error
): NetworkError => ({
  message,
  type,
  timestamp: new Date().toISOString(),
  ...(originalError && { originalError })
});

export const createValidationError = (
  message: string,
  field: string,
  value?: any,
  rule?: string
): ValidationError => ({
  message,
  field,
  ...(value !== undefined && { value }),
  rule: rule || 'validation',
  timestamp: new Date().toISOString()
});

export const createAuthError = (
  message: string,
  type: AuthError['type'],
  requiresReauth?: boolean
): AuthError => ({
  message,
  type,
  requiresReauth: requiresReauth || false,
  timestamp: new Date().toISOString()
});

export const createAppError = (
  message: string,
  component?: string,
  stack?: string
): AppError => ({
  message,
  ...(component && { component }),
  ...(stack && { stack }),
  timestamp: new Date().toISOString(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  url: typeof window !== 'undefined' ? window.location.href : 'unknown'
});

// Error type guards
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 
         typeof error.status === 'number' &&
         typeof error.message === 'string';
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error && typeof error === 'object' && 
         typeof error.type === 'string' &&
         ['timeout', 'network', 'server', 'unknown'].includes(error.type);
};

export const isValidationError = (error: any): error is ValidationError => {
  return error && typeof error === 'object' && 
         typeof error.field === 'string' &&
         typeof error.rule === 'string';
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error === 'object' && 
         typeof error.type === 'string' &&
         ['unauthorized', 'forbidden', 'token_expired', 'invalid_credentials'].includes(error.type);
};

export const isAppError = (error: any): error is AppError => {
  return error && typeof error === 'object' && 
         typeof error.message === 'string' &&
         typeof error.timestamp === 'string';
};

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  NETWORK_UNKNOWN: 'NETWORK_UNKNOWN',
  
  // Authentication errors
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_LENGTH: 'VALIDATION_INVALID_LENGTH',
  VALIDATION_INVALID_VALUE: 'VALIDATION_INVALID_VALUE',
  
  // Application errors
  APP_COMPONENT_ERROR: 'APP_COMPONENT_ERROR',
  APP_STATE_ERROR: 'APP_STATE_ERROR',
  APP_ROUTING_ERROR: 'APP_ROUTING_ERROR',
  APP_STORAGE_ERROR: 'APP_STORAGE_ERROR',
  
  // API errors
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_BAD_REQUEST: 'API_BAD_REQUEST',
  API_CONFLICT: 'API_CONFLICT',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  API_UNAVAILABLE: 'API_UNAVAILABLE'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
