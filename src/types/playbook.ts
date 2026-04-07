/**
 * Playbook Type Definitions
 * Defines the structure for incident-type-specific playbooks
 * Note: Uses legacy format with phases for compatibility with existing Step4Reaktion component
 */

/**
 * A single playbook step with ID, text, and responsible role
 */
export interface PlaybookStep {
  id: string; // Unique identifier (e.g., "detection-01")
  text: string; // Detailed action text
  role: 'IT-Leiter' | 'CISO' | 'CEO' | 'Forensik' | 'HR' | 'Legal'; // Who executes
  noGoWarning?: string; // Optional warning/critical info
}

/**
 * A phase within a playbook (e.g., Detection, Containment)
 */
export interface PlaybookPhase {
  id: string; // Phase identifier (e.g., "detection")
  title: string; // Display title (e.g., "Phase 1: Detection & Analysis")
  steps: PlaybookStep[]; // Steps in this phase
}

/**
 * Complete playbook for a specific incident type
 */
export interface Playbook {
  incidentType: string; // 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other'
  phases: PlaybookPhase[]; // Organized by phase
}
