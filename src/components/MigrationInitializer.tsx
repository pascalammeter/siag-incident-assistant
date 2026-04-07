/**
 * MigrationInitializer Component
 * Wrapper to run useMigration hook on app mount
 * Must be 'use client' because it uses hooks
 */

'use client';

import { useMigration } from '@/hooks/useMigration';

export function MigrationInitializer() {
  // Run migration on mount
  useMigration();

  // Component renders nothing; it's purely for side effects
  return null;
}
