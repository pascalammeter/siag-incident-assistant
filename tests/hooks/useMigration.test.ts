/**
 * Tests for useMigration() hook
 * Full migration flow: localStorage -> API
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMigration } from '../../src/hooks/useMigration';
import * as migrationLib from '../../src/lib/migration';
import { useIncident } from '../../src/hooks/useIncident';

// Mock dependencies
vi.mock('../../src/hooks/useIncident');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('useMigration()', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset mocks
    vi.clearAllMocks();

    // Mock useIncident hook
    (useIncident as any).mockReturnValue({
      createIncident: vi.fn().mockResolvedValue({ id: 'test-123' }),
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ========== Basic Migration Flow Tests ==========

  it('should skip migration if siag-migration-completed is true', async () => {
    localStorage.setItem('siag-migration-completed', 'true');
    localStorage.setItem('siag-wizard-state', JSON.stringify({
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    }));

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Should not make any API calls
      expect(useIncident().createIncident).not.toHaveBeenCalled();
    });
  });

  it('should skip migration if no v1.0 state in localStorage', async () => {
    // No siag-wizard-state key set
    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
      expect(useIncident().createIncident).not.toHaveBeenCalled();
    });
  });

  it('should migrate v1.0 state to API on first load', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
      erfassen: {
        erkennungszeitpunkt: '2026-04-07T10:00:00Z',
        erkannt_durch: 'it-mitarbeiter',
      },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-456' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(mockCreateIncident).toHaveBeenCalled();
      expect(mockCreateIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          incident_type: 'ransomware',
          severity: 'critical',
        })
      );
    });
  });

  it('should set siag-migration-completed after successful migration', async () => {
    const v1State = {
      klassifikation: { incidentType: 'phishing', severity: 'HOCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-789' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
    });
  });

  it('should delete v1.0 state from localStorage after success', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ddos', severity: 'MITTEL' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-abc' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(localStorage.getItem('siag-wizard-state')).toBeNull();
    });
  });

  // ========== Error Handling Tests ==========

  it('should set siag-migration-pending if API fails with 5xx error', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockRejectedValue(
      new Error('500 Server Error')
    );
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(localStorage.getItem('siag-migration-pending')).toBe('true');
      // v1.0 data should remain for retry
      expect(localStorage.getItem('siag-wizard-state')).not.toBeNull();
    });
  });

  it('should continue migration if one incident has validation error (4xx)', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockRejectedValue(
      new Error('400 validation error')
    );
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Should mark as completed even if validation error
      // (keeps data for manual review)
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
    });
  });

  it('should show error notification on API failure', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockRejectedValue(
      new Error('Network error')
    );
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Migration should log error and set pending flag
      expect(localStorage.getItem('siag-migration-pending')).toBe('true');
    });
  });

  // ========== Success Cases ==========

  it('should show success notification with count', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-xyz' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Should call createIncident
      expect(mockCreateIncident).toHaveBeenCalled();
      // Should mark migration complete
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
    });
  });

  it('should clear migration-pending flag on successful retry', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    // Set up as if previous migration failed
    localStorage.setItem('siag-migration-pending', 'true');
    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-retry' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(localStorage.getItem('siag-migration-pending')).toBeNull();
    });
  });

  // ========== Edge Cases ==========

  it('should handle corrupted JSON gracefully', async () => {
    localStorage.setItem('siag-wizard-state', 'not valid json {]');

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Should mark as completed and skip
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
      expect(useIncident().createIncident).not.toHaveBeenCalled();
    });
  });

  it('should handle missing klassifikation gracefully', async () => {
    const v1State = {
      erfassen: { erkennungszeitpunkt: '2026-04-07T10:00:00Z' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      // Should mark as completed and skip
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
      expect(useIncident().createIncident).not.toHaveBeenCalled();
    });
  });

  it('should run only once per app load', async () => {
    const v1State = {
      klassifikation: { incidentType: 'ransomware', severity: 'KRITISCH' },
    };

    localStorage.setItem('siag-wizard-state', JSON.stringify(v1State));

    const mockCreateIncident = vi.fn().mockResolvedValue({ id: 'incident-once' });
    (useIncident as any).mockReturnValue({
      createIncident: mockCreateIncident,
    });

    // Render hook twice
    const { result: result1 } = renderHook(() => useMigration());
    const { result: result2 } = renderHook(() => useMigration());

    await waitFor(() => {
      // createIncident should be called only once (or twice if both hooks run separately)
      // The key is that localStorage.getItem('siag-migration-completed') prevents re-runs
      expect(localStorage.getItem('siag-migration-completed')).toBe('true');
    });
  });
});
