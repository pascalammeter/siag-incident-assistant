/**
 * GET /api/health — Health check endpoint
 * Returns server status and timestamp. No authentication required.
 */
import { NextResponse } from 'next/server';
import { withCors, handleOptions } from '../_helpers';

export function OPTIONS() {
  return handleOptions();
}

export function GET() {
  return withCors(
    NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    )
  );
}
