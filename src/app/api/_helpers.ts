/**
 * Shared helpers for Next.js App Router API route handlers.
 * Provides API key validation and CORS header utilities.
 */
import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CORS Headers
// ============================================================================

export function getCorsHeaders(): Record<string, string> {
  const corsOrigin = process.env.CORS_ORIGIN;

  if (process.env.NODE_ENV === 'production' && !corsOrigin) {
    throw new Error('CORS_ORIGIN must be set in production');
  }

  return {
    'Access-Control-Allow-Origin': corsOrigin || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

/**
 * Add CORS headers to any NextResponse
 */
export function withCors(response: NextResponse): NextResponse {
  const corsHeaders = getCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// ============================================================================
// API Key Validation
// ============================================================================

/**
 * Validate the X-API-Key header using constant-time comparison.
 * Returns null if valid, or a 401 NextResponse if invalid.
 *
 * Same-origin requests (frontend calling its own API routes) are allowed
 * without an API key. Cross-origin requests require the X-API-Key header.
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');

  // Same-origin requests: no Origin header (server-side / form post)
  // or Origin matches the deployment host (browser fetch from same domain)
  if (!origin) return null;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
    return null;
  }

  // Cross-origin: require a valid API key
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_KEY;

  let isValidKey = false;
  if (apiKey && expectedKey) {
    try {
      isValidKey = timingSafeEqual(
        Buffer.from(String(apiKey)),
        Buffer.from(expectedKey)
      );
    } catch {
      // timingSafeEqual throws when buffer lengths differ — treat as invalid
      isValidKey = false;
    }
  }

  if (!isValidKey) {
    return withCors(
      NextResponse.json(
        { error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      )
    );
  }

  return null;
}

// ============================================================================
// Error Response Helpers
// ============================================================================

export function errorResponse(message: string, status: number, details: unknown[] = []): NextResponse {
  return withCors(
    NextResponse.json({ error: message, details }, { status })
  );
}

export function jsonResponse(body: unknown, status = 200): NextResponse {
  return withCors(
    NextResponse.json(body, { status })
  );
}
