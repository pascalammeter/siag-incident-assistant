/**
 * Migration Layer: v1.0 → v1.1
 * Transforms v1.0 localStorage incidents to v1.1 API schema
 * Handles schema mapping, validation, and error handling
 */

import { CreateIncidentInput, IncidentType, Severity } from './incident-types';

// ============================================================================
// Type Definitions for v1.0 State
// ============================================================================

export interface LegacyErfassenData {
  erkennungszeitpunkt?: string;
  erkannt_durch?: string;
  betroffene_systeme?: string[];
  erste_auffaelligkeiten?: string;
  loesegeld_meldung?: boolean;
}

export interface LegacyKlassifikationData {
  q1SystemeBetroffen?: 'ja' | 'nein';
  q2PdBetroffen?: 'ja' | 'nein';
  q3AngreiferAktiv?: 'ja' | 'nein' | 'unbekannt';
  incidentType?: string;
  severity?: string;
}

export interface LegacyReaktionData {
  completedSteps?: string[];
}

export interface LegacyKommunikationData {
  kritischeInfrastruktur?: 'ja' | 'nein' | null;
  personendatenBetroffen?: 'ja' | 'nein' | null;
  reguliertesUnternehmen?: 'ja' | 'nein' | null;
  kommChecklist?: string[];
  [key: string]: unknown;
}

export interface LegacyDokumentationData {
  [key: string]: unknown;
}

export interface LegacyWizardState {
  currentStep?: number;
  noGoConfirmed?: boolean;
  einstieg?: Record<string, unknown>;
  erfassen?: LegacyErfassenData;
  klassifikation?: LegacyKlassifikationData;
  reaktion?: LegacyReaktionData;
  kommunikation?: LegacyKommunikationData;
  dokumentation?: LegacyDokumentationData;
}

// ============================================================================
// Field Mapping Functions
// ============================================================================

/**
 * Map v1.0 incident type to v1.1 enum
 * Handles legacy names: 'datenverlust' -> 'data_loss'
 */
export function mapIncidentType(v1Type?: string): IncidentType | null {
  if (!v1Type) return null;

  const typeMap: Record<string, IncidentType> = {
    ransomware: 'ransomware',
    phishing: 'phishing',
    ddos: 'ddos',
    datenverlust: 'data_loss',
    'unbefugter-zugriff': 'other', // Not in v1.1, map to 'other'
    sonstiges: 'other',
  };

  return typeMap[v1Type.toLowerCase()] ?? null;
}

/**
 * Map v1.0 severity to v1.1 enum
 * Handles legacy names: 'KRITISCH' -> 'critical', etc.
 */
export function mapSeverity(v1Severity?: string): Severity | null {
  if (!v1Severity) return null;

  const severityMap: Record<string, Severity> = {
    KRITISCH: 'critical',
    critical: 'critical',
    HOCH: 'high',
    high: 'high',
    MITTEL: 'medium',
    medium: 'medium',
    NIEDRIG: 'low',
    low: 'low',
  };

  return severityMap[v1Severity] ?? null;
}

/**
 * Map v1.0 yes/no/unknown to integer
 * 'ja' -> 1, 'nein' -> 0, 'unbekannt' -> null
 */
export function mapYesNoToInt(value?: string): 0 | 1 | null {
  if (!value) return null;

  switch (value.toLowerCase()) {
    case 'ja':
    case 'yes':
      return 1;
    case 'nein':
    case 'no':
      return 0;
    case 'unbekannt':
    case 'unknown':
      return null;
    default:
      return null;
  }
}

/**
 * Transform entire v1.0 wizard state to v1.1 CreateIncidentInput
 * Validates required fields, sets defaults, preserves metadata
 */
