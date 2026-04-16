/**
 * /api/incidents/[id]/export/json — JSON export for incident reports
 *
 * GET /api/incidents/:id/export/json — Download incident as JSON file
 *
 * Requires X-API-Key header for cross-origin requests.
 * Returns the full incident object as a downloadable JSON attachment.
 * Closes gap B5.1: JSON export was missing from App Router (only Express POST existed).
 */
import { NextRequest } from 'next/server';
import { IncidentService } from '@/api/services/incident.service';
import {
  validateApiKey,
  handleOptions,
  errorResponse,
  getCorsHeaders,
} from '../../../../_helpers';

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return handleOptions();
}

// ============================================================================
// GET /api/incidents/:id/export/json
// ============================================================================
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return errorResponse('Invalid incident ID format', 400);
    }

    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      return errorResponse('Incident not found', 404);
    }

    const jsonBody = JSON.stringify(incident, null, 2);
    const contentDisposition = `attachment; filename="incident-${id}.json"`;

    return new Response(jsonBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...getCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('[GET /api/incidents/:id/export/json] Error:', error);
    return errorResponse('Failed to export incident', 500);
  }
}
