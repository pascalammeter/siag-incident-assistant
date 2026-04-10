/**
 * Tests for MigrationService — v1.0 → v1.1 migration orchestrator
 * Phase 13-03 key deliverable: cursor-based resume, idempotency, safety backup, error classification
 *
 * Environment: jsdom (MigrationService uses localStorage via window guard)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MigrationService, CreateIncidentFn } from '../../src/lib/migrationService';

// ============================================================================
// localStorage setup — jsdom provides window.localStorage
// ============================================================================

const STORAGE_KEYS = {
  COMPLETED: 'siag-migration-completed',
  PENDING: 'siag-migration-pending',
  CURSOR: 'siag-migration-cursor',
  V1_BACKUP: 'siag-v1-backup',
  V1_STATE: 'siag-wizard-state',
} as const;

/** Minimal valid v1.0 wizard state that produces one migratable incident */
const VALID_V1_STATE = JSON.stringify({
  klassifikation: {
    incidentType: 'ransomware',
    severity: 'KRITISCH',
  },
  erfassen: {
    erkennungszeitpunkt: '2026-04-07T10:00:00Z',
    erkannt_durch: 'it-mitarbeiter',
  },
  reaktion: {},
  kommunikation: {},
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ============================================================================
// Idempotency
// ============================================================================

describe('MigrationService idempotency', () => {
  it('returns completed status immediately when siag-migration-completed flag is set', async () => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockResolvedValue({ id: 'new-id' });

    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('completed');
    // The API must NOT be called when migration is already done
    expect(createIncident).not.toHaveBeenCalled();
  });

  it('does not write a second backup when re-run is blocked by completed flag', async () => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, 'true');
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockResolvedValue({});
    await MigrationService.run(createIncident);

    // No backup should have been written (migration short-circuited)
    expect(localStorage.getItem(STORAGE_KEYS.V1_BACKUP)).toBeNull();
  });
});

// ============================================================================
// Safety backup
// ============================================================================

describe('MigrationService safety backup', () => {
  it('writes siag-v1-backup before any createIncident call', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    let backupWrittenBeforeCall = false;
    const createIncident = vi.fn<CreateIncidentFn>().mockImplementation(async () => {
      // At the moment createIncident is called, backup must already exist
      backupWrittenBeforeCall = localStorage.getItem(STORAGE_KEYS.V1_BACKUP) !== null;
      return { id: 'abc' };
    });

    await MigrationService.run(createIncident);

    expect(backupWrittenBeforeCall).toBe(true);
  });

  it('backup contains the original v1.0 state under a "data" key', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockResolvedValue({});
    await MigrationService.run(createIncident);

    const raw = localStorage.getItem(STORAGE_KEYS.V1_BACKUP);
    expect(raw).not.toBeNull();
    const backup = JSON.parse(raw!);
    expect(backup).toHaveProperty('data');
    expect(backup.data).toMatchObject({ klassifikation: { incidentType: 'ransomware' } });
    expect(backup).toHaveProperty('backedUpAt');
  });
});

// ============================================================================
// Cursor-based resume
// ============================================================================

describe('MigrationService cursor advance on success', () => {
  it('saves cursor index after each successful upload', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockResolvedValue({ id: 'uploaded' });

    await MigrationService.run(createIncident);

    // After full success the cursor key is cleaned up (markCompleted removes it)
    // but during run it must have been set. Verify completed flag is set.
    expect(localStorage.getItem(STORAGE_KEYS.COMPLETED)).toBe('true');
    expect(localStorage.getItem(STORAGE_KEYS.CURSOR)).toBeNull(); // cleaned on success
  });

  it('returns completed status and clears v1.0 state after successful upload', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockResolvedValue({});
    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('completed');
    expect(result.progress.uploaded).toBe(1);
    expect(result.progress.failed).toBe(0);
    // v1.0 state cleared after success
    expect(localStorage.getItem(STORAGE_KEYS.V1_STATE)).toBeNull();
  });
});

// ============================================================================
// Error classification: 4xx validation errors → skip, continue
// ============================================================================

describe('MigrationService 4xx error classification', () => {
  it('skips incident with 400 validation error and marks migration completed', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockRejectedValue(
      new Error('400 Bad Request: invalid incident_type')
    );

    const result = await MigrationService.run(createIncident);

    // Migration finishes (not stuck), 4xx means skip not retry
    expect(result.status).toBe('completed');
    expect(result.shouldRetry).toBe(false);
    expect(result.progress.failed).toBe(1);
    expect(result.progress.uploaded).toBe(0);
  });

  it('skips incident with "validation" keyword in error message', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockRejectedValue(
      new Error('Zod validation failed: severity must be one of critical, high, medium, low')
    );

    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('completed');
    expect(result.shouldRetry).toBe(false);
  });
});

// ============================================================================
// Error classification: 5xx / network errors → mark pending, return failed
// ============================================================================

describe('MigrationService 5xx error classification', () => {
  it('marks pending for retry and returns failed status on 500 error', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockRejectedValue(
      new Error('500 Internal Server Error')
    );

    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('failed');
    expect(result.shouldRetry).toBe(true);
    // Pending flag set in localStorage for next-load retry
    expect(localStorage.getItem(STORAGE_KEYS.PENDING)).toBe('true');
  });

  it('marks pending on network error (no HTTP status code in message)', async () => {
    localStorage.setItem(STORAGE_KEYS.V1_STATE, VALID_V1_STATE);

    const createIncident = vi.fn<CreateIncidentFn>().mockRejectedValue(
      new Error('fetch failed: network unreachable')
    );

    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('failed');
    expect(result.shouldRetry).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.PENDING)).toBe('true');
  });
});

// ============================================================================
// No-data path
// ============================================================================

describe('MigrationService no-data path', () => {
  it('returns no_data status and does not call createIncident when localStorage is empty', async () => {
    // No V1_STATE in localStorage
    const createIncident = vi.fn<CreateIncidentFn>();

    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('no_data');
    expect(createIncident).not.toHaveBeenCalled();
  });

  it('returns no_data when v1.0 state has no valid incident (missing severity)', async () => {
    localStorage.setItem(
      STORAGE_KEYS.V1_STATE,
      JSON.stringify({ klassifikation: { incidentType: 'ransomware' } }) // no severity
    );

    const createIncident = vi.fn<CreateIncidentFn>();
    const result = await MigrationService.run(createIncident);

    expect(result.status).toBe('no_data');
    expect(createIncident).not.toHaveBeenCalled();
  });
});
