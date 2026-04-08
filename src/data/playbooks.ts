/**
 * Playbook Registry
 * Central location for all playbooks by incident type
 * Re-exports legacy playbook-data getPlaybook function for backward compatibility
 */

import { getPlaybook as getPlaybookLegacy, PHISHING_PLAYBOOK, getAllPlaybooks as getAllPlaybooksLegacy } from '@/lib/playbook-data';
import type { Playbook } from '@/types/playbook';

/**
 * Get playbook for specific incident type
 * Delegates to legacy getPlaybook in playbook-data.ts
 * @param type - incident type string ('phishing', 'ransomware', etc.)
 * @returns Playbook or undefined if not found
 */
export function getPlaybook(type: string): Playbook | undefined {
  try {
    return getPlaybookLegacy(type);
  } catch {
    return undefined;
  }
}

/**
 * Get all available playbooks
 */
export function getAllPlaybooks(): Playbook[] {
  try {
    return getAllPlaybooksLegacy ? Object.values(getAllPlaybooksLegacy) : [];
  } catch {
    return [];
  }
}

/**
 * Check if playbook exists for incident type
 */
export function hasPlaybook(type: string): boolean {
  return getPlaybook(type) !== undefined;
}

// Export common playbooks for direct access
export { PHISHING_PLAYBOOK };
