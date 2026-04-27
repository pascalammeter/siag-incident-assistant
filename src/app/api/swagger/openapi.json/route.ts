/**
 * /api/swagger/openapi.json — Raw OpenAPI Specification
 *
 * GET /api/swagger/openapi.json — Returns the full OpenAPI 3.0.0 spec as JSON
 *
 * Used by Swagger UI to load the spec dynamically.
 * Cached for 1 hour (Cache-Control: public, max-age=3600).
 */

import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * GET /api/swagger/openapi.json — Serve raw OpenAPI spec as JSON
 *
 * Returns the complete OpenAPI 3.0.0 specification generated from swaggerJsdoc.
 * Includes all incident CRUD endpoints, schemas, and security definitions.
 * No authentication required to view the spec.
 */
export async function GET(): Promise<Response> {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache spec for 1 hour
    },
  });
}
