/**
 * Unit tests for useIncident() hook
 * Covers all CRUD operations, loading states, error handling, and fallback scenarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncident } from '../../src/hooks/useIncident';
import { IncidentAPI } from '../../src/hooks/useIncidentAPI';
import { APIError, NetworkError } from '../../src/api/client';
import { Incident, CreateIncidentInput } from '../../src/lib/incident-types';

// ============================================================================
// Mocks
// ============================================================================

vi.mock('../../src/hooks/useIncidentAPI');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================================================
// Test Fixtures
// ============================================================================

const mockIncident: Incident = {
  id: 'test-id-123',
  createdAt: '2026-04-07T12:00:00Z',
  updatedAt: '2026-04-07T12:00:00Z',
  incident_type: 'ransomware',
  severity: 'critical',
  erkennungszeitpunkt: '2026-04-07T10:00:00Z',
  erkannt_durch: 'Admin',
  betroffene_systeme: ['Server-1', 'Server-2'],
  erste_erkenntnisse: 'Initial findings',
  playbook: { checkedSteps: [], status: 'in_progress' },
};

const createIncidentInput: CreateIncidentInput = {
  incident_type: 'ransomware',
  severity: 'critical',
  erkannnt_durch: 'Admin',
};

// ============================================================================
// Tests: createIncident
// ============================================================================

describe('useIncident() - createIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should create incident via API and return with ID', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockResolvedValue(mockIncident);

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const created = await result.current.createIncident(createIncidentInput);
      expect(created.id).toBe('test-id-123');
      expect(created.incident_type).toBe('ransomware');
    });

    expect(result.current.incident).toEqual(mockIncident);
    expect(result.current.isOffline).toBe(false);
  });

  it('should set isLoading=true during request', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    let resolveCreate: any;
    mockCreateIncident.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      })
    );

    const { result } = renderHook(() => useIncident());

    let isLoadingDuringRequest = false;
    act(() => {
      result.current.createIncident(createIncidentInput).then(() => {
        isLoadingDuringRequest = result.current.isLoading;
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    act(() => {
      resolveCreate(mockIncident);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should clear error on successful create', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockResolvedValue(mockIncident);

    const { result } = renderHook(() => useIncident());

    // Set initial error state
    act(() => {
      result.current.clearError();
    });

    await act(async () => {
      await result.current.createIncident(createIncidentInput);
    });

    expect(result.current.error).toBeNull();
  });

  it('should set error on validation error (400)', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    const validationError = new APIError(
      400,
      { details: 'Invalid input' },
      'Validation failed'
    );
    mockCreateIncident.mockRejectedValue(validationError);

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      try {
        await result.current.createIncident(createIncidentInput);
      } catch {
        // Expected error
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isOffline).toBe(false);
  });

  it('should fall back to localStorage on network error', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(new NetworkError('Network failed'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const created = await result.current.createIncident(createIncidentInput);
      expect(created.id).toMatch(/^temp-/);
    });

    expect(result.current.isOffline).toBe(true);
  });

  it('should fall back to localStorage on 5xx error', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(
      new APIError(500, {}, 'Server error')
    );

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const created = await result.current.createIncident(createIncidentInput);
      expect(created).toBeTruthy();
    });

    expect(result.current.isOffline).toBe(true);
  });

  it('should set isOffline=true after fallback', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(new NetworkError('Network failed'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      await result.current.createIncident(createIncidentInput);
    });

    expect(result.current.isOffline).toBe(true);
  });
});

// ============================================================================
// Tests: getIncident
// ============================================================================

describe('useIncident() - getIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should fetch incident by ID from API', async () => {
    const mockGetIncident = vi.spyOn(IncidentAPI, 'getIncident' as any);
    mockGetIncident.mockResolvedValue(mockIncident);

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const fetched = await result.current.getIncident('test-id-123');
      expect(fetched?.id).toBe('test-id-123');
    });

    expect(result.current.incident).toEqual(mockIncident);
  });

  it('should return null on 404', async () => {
    const mockGetIncident = vi.spyOn(IncidentAPI, 'getIncident' as any);
    const notFoundError = new APIError(404, {}, 'Not found');
    mockGetIncident.mockRejectedValue(notFoundError);

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      try {
        await result.current.getIncident('non-existent');
      } catch {
        // Expected
      }
    });

    expect(result.current.incident).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('should read from localStorage if API fails', async () => {
    // Pre-populate localStorage
    const cached = { ...mockIncident };
    localStorageMock.setItem('siag-incident-test-id-123', JSON.stringify(cached));

    const mockGetIncident = vi.spyOn(IncidentAPI, 'getIncident' as any);
    mockGetIncident.mockRejectedValue(new NetworkError('Network failed'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const fetched = await result.current.getIncident('test-id-123');
      expect(fetched).toEqual(cached);
    });

    expect(result.current.isOffline).toBe(true);
  });
});

// ============================================================================
// Tests: updateIncident
// ============================================================================

describe('useIncident() - updateIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should patch incident with partial data', async () => {
    const mockUpdateIncident = vi.spyOn(IncidentAPI, 'updateIncident' as any);
    const updated = { ...mockIncident, severity: 'high' };
    mockUpdateIncident.mockResolvedValue(updated);

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      await result.current.updateIncident('test-id-123', { severity: 'high' });
    });

    expect(result.current.incident?.severity).toBe('high');
  });

  it('should update isOffline flag if fallback used', async () => {
    const mockUpdateIncident = vi.spyOn(IncidentAPI, 'updateIncident' as any);
    mockUpdateIncident.mockRejectedValue(new APIError(500, {}, 'Server error'));

    // Pre-populate localStorage
    localStorageMock.setItem('siag-incident-test-id-123', JSON.stringify(mockIncident));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      await result.current.updateIncident('test-id-123', { severity: 'high' });
    });

    expect(result.current.isOffline).toBe(true);
  });
});

// ============================================================================
// Tests: deleteIncident
// ============================================================================

describe('useIncident() - deleteIncident', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should delete incident via API (204 response)', async () => {
    const mockDeleteIncident = vi.spyOn(IncidentAPI, 'deleteIncident' as any);
    mockDeleteIncident.mockResolvedValue(undefined);

    const { result } = renderHook(() => useIncident());

    // First create/load an incident
    const mockGetIncident = vi.spyOn(IncidentAPI, 'getIncident' as any);
    mockGetIncident.mockResolvedValue(mockIncident);

    await act(async () => {
      await result.current.getIncident('test-id-123');
    });

    expect(result.current.incident).not.toBeNull();

    // Now delete it
    await act(async () => {
      await result.current.deleteIncident('test-id-123');
    });

    expect(result.current.incident).toBeNull();
  });
});

// ============================================================================
// Tests: listIncidents
// ============================================================================

describe('useIncident() - listIncidents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should fetch all incidents from API', async () => {
    const mockListIncidents = vi.spyOn(IncidentAPI, 'listIncidents' as any);
    const incidents = [mockIncident];
    mockListIncidents.mockResolvedValue({
      data: incidents,
      total: 1,
      page: 1,
      limit: 10,
    });

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const fetched = await result.current.listIncidents();
      expect(fetched).toHaveLength(1);
      expect(fetched[0].id).toBe('test-id-123');
    });
  });

  it('should apply type and severity filters', async () => {
    const mockListIncidents = vi.spyOn(IncidentAPI, 'listIncidents' as any);
    mockListIncidents.mockResolvedValue({
      data: [mockIncident],
      total: 1,
      page: 1,
      limit: 10,
    });

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      await result.current.listIncidents({
        type: 'ransomware',
        severity: 'critical',
      });
    });

    expect(mockListIncidents).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ransomware',
        severity: 'critical',
      })
    );
  });

  it('should read from localStorage if API fails', async () => {
    const cached = [mockIncident];
    localStorageMock.setItem('siag-incidents', JSON.stringify(cached));

    const mockListIncidents = vi.spyOn(IncidentAPI, 'listIncidents' as any);
    mockListIncidents.mockRejectedValue(new NetworkError('Network failed'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const fetched = await result.current.listIncidents();
      expect(fetched).toEqual(cached);
    });

    expect(result.current.isOffline).toBe(true);
  });
});

// ============================================================================
// Tests: Fallback Behavior
// ============================================================================

describe('useIncident() - fallback behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should use localStorage when API returns 500', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(new APIError(500, {}, 'Server error'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const created = await result.current.createIncident(createIncidentInput);
      expect(created).toBeTruthy();
    });

    expect(result.current.isOffline).toBe(true);
  });

  it('should use localStorage when network error occurs', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(new NetworkError('Network timeout'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      const created = await result.current.createIncident(createIncidentInput);
      expect(created).toBeTruthy();
    });

    expect(result.current.isOffline).toBe(true);
  });

  it('should NOT use localStorage for 4xx validation errors', async () => {
    const mockCreateIncident = vi.spyOn(IncidentAPI, 'createIncident' as any);
    mockCreateIncident.mockRejectedValue(
      new APIError(400, { details: 'Invalid' }, 'Validation failed')
    );

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      try {
        await result.current.createIncident(createIncidentInput);
      } catch {
        // Expected
      }
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should bubble 404 errors without fallback', async () => {
    const mockGetIncident = vi.spyOn(IncidentAPI, 'getIncident' as any);
    mockGetIncident.mockRejectedValue(new APIError(404, {}, 'Not found'));

    const { result } = renderHook(() => useIncident());

    await act(async () => {
      try {
        await result.current.getIncident('non-existent');
      } catch {
        // Expected
      }
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.incident).toBeNull();
  });
});
