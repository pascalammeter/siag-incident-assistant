/**
 * useMigration() Hook
 * Orchestrates v1.0 → v1.1 data migration on app load
 * Runs async, handles errors gracefully, shows user feedback
 */

'use client';

import { useEffect, useRef } from 'react';
import { useIncident } from './useIncident';
import { migrateIncidents, getV1StateFromStorage } from '../lib/migration';

// Notification helper (fallback if sonner not available)
function showNotification(message: string, type: 'success' | 'error' | 'warning') {
  // Lazy load sonner to avoid import errors
  (async () => {
    try {
      const { toast } = await import('sonner');
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else if (type === 'warning') toast.warning(message);
    } catch {
      // Fallback: console log
      console.log(`[Migration Notification] ${type.toUpperCase()}: ${message}`);
    }
  })();
}

// ============================================================================
// Storage Keys for Migration State
// ============================================================================

const MIGRATION_KEYS = {
  COMPLETED: 'siag-migration-completed',
  PENDING: 'siag-migration-pending',
  V1_STATE: 'siag-wizard-state',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if migration has already been completed
 */
function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MIGRATION_KEYS.COMPLETED) === 'true';
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MIGRATION_KEYS.COMPLETED, 'true');
}

/**
 * Mark migration as pending (needs retry on next load)
 */
function markMigrationPending(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MIGRATION_KEYS.PENDING, 'true');
}

/**
 * Clear migration pending flag
 */
function clearMigrationPending(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MIGRATION_KEYS.PENDING);
}

/**
 * Delete v1.0 state from localStorage
 */
function deleteV1State(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MIGRATION_KEYS.V1_STATE);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Main migration hook
 * Runs on app mount, migrates v1.0 incidents to v1.1 API
 * Returns nothing (side effect only)
 */
export function useMigration(): void {
  const { createIncident } = useIncident();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent double-run in React strict mode
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // Async IIFE to handle migration
    (async () => {
      try {
        // Check if already migrated
        if (isMigrationCompleted()) {
          console.log('[Migration] Already completed, skipping');
          return;
        }

        // Get v1.0 state
        const v1State = getV1StateFromStorage();
        if (!v1State) {
          console.log('[Migration] No v1.0 state found, marking as completed');
          markMigrationCompleted();
          return;
        }

        // Transform to v1.1 schema
        const incidents = migrateIncidents(v1State);
        if (incidents.length === 0) {
          console.log('[Migration] No valid incidents to migrate');
          markMigrationCompleted();
          deleteV1State();
          return;
        }

        // Attempt to migrate each incident
        let successCount = 0;
        let failureCount = 0;

        for (const incidentInput of incidents) {
          try {
            console.log('[Migration] Creating incident:', incidentInput.incident_type);
            await createIncident(incidentInput);
            successCount++;
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';

            // Check if it's a client error (4xx validation issue)
            if (
              err instanceof Error &&
              errorMsg.includes('400') ||
              errorMsg.includes('validation')
            ) {
              console.warn('[Migration] Validation error for incident:', errorMsg);
              failureCount++;
              // Continue to next incident, don't block entire migration
              continue;
            }

            // For 5xx or network errors, mark pending for retry
            console.error('[Migration] Server error during migration:', errorMsg);
            markMigrationPending();
            showNotification('Migration failed, will retry on next load', 'error');
            return;
          }
        }

        // Success: clean up
        if (successCount > 0) {
          deleteV1State();
          clearMigrationPending();
          markMigrationCompleted();

          // Show success notification only if at least one incident was migrated
          showNotification(
            `${successCount} incident${successCount !== 1 ? 's' : ''} migrated to API`,
            'success'
          );
          console.log(
            `[Migration] Success: ${successCount} incidents migrated, ${failureCount} failed`
          );
        }

        // If all failed with validation errors, mark completed but warn
        if (successCount === 0 && failureCount > 0) {
          markMigrationCompleted();
          deleteV1State(); // Clear stale wizard state even on validation failure
          showNotification('Some incidents could not be migrated. Please review manually.', 'warning');
          console.warn('[Migration] All incidents had validation errors');
        }
      } catch (error) {
        // Catch-all for unexpected errors
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Migration] Unexpected error:', errorMsg);
        markMigrationPending();
        showNotification('Migration error, will retry on next load', 'error');
      }
    })();
  }, [createIncident]);
}
