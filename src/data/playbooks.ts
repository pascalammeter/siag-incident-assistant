/**
 * Playbook Registry
 * Central location for all playbooks by incident type
 * Provides getPlaybook() function to load correct playbook
 */

import type { Playbook } from '@/types/playbook';
import { PHISHING_PLAYBOOK } from './playbooks/phishing';

/**
 * Map of incident types to their playbooks
 * Add new playbooks here as they are implemented
 */
const PLAYBOOKS: Record<string, Playbook> = {
  phishing: PHISHING_PLAYBOOK,
  // ransomware: RANSOMWARE_PLAYBOOK, // TODO: Phase 11-02
  // ddos: DDOS_PLAYBOOK,               // TODO: Phase 11-02
  // data_loss: DATA_LOSS_PLAYBOOK,     // TODO: Phase 11-02
};

/**
 * Get playbook for specific incident type
 * @param type - incident type string ('phishing', 'ransomware', etc.)
 * @returns Playbook or undefined if not found
 */
export function getPlaybook(type: string): Playbook | undefined {
  return PLAYBOOKS[type];
}

/**
 * Get all available playbooks
 */
export function getAllPlaybooks(): Playbook[] {
  return Object.values(PLAYBOOKS);
}

/**
 * Check if playbook exists for incident type
 */
export function hasPlaybook(type: string): boolean {
  return type in PLAYBOOKS;
}
