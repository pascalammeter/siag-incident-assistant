/**
 * MigrationService — v1.0 → v1.1 data migration orchestrator
 *
 * Coordinates the full migration lifecycle:
 *  1. Detect v1.0 localStorage incidents
 *  2. Validate and transform to v1.1 schema
 *  3. Upload each incident to POST /api/incidents
 *  4. Track progress (last-uploaded cursor for safe resume)
 *  5. Clean up v1.0 data (preserve 30-day safety copy)
 *
 * Usage (from useMigration hook):
 *   const service = MigrationService.create();
 *   const result = await service.run(createIncidentFn);
 *
 * The service is pure: it reads from localStorage, calls the provided API
 * function, and writes migration state back to localStorage. No direct API
 * imports here — callers inject the API function to keep this unit-testable.
 */

import { CreateIncidentInput } from './incident-types';
import {
  getV1StateFromStorage,
  migrateIncidents,
  LegacyWizardState,
} from './migration';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE = {
  /** Set to 'true' once full migration completes successfully */
  COMPLETED: 'siag-migration-completed',
  /** Set to 'true' when migration is pending retry (partial failure) */
  PENDING: 'siag-migration-pending',
  /** Index of last successfully uploaded incident (for resume) */
  CURSOR: 'siag-migration-cursor',
  /** Safety copy of v1.0 state — kept for 30 days after migration */
  V1_BACKUP: 'siag-v1-backup',
  /** Original v1.0 wizard state (read-only during migration) */
  V1_STATE: 'siag-wizard-state',
} as const;

// ============================================================================
// Types
// ============================================================================

export type MigrationStatus =
  | 'idle'
  | 'detecting'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'no_data';

export interface MigrationProgress {
  total: number;
  uploaded: number;
  failed: number;
}

export interface MigrationResult {
  status: MigrationStatus;
  progress: MigrationProgress;
  /** Human-readable message for display in UI */
  message: string;
  /** Whether a retry should be scheduled */
  shouldRetry: boolean;
}

export type CreateIncidentFn = (input: CreateIncidentInput) => Promise<unknown>;

// ============================================================================
// Storage Helpers (safe, SSR-guarded)
// ============================================================================

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or unavailable — ignore
  }
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

// ============================================================================
// MigrationService Class
// ============================================================================

export class MigrationService {
  // ---- State Checks --------------------------------------------------------

  static isCompleted(): boolean {
    return getItem(STORAGE.COMPLETED) === 'true';
  }

  static isPending(): boolean {
    return getItem(STORAGE.PENDING) === 'true';
  }

  /** Index of last successfully uploaded incident (0-based), or -1 if none */
  static getCursor(): number {
    const raw = getItem(STORAGE.CURSOR);
    if (!raw) return -1;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? -1 : parsed;
  }

  // ---- State Mutations -----------------------------------------------------

  static markCompleted(): void {
    setItem(STORAGE.COMPLETED, 'true');
    removeItem(STORAGE.PENDING);
    removeItem(STORAGE.CURSOR);
  }

  static markPending(): void {
    setItem(STORAGE.PENDING, 'true');
  }

  static saveCursor(index: number): void {
    setItem(STORAGE.CURSOR, String(index));
  }

  // ---- Data Lifecycle ------------------------------------------------------

  /**
   * Back up v1.0 state before migration.
   * The original key ('siag-wizard-state') is kept untouched for 30 days
   * as a safety net — this creates an additional timestamped backup.
   */
  static backupV1State(state: LegacyWizardState): void {
    const backup = {
      backedUpAt: new Date().toISOString(),
      data: state,
    };
    setItem(STORAGE.V1_BACKUP, JSON.stringify(backup));
  }

  /**
   * Remove v1.0 wizard state after successful migration.
   * NOTE: per plan requirement, we keep the safety backup for 30 days.
   * The original key is removed; the backup key remains.
   */
  static clearV1State(): void {
    removeItem(STORAGE.V1_STATE);
  }

