/**
 * Global error handler for consistent error management
 * Provides centralized error logging and user notification
 */

import { toast } from 'react-hot-toast';
import { 
  createApiError, 
  createNetworkError, 
  createAppError, 
  createAuthError,
  isApiError,
  isNetworkError,
  isAuthError,
  ERROR_CODES 
} from '../types/errors';

class GlobalErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.isProcessing = false;
    this.errorCounts = new Map();
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Handle errors with logging and user notification
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  handleError(error, context = {}) {
    const errorInfo = this.formatError(error, context);
    
    // Log error
    this.logError(errorInfo);
    
    // Track error frequency
    this.trackError(errorInfo);
    
    // Show user notification
    this.notifyUser(errorInfo);
    
    // Send to error reporting service
    this.reportError(errorInfo);
  }

  /**
   * Format error information
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Object} Formatted error info
   */
  formatError(error, context) {
    const baseError = {
      message: error?.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      context: {
        ...context,
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      }
    };

    // Add error-specific properties
    if (isApiError(error)) {
      return {
        ...baseError,
        type: 'api_error',
        status: error.status,
        code: this.getErrorCode(error.status),
        data: error.data
      };
    }

    if (isNetworkError(error)) {
      return {
        ...baseError,
        type: 'network_error',
        code: ERROR_CODES.NETWORK_UNKNOWN,
        networkType: error.type
      };
    }

    if (isAuthError(error)) {
      return {
        ...baseError,
        type: 'auth_error',
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        authType: error.type,
        requiresReauth: error.requiresReauth
      };
    }

    return {
      ...baseError,
      type: 'app_error',
      code: ERROR_CODES.APP_COMPONENT_ERROR,
      stack: error?.stack
    };
  }

  /**
   * Get error code from status
   * @param {number} status - HTTP status
   * @returns {string} Error code
   */
  getErrorCode(status) {
    switch (status) {
      case 400: return ERROR_CODES.API_BAD_REQUEST;
      case 401: return ERROR_CODES.AUTH_UNAUTHORIZED;
      case 403: return ERROR_CODES.AUTH_FORBIDDEN;
      case 404: return ERROR_CODES.API_NOT_FOUND;
      case 409: return ERROR_CODES.API_CONFLICT;
      case 429: return ERROR_CODES.API_RATE_LIMITED;
      case 500: return ERROR_CODES.NETWORK_SERVER_ERROR;
      case 503: return ERROR_CODES.API_UNAVAILABLE;
      default: return ERROR_CODES.NETWORK_UNKNOWN;
    }
  }

  /**
   * Get current user ID
   * @returns {string} User ID or 'anonymous'
   */
  getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Log error to console
   * @param {Object} errorInfo - Error information
   */
  logError(errorInfo) {
    console.group(`🚨 Error: ${errorInfo.message}`);
    console.error('Error Details:', errorInfo);
    console.groupEnd();
  }

  /**
   * Track error frequency
   * @param {Object} errorInfo - Error information
   */
  trackError(errorInfo) {
    const errorKey = `${errorInfo.type}:${errorInfo.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // If error occurs too frequently, throttle notifications
    if (currentCount > 5) {
      errorInfo.throttled = true;
    }
  }

  /**
   * Show user notification
   * @param {Object} errorInfo - Error information
   */
  notifyUser(errorInfo) {
    // Don't show notifications for throttled errors
    if (errorInfo.throttled) {
      return;
    }

    // Don't show notifications for certain error types
    const silentErrors = [
      'unhandled_promise_rejection',
      'network_error'
    ];

    if (silentErrors.includes(errorInfo.context?.type)) {
      return;
    }

    const message = this.getUserFriendlyMessage(errorInfo);
    const severity = this.getErrorSeverity(errorInfo);

    switch (severity) {
      case 'error':
        toast.error(message, {
          duration: 5000,
          position: 'top-right'
        });
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          duration: 3000,
          position: 'top-right'
        });
        break;
      case 'info':
        toast(message, {
          duration: 2000,
          position: 'top-right'
        });
        break;
      default:
        toast.error(message);
    }
  }

  /**
   * Get user-friendly error message
   * @param {Object} errorInfo - Error information
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(errorInfo) {
    const { message, type, status, authType } = errorInfo;

    // Network errors
    if (type === 'network_error') {
      return 'Connection error. Please check your internet connection.';
    }

    // Authentication errors
    if (type === 'auth_error') {
      if (authType === 'unauthorized') {
        return 'Please log in to continue.';
      }
      if (authType === 'forbidden') {
        return 'You don\'t have permission to perform this action.';
      }
      if (authType === 'token_expired') {
        return 'Your session has expired. Please log in again.';
      }
    }

    // API errors
    if (type === 'api_error') {
      if (status === 404) {
        return 'The requested resource was not found.';
      }
      if (status === 429) {
        return 'Too many requests. Please try again later.';
      }
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }
    }

    // Default message
    return message || 'Something went wrong. Please try again.';
  }

  /**
   * Get error severity
   * @param {Object} errorInfo - Error information
   * @returns {string} Error severity
   */
  getErrorSeverity(errorInfo) {
    const { type, status, authType } = errorInfo;

    // Critical errors
    if (type === 'api_error' && status >= 500) {
      return 'error';
    }

    // Authentication errors
    if (type === 'auth_error' && authType === 'unauthorized') {
      return 'warning';
    }

    // Network errors
    if (type === 'network_error') {
      return 'warning';
    }

    // Default
    return 'error';
  }

  /**
   * Report error to monitoring service
   * @param {Object} errorInfo - Error information
   */
  async reportError(errorInfo) {
    // Only report in production
    if (import.meta.env.DEV) {
      return;
    }

    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  /**
   * Handle API errors specifically
   * @param {Error} error - API error
   * @param {Object} response - Response object
   */
  handleApiError(error, response = null) {
    const apiError = createApiError(
      error.message,
      response?.status || 0,
      response?.data,
      {
        url: response?.url,
        method: response?.config?.method
      }
    );

    this.handleError(apiError, {
      type: 'api_error',
      response
    });
  }

  /**
   * Handle component errors
   * @param {Error} error - Component error
   * @param {Object} componentInfo - Component information
   */
  handleComponentError(error, componentInfo) {
    const appError = createAppError(
      error.message,
      componentInfo.componentStack?.split('\n')[0]?.trim(),
      error.stack
    );

    this.handleError(appError, {
      type: 'component_error',
      componentStack: componentInfo.componentStack
    });
  }

  /**
   * Clear error queue
   */
  clearErrors() {
    this.errorQueue = [];
    this.errorCounts.clear();
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const uniqueErrors = this.errorCounts.size;

    return {
      totalErrors,
      uniqueErrors,
      errorCounts: Object.fromEntries(this.errorCounts),
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();
export default globalErrorHandler;
