/**
 * Incident type definitions aligned with Prisma schema
 * Used for type safety across frontend and API integration
 */

// ============================================================================
// Enums & Type Unions
// ============================================================================

export enum IncidentTypeEnum {
  RANSOMWARE = 'ransomware',
  PHISHING = 'phishing',
  DDOS = 'ddos',
  DATA_LOSS = 'data_loss',
  OTHER = 'other',
}

export enum SeverityEnum {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Type-safe unions for string literals
export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

// ============================================================================
// Incident & Related Interfaces
// ============================================================================

/**
 * Full Incident object matching Prisma schema
 * Represents complete incident data as stored in database
 */
export interface Incident {
  // IDs & Timestamps
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;

  // ========== Recognition (Erkennung) ==========
  erkennungszeitpunkt?: Date | string | null;
  erkannt_durch?: string | null;
  betroffene_systeme?: string[];
  erste_erkenntnisse?: string | null;

  // ========== Classification (Klassifizierung) ==========
  incident_type?: IncidentType | null;
  q1?: number | null; // 0-1
  q2?: number | null; // 0-1
  q3?: number | null; // 0-1
  severity?: Severity | null;

  // ========== Playbook & Progress ==========
  playbook?: {
    checkedSteps?: Array<{
      stepId: string;
      checked: boolean;
      timestamp?: string;
    }>;
    status?: 'in_progress' | 'completed';
  } | null;

  // ========== Regulatory (Regulatorische Meldungen) ==========
  regulatorische_meldungen?: {
    isg_24h?: string; // ISO8601 datetime
    dsg?: boolean;
    finma_24h?: string; // ISO8601 datetime
    finma_72h?: string; // ISO8601 datetime
  } | null;

  // ========== Metadata & Audit Trail ==========
  metadata?: {
    tags?: string[];
    notes?: string;
    custom_fields?: Record<string, unknown>;
  } | null;
}

/**
 * Input type for creating a new incident (POST /api/incidents)
 * Only required fields: incident_type, severity
 * Other fields optional
 */
export interface CreateIncidentInput {
  // Required
  incident_type: IncidentType;
  severity: Severity;

  // Optional
  erkennungszeitpunkt?: Date | string;
  erkannt_durch?: string;
  betroffene_systeme?: string[];
  erste_erkenntnisse?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  playbook?: Incident['playbook'];
  regulatorische_meldungen?: Incident['regulatorische_meldungen'];
  metadata?: Incident['metadata'];
}

/**
 * Input type for updating an incident (PATCH /api/incidents/:id)
 * All fields optional (partial update)
 */
export interface UpdateIncidentInput {
  incident_type?: IncidentType;
  severity?: Severity;
  erkennungszeitpunkt?: Date | string;
  erkannt_durch?: string;
  betroffene_systeme?: string[];
  erste_erkenntnisse?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  playbook?: Incident['playbook'];
  regulatorische_meldungen?: Incident['regulatorische_meldungen'];
  metadata?: Incident['metadata'];
}

/**
 * Query parameters for listing incidents (GET /api/incidents)
 * Used for filtering and sorting
 */
export interface ListIncidentsFilters {
  type?: IncidentType;
  severity?: Severity;
  page?: number; // default 1
  limit?: number; // default 10, max 100
}

/**
 * Response type for listing incidents
 * Returned by GET /api/incidents
 */
export interface ListIncidentsResponse {
  data: Incident[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Type Guards & Helpers
// ============================================================================

export function isValidIncidentType(value: unknown): value is IncidentType {
  return (
    typeof value === 'string' &&
    ['ransomware', 'phishing', 'ddos', 'data_loss', 'other'].includes(value)
  );
}

export function isValidSeverity(value: unknown): value is Severity {
  return (
    typeof value === 'string' &&
    ['critical', 'high', 'medium', 'low'].includes(value)
  );
}

/**
 * Get display label for incident type
 */
export function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    ransomware: 'Ransomware',
    phishing: 'Phishing',
    ddos: 'DDoS',
    data_loss: 'Data Loss',
    other: 'Other',
  };
  return labels[type];
}

/**
 * Get display label for severity
 */
export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[severity];
}

/**
 * Get icon/emoji for incident type
 */
export function getIncidentTypeIcon(type: IncidentType): string {
  const icons: Record<IncidentType, string> = {
    ransomware: '🔴',
    phishing: '🎣',
    ddos: '🌊',
    data_loss: '📁',
    other: '❓',
  };
  return icons[type];
}

/**
 * Get icon/emoji for severity
 */
export function getSeverityIcon(severity: Severity): string {
  const icons: Record<Severity, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return icons[severity];
}