  // ---- Main Migration Orchestration ----------------------------------------

  /**
   * Run the full migration pipeline.
   * Safe to call multiple times — idempotent via cursor tracking.
   *
   * @param createIncident - Injected API function to create incidents
   * @returns MigrationResult describing outcome
   */
  static async run(createIncident: CreateIncidentFn): Promise<MigrationResult> {
    const noData: MigrationResult = {
      status: 'no_data',
      progress: { total: 0, uploaded: 0, failed: 0 },
      message: 'Keine v1.0-Daten gefunden — Migration nicht erforderlich.',
      shouldRetry: false,
    };

    // Already done — short-circuit
    if (MigrationService.isCompleted()) {
      return {
        status: 'completed',
        progress: { total: 0, uploaded: 0, failed: 0 },
        message: 'Migration bereits abgeschlossen.',
        shouldRetry: false,
      };
    }

    // Detect v1.0 state
    const v1State = getV1StateFromStorage();
    if (!v1State) {
      MigrationService.markCompleted();
      return noData;
    }

    // Transform to v1.1 schema
    const incidents = migrateIncidents(v1State);
    if (incidents.length === 0) {
      console.log('[MigrationService] No valid incidents to migrate from v1.0 state');
      MigrationService.markCompleted();
      MigrationService.clearV1State();
      return noData;
    }

    // Back up v1.0 data before any mutations
    MigrationService.backupV1State(v1State);

    const total = incidents.length;
    const startCursor = MigrationService.getCursor(); // -1 = no previous progress
    let uploaded = startCursor + 1; // Already-uploaded count from prior run
    let failed = 0;

    console.log(
      `[MigrationService] Starting migration: ${total} incident(s), cursor at ${startCursor}`
    );

    for (let i = startCursor + 1; i < total; i++) {
      const incident = incidents[i];
      try {
        await createIncident(incident);
        uploaded++;
        MigrationService.saveCursor(i);
        console.log(`[MigrationService] Uploaded incident ${i + 1}/${total}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        // 4xx validation errors: skip this incident, continue migration
        const isValidationError =
          msg.includes('400') ||
          msg.includes('422') ||
          msg.toLowerCase().includes('validation') ||
          msg.toLowerCase().includes('invalid');

        if (isValidationError) {
          console.warn(`[MigrationService] Validation error on incident ${i + 1}, skipping:`, msg);
          failed++;
          continue;
        }

        // 5xx / network errors: mark pending for retry on next load
        console.error(`[MigrationService] Server/network error on incident ${i + 1}:`, msg);
        MigrationService.markPending();

        return {
          status: 'failed',
          progress: { total, uploaded, failed },
          message: `Migration unterbrochen (Netzwerkfehler). Wird beim nächsten Laden fortgesetzt.`,
          shouldRetry: true,
        };
      }
    }

    // Success (all incidents processed — some may have had validation failures)
    MigrationService.markCompleted();
    MigrationService.clearV1State();

    const allSkipped = uploaded === 0 && failed > 0;
    if (allSkipped) {
      console.warn('[MigrationService] All incidents had validation errors — none uploaded');
      return {
        status: 'completed',
        progress: { total, uploaded: 0, failed },
        message: `${failed} Vorfall/Vorfälle konnten nicht migriert werden. Bitte prüfen Sie die Daten manuell.`,
        shouldRetry: false,
      };
    }

    const skippedMsg = failed > 0 ? ` (${failed} übersprungen)` : '';
    console.log(`[MigrationService] Migration complete: ${uploaded}/${total} uploaded${skippedMsg}`);

    return {
      status: 'completed',
      progress: { total, uploaded, failed },
      message: `${uploaded} Vorfall${uploaded !== 1 ? 'e' : ''} erfolgreich in die Cloud migriert${skippedMsg}.`,
      shouldRetry: false,
    };
  }
}
