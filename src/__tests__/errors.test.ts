import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getZodErrorMessage,
  getAPIErrorMessage,
  getNetworkErrorMessage,
  getFieldErrorMessage,
  extractFieldErrors,
  ZOD_ERROR_MESSAGES,
  API_ERROR_MESSAGES,
  NETWORK_ERROR_MESSAGES,
  ERROR_MESSAGES,
} from '@/constants/errorMessages'
import { APIError, NetworkError } from '@/api/client'

// ============================================================================
// Error Message Mapping Tests
// ============================================================================

describe('Error Message Mapping', () => {
  describe('Zod Error Messages', () => {
    it('should map String.email to user-friendly message', () => {
      const message = getZodErrorMessage('String.email')
      expect(message).toBe('Please enter a valid email address')
    })

    it('should map String.min to user-friendly message', () => {
      const message = getZodErrorMessage('String.min')
      expect(message).toBe('Field value too short')
    })

    it('should map String.max to user-friendly message', () => {
      const message = getZodErrorMessage('String.max')
      expect(message).toBe('Field value too long')
    })

    it('should map Array.min to user-friendly message', () => {
      const message = getZodErrorMessage('Array.min')
      expect(message).toBe('At least one selection required')
    })

    it('should map Date.invalid to user-friendly message', () => {
      const message = getZodErrorMessage('Date.invalid')
      expect(message).toBe('Invalid date')
    })

    it('should return fallback message for unknown code', () => {
      const message = getZodErrorMessage('Unknown.code', 'Custom fallback')
      expect(message).toBe('Custom fallback')
    })

    it('should use default fallback when no message provided', () => {
      const message = getZodErrorMessage('Unknown.code')
      expect(message).toBe(ZOD_ERROR_MESSAGES['fallback'])
    })
  })

  describe('API Error Messages', () => {
    it('should map 400 to user-friendly message', () => {
      const message = getAPIErrorMessage('400')
      expect(message).toBe('Invalid request - please check your input')
    })

    it('should map 401 to authentication message', () => {
      const message = getAPIErrorMessage('401')
      expect(message).toBe('Session expired - please log in again')
    })

    it('should map 403 to authorization message', () => {
      const message = getAPIErrorMessage('403')
      expect(message).toBe('You do not have permission to perform this action')
    })

    it('should map 404 to not found message', () => {
      const message = getAPIErrorMessage('404')
      expect(message).toBe('Resource not found')
    })

    it('should map 500 to server error message', () => {
      const message = getAPIErrorMessage('500')
      expect(message).toBe('Server error - please try again later')
    })

    it('should map named error code UNAUTHORIZED', () => {
      const message = getAPIErrorMessage('UNAUTHORIZED')
      expect(message).toContain('Session expired')
    })

    it('should map numeric status codes', () => {
      const message = getAPIErrorMessage(422)
      expect(message).toContain('Validation failed')
    })

    it('should return default 500 message for unknown code', () => {
      const message = getAPIErrorMessage('999')
      expect(message).toBe(API_ERROR_MESSAGES['500'])
    })
  })

  describe('Network Error Messages', () => {
    it('should map NETWORK_ERROR code', () => {
      const message = getNetworkErrorMessage('NETWORK_ERROR')
      expect(message).toContain('Unable to reach server')
    })

    it('should map TIMEOUT code', () => {
      const message = getNetworkErrorMessage('TIMEOUT')
      expect(message).toContain('timed out')
    })

    it('should return default message for unknown code', () => {
      const message = getNetworkErrorMessage('UNKNOWN_ERROR', 'Custom fallback')
      expect(message).toBe('Custom fallback')
    })
  })
})

// ============================================================================
// Field Error Message Tests
// ============================================================================

