/**
 * Unit tests for IncidentAPI service layer and apiClient HTTP client
 * Covers all CRUD methods, error handling, and HTTP behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IncidentAPI } from '../../src/hooks/useIncidentAPI';
import { apiClient, APIError, NetworkError, shouldFallback } from '../../src/api/client';
import { Incident, CreateIncidentInput } from '../../src/lib/incident-types';

// ============================================================================
// Mocks
// ============================================================================

global.fetch = vi.fn();

const mockIncident: Incident = {
  id: 'test-id-123',
  createdAt: '2026-04-07T12:00:00Z',
  updatedAt: '2026-04-07T12:00:00Z',
  incident_type: 'ransomware',
  severity: 'critical',
  erkennungszeitpunkt: '2026-04-07T10:00:00Z',
  erkannt_durch: 'Admin',
  betroffene_systeme: ['Server-1'],
  erste_erkenntnisse: 'Suspicious activity detected',
};

// ============================================================================
// Helper: Mock Fetch Response
// ============================================================================

function mockFetchResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({
      'content-type': 'application/json',
      'content-length': body ? '1' : '0',
    }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// ============================================================================
// Tests: apiClient - POST
// ============================================================================

describe('apiClient - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should POST with JSON body and return typed response', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(201, mockIncident));

    const result = await apiClient.post<Incident>('/api/incidents', {
      incident_type: 'ransomware',
      severity: 'critical',
    });

    expect(result).toEqual(mockIncident);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should set Content-Type header to application/json', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(201, mockIncident));

    await apiClient.post('/api/incidents', { test: 'data' });

    const call = mockFetch.mock.calls[0];
    expect(call[1].headers['Content-Type']).toBe('application/json');
  });

  it('should throw APIError on non-2xx status', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(400, { error: 'Invalid' }));

    await expect(apiClient.post('/api/incidents', {})).rejects.toThrow(APIError);
  });

  it('should throw APIError with status property on 400', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(400, { error: 'Invalid' }));

    try {
      await apiClient.post('/api/incidents', {});
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).status).toBe(400);
    }
  });
});

// ============================================================================
// Tests: apiClient - GET
// ============================================================================

describe('apiClient - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should GET and return typed response', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(200, mockIncident));

    const result = await apiClient.get<Incident>('/api/incidents/test-id-123');

    expect(result).toEqual(mockIncident);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/test-id-123'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});

// ============================================================================
// Tests: apiClient - PATCH
// ============================================================================

describe('apiClient - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should PATCH with JSON body and return typed response', async () => {
    const mockFetch = fetch as any;
    const updated = { ...mockIncident, severity: 'high' };
    mockFetch.mockResolvedValue(mockFetchResponse(200, updated));

    const result = await apiClient.patch<Incident>('/api/incidents/test-id-123', {
      severity: 'high',
    });

    expect(result.severity).toBe('high');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/test-id-123'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

// ============================================================================
// Tests: apiClient - DELETE
// ============================================================================

describe('apiClient - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should DELETE and handle 204 (no response body)', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(204, null));

    const result = await apiClient.delete('/api/incidents/test-id-123');

    expect(result).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/test-id-123'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ============================================================================
// Tests: apiClient - Error Handling
// ============================================================================

describe('apiClient - error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw on network error (fetch throws)', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockRejectedValue(new Error('Network failed'));

    await expect(apiClient.get('/api/incidents')).rejects.toThrow(NetworkError);
  });

  it('should throw NetworkError on timeout', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockImplementation(() => {
      const error = new Error('Aborted');
      (error as any).name = 'AbortError';
      throw error;
    });

    await expect(apiClient.get('/api/incidents')).rejects.toThrow(NetworkError);
  });

  it('should throw APIError with status on non-2xx', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(500, { error: 'Server error' }));

    try {
      await apiClient.post('/api/incidents', {});
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).status).toBe(500);
      expect((err as APIError).isServerError()).toBe(true);
    }
  });
});

// ============================================================================
// Tests: IncidentAPI - createIncident
// ============================================================================

describe('IncidentAPI - createIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call POST /api/incidents with input, return Incident', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(201, mockIncident));

    const result = await IncidentAPI.createIncident({
      incident_type: 'ransomware',
      severity: 'critical',
    });

    expect(result).toEqual(mockIncident);
  });

  it('should throw on API error', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(
      mockFetchResponse(400, { error: 'Invalid incident_type' })
    );

    await expect(
      IncidentAPI.createIncident({
        incident_type: 'invalid' as any,
        severity: 'critical',
      })
    ).rejects.toThrow();
  });
});

// ============================================================================
// Tests: IncidentAPI - getIncident
// ============================================================================

describe('IncidentAPI - getIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GET /api/incidents/{id}, return Incident', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(200, mockIncident));

    const result = await IncidentAPI.getIncident('test-id-123');

    expect(result).toEqual(mockIncident);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/test-id-123'),
      expect.any(Object)
    );
  });

  it('should throw on 404 if not found', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(404, { error: 'Not found' }));

    await expect(IncidentAPI.getIncident('non-existent')).rejects.toThrow();
  });
});

// ============================================================================
// Tests: IncidentAPI - updateIncident
// ============================================================================

describe('IncidentAPI - updateIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call PATCH /api/incidents/{id}, return updated Incident', async () => {
    const mockFetch = fetch as any;
    const updated = { ...mockIncident, severity: 'high' };
    mockFetch.mockResolvedValue(mockFetchResponse(200, updated));

    const result = await IncidentAPI.updateIncident('test-id-123', {
      severity: 'high',
    });

    expect(result.severity).toBe('high');
  });

  it('should throw on validation error (400)', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(400, { error: 'Invalid' }));

    await expect(
      IncidentAPI.updateIncident('test-id-123', { severity: 'invalid' as any })
    ).rejects.toThrow();
  });
});

// ============================================================================
// Tests: IncidentAPI - deleteIncident
// ============================================================================

describe('IncidentAPI - deleteIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call DELETE /api/incidents/{id}, return void', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(204, null));

    const result = await IncidentAPI.deleteIncident('test-id-123');

    expect(result).toBeUndefined();
  });

  it('should throw on 404 if not found', async () => {
    const mockFetch = fetch as any;
    mockFetch.mockResolvedValue(mockFetchResponse(404, { error: 'Not found' }));

    await expect(IncidentAPI.deleteIncident('non-existent')).rejects.toThrow();
  });
});

// ============================================================================
// Tests: IncidentAPI - listIncidents
// ============================================================================

describe('IncidentAPI - listIncidents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GET /api/incidents with query params, return paginated list', async () => {
    const mockFetch = fetch as any;
    const response = {
      data: [mockIncident],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockFetch.mockResolvedValue(mockFetchResponse(200, response));

    const result = await IncidentAPI.listIncidents();

    expect(result).toEqual(response);
  });

  it('should apply type and severity filters', async () => {
    const mockFetch = fetch as any;
    const response = {
      data: [mockIncident],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockFetch.mockResolvedValue(mockFetchResponse(200, response));

    await IncidentAPI.listIncidents({
      type: 'ransomware',
      severity: 'critical',
    });

    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain('type=ransomware');
    expect(callUrl).toContain('severity=critical');
  });

  it('should handle empty list', async () => {
    const mockFetch = fetch as any;
    const response = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    mockFetch.mockResolvedValue(mockFetchResponse(200, response));

    const result = await IncidentAPI.listIncidents();

    expect(result.data).toHaveLength(0);
  });
});

// ============================================================================
// Tests: Error Type Guards
// ============================================================================

describe('Error type guards and helpers', () => {
  it('shouldFallback() returns true for NetworkError', () => {
    const error = new NetworkError('Network failed');
    expect(shouldFallback(error)).toBe(true);
  });

  it('shouldFallback() returns true for 5xx APIError', () => {
    const error = new APIError(500, {}, 'Server error');
    expect(shouldFallback(error)).toBe(true);
  });

  it('shouldFallback() returns false for 4xx APIError', () => {
    const error = new APIError(400, {}, 'Bad request');
    expect(shouldFallback(error)).toBe(false);
  });

  it('APIError.isServerError() detects 5xx', () => {
    const error = new APIError(503, {}, 'Service unavailable');
    expect(error.isServerError()).toBe(true);
  });

  it('APIError.isClientError() detects 4xx', () => {
    const error = new APIError(401, {}, 'Unauthorized');
    expect(error.isClientError()).toBe(true);
  });

  it('APIError.isNotFound() detects 404', () => {
    const error = new APIError(404, {}, 'Not found');
    expect(error.isNotFound()).toBe(true);
  });
});
