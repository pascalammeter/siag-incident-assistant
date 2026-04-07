/**
 * HTTP Client for API calls with error handling, timeouts, and type safety
 * Handles network errors, non-2xx responses, and provides typed responses
 */

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Represents an HTTP error response (non-2xx status)
 * Can be caught and inspected for fallback logic
 */
export class APIError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.body = body;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a not found error (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }
}

/**
 * Represents a network error (fetch failed)
 * Used to trigger fallback logic
 */
export class NetworkError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

// ============================================================================
// API Client Implementation
// ============================================================================

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Get the base URL for API calls
 * Use NEXT_PUBLIC_API_URL environment variable if set, otherwise empty string for same-origin
 */
function getBaseUrl(): string {
  // In browser, use empty string (same origin)
  // In SSR, use environment variable if available
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return '';
}

/**
 * Centralized HTTP client for API calls
 * All methods support generic typing for responses
 */
export const apiClient = {
  /**
   * POST request with JSON body
   * @param url - Relative or absolute URL
   * @param body - Request body (will be JSON stringified)
   * @returns Parsed JSON response
   * @throws APIError on non-2xx status, NetworkError on fetch failure
   */
  async post<T>(url: string, body?: unknown): Promise<T> {
    return apiClient._request<T>('POST', url, body);
  },

  /**
   * GET request
   * @param url - Relative or absolute URL
   * @returns Parsed JSON response
   * @throws APIError on non-2xx status, NetworkError on fetch failure
   */
  async get<T>(url: string): Promise<T> {
    return apiClient._request<T>('GET', url);
  },

  /**
   * PATCH request with JSON body
   * @param url - Relative or absolute URL
   * @param body - Request body (will be JSON stringified)
   * @returns Parsed JSON response
   * @throws APIError on non-2xx status, NetworkError on fetch failure
   */
  async patch<T>(url: string, body?: unknown): Promise<T> {
    return apiClient._request<T>('PATCH', url, body);
  },

  /**
   * DELETE request
   * @param url - Relative or absolute URL
   * @returns Parsed JSON response (or void for 204 No Content)
   * @throws APIError on non-2xx status, NetworkError on fetch failure
   */
  async delete<T = void>(url: string): Promise<T> {
    return apiClient._request<T>('DELETE', url);
  },

  /**
   * Internal request handler with timeout and error handling
   */
  async _request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    body?: unknown
  ): Promise<T> {
    // Build full URL
    const baseUrl = getBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      // Build fetch options
      const options: RequestInit = {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add body if provided
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      // Make request
      const response = await fetch(fullUrl, options);

      // Parse response based on status
      let responseBody: unknown;

      // Only try to parse JSON if there's content
      if (response.status !== 204 && response.headers.get('content-length') !== '0') {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }
      }

      // Check for error status
      if (!response.ok) {
        throw new APIError(
          response.status,
          responseBody,
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      // Return typed response (or void for 204)
      return (responseBody as T) || (undefined as unknown as T);
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${DEFAULT_TIMEOUT_MS}ms`);
      }

      // Re-throw APIError as-is
      if (error instanceof APIError) {
        throw error;
      }

      // Convert other errors to NetworkError
      if (error instanceof Error) {
        throw new NetworkError(`Network request failed: ${error.message}`, error);
      }

      throw new NetworkError('Unknown network error', error);
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

// ============================================================================
// Type Exports for Error Handling
// ============================================================================

/**
 * Type guard to check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Check if error should trigger fallback (5xx or network error)
 */
export function shouldFallback(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true;
  }
  if (isAPIError(error)) {
    return error.isServerError();
  }
  return false;
}