describe('Field Error Message Extraction', () => {
  it('should extract message from string error', () => {
    const message = getFieldErrorMessage('Custom error message')
    expect(message).toBe('Custom error message')
  })

  it('should extract message from Error object', () => {
    const error = new Error('Something went wrong')
    const message = getFieldErrorMessage(error)
    expect(message).toBe('Something went wrong')
  })

  it('should extract message from object with code property', () => {
    const error = { code: 'String.email' }
    const message = getFieldErrorMessage(error)
    expect(message).toBe('Please enter a valid email address')
  })

  it('should extract message from object with status property', () => {
    const error = { status: 404 }
    const message = getFieldErrorMessage(error)
    expect(message).toBe('Resource not found')
  })

  it('should extract message from object with message property', () => {
    const error = { message: 'Custom object message' }
    const message = getFieldErrorMessage(error)
    expect(message).toBe('Custom object message')
  })

  it('should return default message for unrecognized error structure', () => {
    const error = { unknown: 'property' }
    const message = getFieldErrorMessage(error)
    expect(message).toBe('An error occurred')
  })

  it('should handle null error', () => {
    const message = getFieldErrorMessage(null)
    expect(message).toBe('An error occurred')
  })

  it('should handle undefined error', () => {
    const message = getFieldErrorMessage(undefined)
    expect(message).toBe('An error occurred')
  })
})

// ============================================================================
// Field Errors Extraction from API Response
// ============================================================================

describe('Extract Field Errors from API Response', () => {
  it('should extract flat field errors', () => {
    const apiError = {
      errors: {
        email: 'Invalid email format',
        name: 'Name is required',
      },
    }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors).toEqual({
      email: 'Invalid email format',
      name: 'Name is required',
    })
  })

  it('should extract errors from data property', () => {
    const apiError = {
      data: {
        email: 'Email already exists',
      },
    }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors).toEqual({ email: 'Email already exists' })
  })

  it('should extract errors from details property', () => {
    const apiError = {
      details: {
        phone: 'Invalid phone number',
      },
    }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors).toEqual({ phone: 'Invalid phone number' })
  })

  it('should extract first error from array of errors', () => {
    const apiError = {
      errors: {
        email: ['Invalid format', 'Already in use'],
      },
    }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors.email).toBe('Invalid format')
  })

  it('should skip non-string error values', () => {
    const apiError = {
      errors: {
        email: 'Invalid email',
        count: 123,
        nested: { error: 'object' },
      },
    }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors).toEqual({ email: 'Invalid email' })
    expect(fieldErrors.count).toBeUndefined()
    expect(fieldErrors.nested).toBeUndefined()
  })

  it('should handle non-object input', () => {
    const fieldErrors1 = extractFieldErrors('string')
    expect(fieldErrors1).toEqual({})

    const fieldErrors2 = extractFieldErrors(null)
    expect(fieldErrors2).toEqual({})

    const fieldErrors3 = extractFieldErrors(undefined)
    expect(fieldErrors3).toEqual({})
  })

  it('should handle empty errors object', () => {
    const apiError = { errors: {} }
    const fieldErrors = extractFieldErrors(apiError)
    expect(fieldErrors).toEqual({})
  })
})

// ============================================================================
// API Error Class Tests
// ============================================================================

