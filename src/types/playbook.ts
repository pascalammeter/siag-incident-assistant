/**
 * Playbook Type Definitions
 * Defines the structure for incident-type-specific playbooks
 * Used across all incident types (Ransomware, Phishing, DDoS, Data Loss, Other)
 */

/**
 * A single playbook step with action, responsible party, and dependencies
 */
export interface PlaybookStep {
  number: number; // 1-25 globally unique within playbook
  section: 'detection' | 'containment' | 'investigation' | 'communication';
  title: string; // Short title (e.g., "Block email sender")
  action: string; // Detailed action text (what to do)
  responsible: 'IT-Leiter' | 'CISO' | 'CEO' | 'Forensik' | 'HR' | 'Legal'; // Who executes
  timeframe: string; // e.g., "Immediately", "Within 1 hour", "Within 24 hours"
  dependencies?: number[]; // Step numbers that must be completed first
}

/**
 * A section within a playbook (e.g., Detection, Containment)
 */
export interface PlaybookSection {
  name: 'detection' | 'containment' | 'investigation' | 'communication';
  title: string; // Display title (e.g., "Detection & Analysis")
  color: string; // Tailwind color class (e.g., "bg-blue-50")
  steps: PlaybookStep[];
}

/**
 * Complete playbook for a specific incident type
 */
export interface Playbook {
  type: string; // 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other'
  title: string; // Display title (e.g., "Phishing Incident Playbook")
  description: string; // Brief description of the playbook scope
  estimatedDuration: string; // e.g., "24-72 hours"
  sections: PlaybookSection[];
  steps: PlaybookStep[]; // Flat array of all steps (for easy lookup)
}
