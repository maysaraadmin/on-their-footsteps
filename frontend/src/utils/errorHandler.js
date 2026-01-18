/**
 * Error handling utility for consistent error messages and handling
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status = null, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Get a user-friendly error message based on the error object
 * @param {Error|Object} error - The error object from the API or a thrown error
 * @param {string} defaultMessage - Default message to show if no specific message can be determined
 * @returns {string} A user-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.') => {
  if (!error) return defaultMessage;
  
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  // If it's an API error with a response
  if (error.response) {
    // Use the error message from the API if available
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    
    // Default messages for common HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'طلب غير صالح. يرجى التحقق من البيانات المدخلة.';
      case 401:
        return 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.';
      case 403:
        return 'ليس لديك صلاحية للوصول إلى هذا المورد.';
      case 404:
        return 'لم يتم العثور على المورد المطلوب.';
      case 422:
        return 'البيانات المدخلة غير صالحة. يرجى التحقق من الحقول.';
      case 429:
        return 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقًا.';
      case 500:
        return 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.';
      default:
        return defaultMessage;
    }
  }
  
  // Handle network errors
  if (error.message === 'Network Error') {
    return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
  }
  
  // Handle cancelled requests
  if (error.name === 'AbortError') {
    return 'تم إلغاء الطلب';
  }
  
  // Return the error message if it exists, otherwise return the default message
  return error.message || defaultMessage;
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error object from the API
 * @param {Object} options - Additional options
 * @param {Function} options.onError - Callback function to handle the error
 * @param {string} options.defaultMessage - Default error message
 * @param {boolean} options.showToast - Whether to show a toast notification
 * @param {Object} options.toast - Toast function from react-toastify
 * @returns {void}
 */
export const handleApiError = (error, {
  onError,
  defaultMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  showToast = true,
  toast = null
} = {}) => {
  const errorMessage = getErrorMessage(error, defaultMessage);
  
  // Don't handle cancelled requests
  if (error.name === 'AbortError') {
    return;
  }
  
  // Log the error for debugging
  console.error('API Error:', {
    error,
    message: errorMessage,
    stack: error.stack
  });
  
  // Call the provided error handler if it exists
  if (typeof onError === 'function') {
    onError(errorMessage, error);
  }
  
  // Show toast notification if enabled and toast function is provided
  if (showToast && toast && typeof toast === 'function') {
    toast(errorMessage, { type: 'error' });
  }
  
  // Rethrow the error to allow for further handling
  throw error;
};

/**
 * Handle form validation errors
 * @param {Object} error - The error object from form validation
 * @param {Object} setError - React Hook Form's setError function
 * @param {Object} options - Additional options
 * @param {Function} options.onError - Callback function to handle the error
 * @param {Object} options.toast - Toast function from react-toastify
 * @returns {void}
 */
export const handleValidationError = (error, setError, {
  onError,
  toast = null
} = {}) => {
  if (error.response?.status === 422 && error.response.data?.errors) {
    // Handle Laravel validation errors
    const { errors } = error.response.data;
    
    // Set field errors
    Object.keys(errors).forEach((field) => {
      setError(field, {
        type: 'manual',
        message: errors[field][0]
      });
    });
    
    // Call the provided error handler if it exists
    if (typeof onError === 'function') {
      onError('الرجاء تصحيح الأخطاء في النموذج', error);
    }
    
    // Show toast with general error message
    if (toast && typeof toast === 'function') {
      toast('الرجاء تصحيح الأخطاء في النموذج', { type: 'error' });
    }
  } else {
    // Handle other types of errors
    handleApiError(error, {
      onError,
      toast,
      defaultMessage: 'حدث خطأ أثناء التحقق من صحة النموذج. يرجى المحاولة مرة أخرى.'
    });
  }
};

/**
 * Create a safe async function wrapper that handles errors
 * @param {Function} asyncFn - The async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleApiError(error, options);
      throw error;
    }
  };
};