export function mapIncidentState(v1State: LegacyWizardState): CreateIncidentInput | null {
  // Extract nested data sections
  const klassifikation = v1State.klassifikation || {};
  const erfassen = v1State.erfassen || {};
  const reaktion = v1State.reaktion || {};
  const kommunikation = v1State.kommunikation || {};

  // Map incident type (required)
  const incident_type = mapIncidentType(klassifikation.incidentType);
  if (!incident_type) {
    console.warn('[Migration] Missing or invalid incident_type, skipping state');
    return null;
  }

  // Map severity (required)
  const severity = mapSeverity(klassifikation.severity);
  if (!severity) {
    console.warn('[Migration] Missing or invalid severity, skipping state');
    return null;
  }

  // Build v1.1 incident
  const incident: CreateIncidentInput = {
    incident_type,
    severity,

    // Erfassen section
    erkennungszeitpunkt: erfassen.erkennungszeitpunkt,
    erkannt_durch: erfassen.erkannt_durch,
    betroffene_systeme: erfassen.betroffene_systeme,
    erste_erkenntnisse: erfassen.erste_auffaelligkeiten,

    // Klassifikation section
    q1: mapYesNoToInt(klassifikation.q1SystemeBetroffen) ?? undefined,
    q2: mapYesNoToInt(klassifikation.q2PdBetroffen) ?? undefined,
    q3: mapYesNoToInt(klassifikation.q3AngreiferAktiv) ?? undefined,

    // Playbook from Reaktion
    playbook: reaktion.completedSteps
      ? {
          checkedSteps: reaktion.completedSteps.map((stepId) => ({
            stepId,
            checked: true,
            timestamp: new Date().toISOString(),
          })),
          status: 'in_progress' as const,
        }
      : undefined,

    // Metadata: preserve original state and regulatory flags
    metadata: {
      tags: ['v1.0-migrated'],
      notes: 'Auto-migrated from v1.0 localStorage',
      custom_fields: {
        loesegeld_meldung: erfassen.loesegeld_meldung,
        kritischeInfrastruktur: kommunikation.kritischeInfrastruktur,
        personendatenBetroffen: kommunikation.personendatenBetroffen,
        reguliertesUnternehmen: kommunikation.reguliertesUnternehmen,
      },
    },
  };

  // Build regulatorische_meldungen from kommunikation data
  // Populate structured regulatory deadlines alongside the metadata custom_fields copy
  const erkannt = erfassen.erkennungszeitpunkt;
  if (
    kommunikation.kritischeInfrastruktur === 'ja' ||
    kommunikation.personendatenBetroffen === 'ja' ||
    kommunikation.reguliertesUnternehmen === 'ja'
  ) {
    incident.regulatorische_meldungen = {
      isg_24h:
        kommunikation.kritischeInfrastruktur === 'ja' && erkannt
          ? new Date(new Date(erkannt).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      dsg: kommunikation.personendatenBetroffen === 'ja',
      finma_24h:
        kommunikation.reguliertesUnternehmen === 'ja' && erkannt
          ? new Date(new Date(erkannt).getTime() + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      finma_72h:
        kommunikation.reguliertesUnternehmen === 'ja' && erkannt
          ? new Date(new Date(erkannt).getTime() + 72 * 60 * 60 * 1000).toISOString()
          : undefined,
    };
  }

  return incident;
}

// ============================================================================
// Main Migration Function
// ============================================================================

/**
 * Read v1.0 state from localStorage and return array of incidents to migrate
 * Pure function: no side effects, no localStorage mutations
 * Handles JSON parsing errors gracefully
 */
export function migrateIncidents(v1State: LegacyWizardState): CreateIncidentInput[] {
  // Single v1.0 incident (the current wizard state)
  // In v1.1, this becomes one incident record in the database
  const mapped = mapIncidentState(v1State);

  if (!mapped) {
    console.warn('[Migration] Could not map v1.0 state to v1.1 schema');
    return [];
  }

  return [mapped];
}

/**
 * Get v1.0 state from localStorage, handling parse errors
 */
export function getV1StateFromStorage(): LegacyWizardState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem('siag-wizard-state');
    if (!stored) return null;
    return JSON.parse(stored) as LegacyWizardState;
  } catch (error) {
    console.warn('[Migration] Failed to parse v1.0 state from localStorage:', error);
    return null;
  }
}
