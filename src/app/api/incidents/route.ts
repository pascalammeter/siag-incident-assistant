/**
 * /api/incidents — List + Create incidents
 *
 * GET  /api/incidents  — List incidents (paginated, filterable)
 * POST /api/incidents  — Create a new incident
 *
 * Requires X-API-Key header for all requests.
 */
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
  CreateIncidentInputSchema,
  ListIncidentsQuerySchema,
} from '@/api/schemas/incident.schema';
import { IncidentService } from '@/api/services/incident.service';
import {
  validateApiKey,
  handleOptions,
  jsonResponse,
  errorResponse,
} from '../_helpers';

export function OPTIONS() {
  return handleOptions();
}

// ============================================================================
// GET /api/incidents
// ============================================================================
export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      type: searchParams.get('type') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    };

    const parsed = ListIncidentsQuerySchema.parse(rawQuery);
    const result = await IncidentService.listIncidents(
      { type: parsed.type, severity: parsed.severity },
      { page: parsed.page, limit: parsed.limit }
    );

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      }));
      return errorResponse('Invalid query parameters', 400, details);
    }
    console.error('[GET /api/incidents] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================================================
// POST /api/incidents
// ============================================================================
export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const input = CreateIncidentInputSchema.parse(body);
    const incident = await IncidentService.createIncident(input);
    return jsonResponse(incident, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      }));
      return errorResponse('Validation failed', 400, details);
    }
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400);
    }
    console.error('[POST /api/incidents] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}
