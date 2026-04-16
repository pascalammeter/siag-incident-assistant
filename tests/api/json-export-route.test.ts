/**
 * Tests for GET /api/incidents/:id/export/json App Router handler
 *
 * Tests the App Router route handler directly using mocked IncidentService
 * and request objects. Does NOT test the Express POST handler
 * (that is tested in incidents.export-json.test.ts).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/app/api/_helpers.ts', () => ({
  validateApiKey: vi.fn(),
  handleOptions: vi.fn(() => new Response(null, { status: 200 })),
  errorResponse: vi.fn((message: string, status: number) =>
    new Response(JSON.stringify({ error: message }), { status })
  ),
  getCorsHeaders: vi.fn(() => ({})),
}));

vi.mock('../../src/api/services/incident.service', () => ({
  IncidentService: {
    getIncidentById: vi.fn(),
  },
}));

import { validateApiKey, errorResponse } from '../../src/app/api/_helpers';
import { IncidentService } from '../../src/api/services/incident.service';
import { GET, OPTIONS } from '../../src/app/api/incidents/[id]/export/json/route';
import { NextRequest } from 'next/server';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

const mockIncident = {
  id: VALID_UUID,
  incident_type: 'ransomware',
  severity: 'critical',
  description: 'Ransomware attack detected on file servers',
  erkennungszeitpunkt: new Date('2026-04-14T10:00:00Z'),
  erkannt_durch: 'Security Team',
  erste_erkenntnisse: 'Encryption of files detected',
  betroffene_systeme: ['Server-01', 'FileShare-01'],
  q1: 1,
  q2: 0,
  q3: 1,
  playbook: { checkedSteps: [] },
  regulatorische_meldungen: { isg_24h: null },
  metadata: { tags: [] },
  createdAt: new Date('2026-04-14T09:00:00Z'),
  updatedAt: new Date('2026-04-14T10:00:00Z'),
  deletedAt: null,
};

function makeRequest(id: string, origin?: string, apiKey?: string): NextRequest {
  const url = `http://localhost:3000/api/incidents/${id}/export/json`;
  const headers: Record<string, string> = {};
  if (origin) headers['origin'] = origin;
  if (apiKey) headers['x-api-key'] = apiKey;
  return new NextRequest(url, { headers });
}

describe('GET /api/incidents/:id/export/json', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateApiKey).mockReturnValue(null); // Auth passes by default
  });

  describe('OPTIONS handler', () => {
    it('returns 200 with CORS headers for preflight', async () => {
      const response = await OPTIONS();
      expect(response.status).toBe(200);
    });
  });

  describe('200 happy path', () => {
    it('returns 200 with JSON body for a valid incident', async () => {
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      expect(response.status).toBe(200);
    });

    it('returns Content-Type application/json', async () => {
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      expect(response.headers.get('Content-Type')).toContain('application/json');
    });

    it('returns Content-Disposition attachment header with correct filename', async () => {
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      const contentDisposition = response.headers.get('Content-Disposition');
      expect(contentDisposition).toContain('attachment');
      expect(contentDisposition).toContain(`incident-${VALID_UUID}.json`);
    });

    it('returns JSON body containing all incident fields', async () => {
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      const body = await response.json();
      expect(body.id).toBe(mockIncident.id);
      expect(body.incident_type).toBe(mockIncident.incident_type);
      expect(body.severity).toBe(mockIncident.severity);
      expect(body.description).toBe(mockIncident.description);
    });

    it('calls IncidentService.getIncidentById with correct UUID', async () => {
      const anotherUuid = 'aaaabbbb-cccc-dddd-eeee-ffffffffffff';
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);

      const request = makeRequest(anotherUuid);
      const params = Promise.resolve({ id: anotherUuid });
      await GET(request, { params });

      expect(IncidentService.getIncidentById).toHaveBeenCalledWith(anotherUuid);
    });
  });

  describe('400 for non-UUID incident ID', () => {
    it('returns 400 when ID is not a valid UUID', async () => {
      vi.mocked(errorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Invalid incident ID format' }), { status: 400 })
      );

      const request = makeRequest('not-a-uuid');
      const params = Promise.resolve({ id: 'not-a-uuid' });
      const response = await GET(request, { params });

      expect(response.status).toBe(400);
    });

    it('does not call IncidentService when ID is invalid', async () => {
      vi.mocked(errorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Invalid incident ID format' }), { status: 400 })
      );

      const request = makeRequest('../../../etc/passwd');
      const params = Promise.resolve({ id: '../../../etc/passwd' });
      await GET(request, { params });

      expect(IncidentService.getIncidentById).not.toHaveBeenCalled();
    });
  });

  describe('404 for non-existent incident', () => {
    it('returns 404 when incident does not exist', async () => {
      vi.mocked(IncidentService.getIncidentById).mockResolvedValue(null);
      vi.mocked(errorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Incident not found' }), { status: 404 })
      );

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });
  });

  describe('401 for invalid cross-origin API key', () => {
    it('returns 401 for invalid API key', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const request = makeRequest(VALID_UUID, 'https://evil.example.com', 'wrong-key');
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      expect(response.status).toBe(401);
    });

    it('does not call IncidentService when auth fails', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const request = makeRequest(VALID_UUID, 'https://evil.example.com', 'wrong-key');
      const params = Promise.resolve({ id: VALID_UUID });
      await GET(request, { params });

      expect(IncidentService.getIncidentById).not.toHaveBeenCalled();
    });
  });

  describe('500 on service error', () => {
    it('returns 500 when IncidentService throws', async () => {
      vi.mocked(IncidentService.getIncidentById).mockRejectedValue(new Error('DB connection failed'));
      vi.mocked(errorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Failed to export incident' }), { status: 500 })
      );

      const request = makeRequest(VALID_UUID);
      const params = Promise.resolve({ id: VALID_UUID });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
