/**
 * /api/incidents/[id] — Single incident operations
 *
 * GET    /api/incidents/:id  — Retrieve incident by ID
 * PATCH  /api/incidents/:id  — Partial update
 * DELETE /api/incidents/:id  — Soft delete
 *
 * Requires X-API-Key header for all requests.
 */
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { UpdateIncidentInputSchema } from '@/api/schemas/incident.schema';
import { IncidentService } from '@/api/services/incident.service';
import {
  validateApiKey,
  handleOptions,
  jsonResponse,
  errorResponse,
} from '../../_helpers';

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return handleOptions();
}

// ============================================================================
// GET /api/incidents/:id
// ============================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const incident = await IncidentService.getIncidentById(id);
    if (!incident) {
      return errorResponse('Incident not found', 404);
    }
    return jsonResponse(incident);
  } catch (error) {
    console.error('[GET /api/incidents/:id] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================================================
// PATCH /api/incidents/:id
// ============================================================================
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const input = UpdateIncidentInputSchema.parse(body);
    const incident = await IncidentService.updateIncident(id, input);
    if (!incident) {
      return errorResponse('Incident not found', 404);
    }
    return jsonResponse(incident);
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
    console.error('[PATCH /api/incidents/:id] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// ============================================================================
// DELETE /api/incidents/:id
// ============================================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await IncidentService.deleteIncident(id);
    if (!deleted) {
      return errorResponse('Incident not found', 404);
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/incidents/:id] Unexpected error:', error);
    return errorResponse('Internal server error', 500);
  }
}