describe('APIError Class', () => {
  it('should create APIError with status and body', () => {
    const error = new APIError(404, { message: 'Not found' }, 'Resource not found')
    expect(error.status).toBe(404)
    expect(error.body).toEqual({ message: 'Not found' })
    expect(error.message).toBe('Resource not found')
    expect(error.name).toBe('APIError')
  })

  it('should create APIError with error code', () => {
    const error = new APIError(400, { error: 'VALIDATION_ERROR' }, 'Validation failed', 'VALIDATION_ERROR')
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('should default code to status string when not provided', () => {
    const error = new APIError(500, {}, 'Server error')
    expect(error.code).toBe('500')
  })

  it('should identify server errors (5xx)', () => {
    const error = new APIError(500, {}, 'Server error')
    expect(error.isServerError()).toBe(true)

    const error2 = new APIError(404, {}, 'Not found')
    expect(error2.isServerError()).toBe(false)
  })

  it('should identify client errors (4xx)', () => {
    const error = new APIError(400, {}, 'Bad request')
    expect(error.isClientError()).toBe(true)

    const error2 = new APIError(500, {}, 'Server error')
    expect(error2.isClientError()).toBe(false)
  })

  it('should identify not found errors (404)', () => {
    const error = new APIError(404, {}, 'Not found')
    expect(error.isNotFound()).toBe(true)

    const error2 = new APIError(400, {}, 'Bad request')
    expect(error2.isNotFound()).toBe(false)
  })
})

// ============================================================================
// NetworkError Class Tests
// ============================================================================

describe('NetworkError Class', () => {
  it('should create NetworkError with message', () => {
    const error = new NetworkError('Network failed')
    expect(error.message).toBe('Network failed')
    expect(error.name).toBe('NetworkError')
    expect(error.originalError).toBeUndefined()
  })

  it('should create NetworkError with original error', () => {
    const originalError = new Error('Connection timeout')
    const error = new NetworkError('Network failed', originalError)
    expect(error.originalError).toBe(originalError)
  })
})

// ============================================================================
// Error Message Constants Tests
// ============================================================================

describe('ERROR_MESSAGES Constants', () => {
  it('should have all required error message keys', () => {
    expect(ERROR_MESSAGES.GENERAL_ERROR).toBeDefined()
    expect(ERROR_MESSAGES.FORM_INVALID).toBeDefined()
    expect(ERROR_MESSAGES.SAVE_FAILED).toBeDefined()
    expect(ERROR_MESSAGES.SAVE_SUCCESS).toBeDefined()
    expect(ERROR_MESSAGES.OFFLINE).toBeDefined()
    expect(ERROR_MESSAGES.LOGIN_REQUIRED).toBeDefined()
    expect(ERROR_MESSAGES.SESSION_EXPIRED).toBeDefined()
  })

  it('should have user-friendly messages', () => {
    expect(typeof ERROR_MESSAGES.SAVE_SUCCESS).toBe('string')
    expect(ERROR_MESSAGES.SAVE_SUCCESS.length).toBeGreaterThan(0)
    expect(ERROR_MESSAGES.SAVE_SUCCESS).toContain('Saved')
  })
})

// ============================================================================
// Integration Tests
// ============================================================================

describe('Error Mapping Integration', () => {
  it('should map complete error flow from API response to user message', () => {
    // Simulate API error response
    const apiErrorResponse = {
      status: 422,
      body: {
        code: 'VALIDATION_ERROR',
        errors: {
          email: 'Invalid email format',
          name: 'Name is required',
        },
      },
    }

    // Get user message for the error
    const userMessage = getAPIErrorMessage(apiErrorResponse.status)
    expect(userMessage).toContain('Validation failed')

    // Extract field-level errors
    const fieldErrors = extractFieldErrors(apiErrorResponse.body)
    expect(fieldErrors).toEqual({
      email: 'Invalid email format',
      name: 'Name is required',
    })
  })

  it('should handle mixed error scenarios', () => {
    // Zod validation error
    const zodMsg = getZodErrorMessage('String.email')
    expect(zodMsg).toContain('email')

    // API error
    const apiMsg = getAPIErrorMessage(400)
    expect(apiMsg).toContain('Invalid')

    // Network error
    const networkMsg = getNetworkErrorMessage('TIMEOUT')
    expect(networkMsg).toContain('timed out')
  })

  it('should provide consistent fallback behavior', () => {
    const fallback1 = getZodErrorMessage('UNKNOWN')
    const fallback2 = getAPIErrorMessage('999')
    const fallback3 = getNetworkErrorMessage('UNKNOWN')

    expect(typeof fallback1).toBe('string')
    expect(typeof fallback2).toBe('string')
    expect(typeof fallback3).toBe('string')
    expect(fallback1.length).toBeGreaterThan(0)
    expect(fallback2.length).toBeGreaterThan(0)
    expect(fallback3.length).toBeGreaterThan(0)
  })
})
