/**
 * Error Message Mapping
 * Maps technical error codes (Zod, API, Network) to user-friendly messages
 * Supports German and English messages with fallback
 */

// ============================================================================
// Zod Error Code Mappings
// ============================================================================

export const ZOD_ERROR_MESSAGES: Record<string, string> = {
  // String validations
  'String.email': 'Please enter a valid email address',
  'String.min': 'Field value too short',
  'String.max': 'Field value too long',
  'String.url': 'Please enter a valid URL',
  'String.uuid': 'Invalid format',

  // Number validations
  'Number.min': 'Number must be at least {minimum}',
  'Number.max': 'Number must be at most {maximum}',
  'Number.int': 'Must be a whole number',
  'Number.finite': 'Must be a finite number',

  // Date validations
  'Date.invalid': 'Invalid date',
  'Date.min': 'Date must be after {minimum}',
  'Date.max': 'Date must be before {maximum}',

  // Array validations
  'Array.min': 'At least one selection required',
  'Array.max': 'Too many selections',

  // Object validations
  'Object.required': 'This field is required',
  'Object.base': 'Invalid input',

  // Generic validations
  'invalid_union': 'Invalid selection',
  'invalid_enum_value': 'Invalid option',
  'invalid_type': 'Invalid type',
  'invalid_literal': 'Invalid value',
  'custom': 'Invalid input',
  'fallback': 'Field is required',
};

// ============================================================================
// API Error Code Mappings (4xx/5xx)
// ============================================================================

export const API_ERROR_MESSAGES: Record<string, string> = {
  // 4xx Client Errors
  '400': 'Invalid request - please check your input',
  '401': 'Session expired - please log in again',
  '403': 'You do not have permission to perform this action',
  '404': 'Resource not found',
  '409': 'This resource already exists',
  '422': 'Validation failed - please review your input',
  '429': 'Too many requests - please wait before trying again',

  // 5xx Server Errors
  '500': 'Server error - please try again later',
  '501': 'This feature is not available',
  '502': 'Service temporarily unavailable',
  '503': 'Service is under maintenance',
  '504': 'Request timeout - please try again',

  // Named error codes
  'INCIDENT_NOT_FOUND': 'Incident not found',
  'UNAUTHORIZED': 'Session expired - please log in again',
  'FORBIDDEN': 'You do not have permission to access this resource',
  'CONFLICT': 'This resource already exists',
  'INTERNAL_SERVER_ERROR': 'An unexpected error occurred - please try again later',
  'BAD_REQUEST': 'Invalid request - please review your input',
  'VALIDATION_ERROR': 'Validation failed - please review your input',
  'UNPROCESSABLE_ENTITY': 'Validation failed - please review your input',
};

// ============================================================================
// Network Error Mappings
// ============================================================================

export const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  'NETWORK_ERROR': 'Unable to reach server - check your internet connection',
  'TIMEOUT': 'Request timed out - please try again',
  'ABORT': 'Request was cancelled',
  'FETCH_FAILED': 'Network connection failed',
  'CORS_ERROR': 'Cross-origin request failed',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get user-friendly error message from Zod error code
 * @param code - Zod error code (e.g., 'String.email')
 * @param defaultMessage - Fallback message if code not found
 * @returns User-friendly error message
 */
export function getZodErrorMessage(code: string, defaultMessage?: string): string {
  return ZOD_ERROR_MESSAGES[code] || defaultMessage || ZOD_ERROR_MESSAGES['fallback'];
}

/**
 * Get user-friendly error message from API error code/status
 * @param code - Status code (string) or error code
 * @param defaultMessage - Fallback message if code not found
 * @returns User-friendly error message
 */
export function getAPIErrorMessage(code: string | number, defaultMessage?: string): string {
  const codeStr = String(code);
  return API_ERROR_MESSAGES[codeStr] || defaultMessage || API_ERROR_MESSAGES['500'];
}

/**
 * Get user-friendly error message from network error code
 * @param code - Network error code
 * @param defaultMessage - Fallback message if code not found
 * @returns User-friendly error message
 */
export function getNetworkErrorMessage(code: string, defaultMessage?: string): string {
  return NETWORK_ERROR_MESSAGES[code] || defaultMessage || NETWORK_ERROR_MESSAGES['NETWORK_ERROR'];
}

/**
 * Get field-level error message from validation error
 * Handles Zod errors, API validation errors, and custom error messages
 * @param error - Error object (could be Zod error, API error, or custom)
 * @param fieldName - Field name for context
 * @returns User-friendly error message
 */
export function getFieldErrorMessage(error: unknown, _fieldName?: string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message;
    // Check for Zod error codes in message
    if (message.includes('String.')) {
      const code = message.split(':')[0].trim();
      return getZodErrorMessage(code);
    }
    return message;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Check for Zod error structure
    if ('code' in errorObj && typeof errorObj.code === 'string') {
      return getZodErrorMessage(errorObj.code);
    }

    // Check for API error structure
    if ('status' in errorObj && typeof errorObj.status === 'number') {
      return getAPIErrorMessage(errorObj.status);
    }

    // Check for message property
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
  }

  return 'An error occurred';
}

/**
 * Extract field errors from API validation response
 * API validation errors typically come in format:
 * { fieldName: 'error message', fieldName2: ['error1', 'error2'] }
 * @param apiError - API error response object
 * @returns Record mapping field names to error messages
 */
export function extractFieldErrors(apiError: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (typeof apiError !== 'object' || apiError === null) {
    return fieldErrors;
  }

  const errorObj = apiError as Record<string, unknown>;

  // Check common API error response structures
  const errorData = errorObj.errors || errorObj.data || errorObj.details || errorObj;

  if (typeof errorData === 'object' && errorData !== null) {
    Object.entries(errorData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        fieldErrors[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        fieldErrors[key] = value[0];
      }
    });
  }

  return fieldErrors;
}

// ============================================================================
// Error Message Constants for Common Scenarios
// ============================================================================

export const ERROR_MESSAGES = {
  // General
  GENERAL_ERROR: 'An error occurred - please try again',
  UNEXPECTED_ERROR: 'An unexpected error occurred',

  // Form/Validation
  FORM_INVALID: 'Please fix the errors below',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',

  // Save/Submit
  SAVE_FAILED: 'Failed to save - please try again',
  SAVE_SUCCESS: 'Saved successfully',
  DELETE_FAILED: 'Failed to delete - please try again',
  DELETE_SUCCESS: 'Deleted successfully',

  // Network
  OFFLINE: 'No internet connection',
  SLOW_CONNECTION: 'Network connection is slow',
  REQUEST_TIMEOUT: 'Request timed out - please try again',

  // Authorization
  LOGIN_REQUIRED: 'Please log in to continue',
  SESSION_EXPIRED: 'Your session has expired - please log in again',
  ACCESS_DENIED: 'You do not have access to this resource',

  // Server
  SERVICE_UNAVAILABLE: 'Service is currently unavailable',
  SERVER_ERROR: 'Server error - please try again later',
  MAINTENANCE: 'Service is under maintenance - please try again later',
};
