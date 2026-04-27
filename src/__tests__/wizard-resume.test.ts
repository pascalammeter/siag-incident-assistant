/**
 * Tests for API-to-WizardState reverse mapping (mapIncidentToWizardState)
 * Plan: 19-01 — Reverse mapping function for wizard resume from API
 */

import { describe, it, expect } from 'vitest'
import {
  mapIncidentToWizardState,
  mapApiTypeToWizardType,
  mapApiSeverityToWizardSeverity,
  mapIntToYesNo,
  mapIntToYesNoUnbekannt,
} from '../lib/migration'
import type { Incident } from '../lib/incident-types'

// ============================================================================
// Shared fixtures
// ============================================================================

const DETECTION_TIME = '2026-04-09T08:00:00.000Z'

function buildFullIncident(): Incident {
  return {
    id: 'test-uuid-1234',
    createdAt: '2026-04-09T08:00:00.000Z',
    updatedAt: '2026-04-09T10:00:00.000Z',
    erkennungszeitpunkt: DETECTION_TIME,
    erkannt_durch: 'it-mitarbeiter',
    betroffene_systeme: ['Fileserver', 'AD'],
    erste_erkenntnisse: 'Verschluesselte Dateien entdeckt',
    incident_type: 'ransomware',
    q1: 1,
    q2: 1,
    q3: 0,
    severity: 'critical',
    playbook: {
      checkedSteps: [
        { stepId: 'step-1', checked: true, timestamp: '2026-04-09T09:00:00.000Z' },
        { stepId: 'step-2', checked: true, timestamp: '2026-04-09T09:30:00.000Z' },
        { stepId: 'step-3', checked: false },
      ],
      status: 'in_progress',
    },
    regulatorische_meldungen: {
      isg_24h: '2026-04-10T08:00:00.000Z',
      dsg: true,
      finma_24h: undefined,
      finma_72h: undefined,
    },
    metadata: {
      tags: ['v1.0-migrated'],
      notes: 'Test incident',
      custom_fields: {
        loesegeld_meldung: true,
        kritischeInfrastruktur: 'ja',
        personendatenBetroffen: 'ja',
        reguliertesUnternehmen: 'nein',
      },
    },
  }
}

// ============================================================================
// Tests: mapApiTypeToWizardType
// ============================================================================

describe('mapApiTypeToWizardType', () => {
  it('maps ransomware -> ransomware', () => {
    expect(mapApiTypeToWizardType('ransomware')).toBe('ransomware')
  })

  it('maps phishing -> phishing', () => {
    expect(mapApiTypeToWizardType('phishing')).toBe('phishing')
  })

  it('maps ddos -> ddos', () => {
    expect(mapApiTypeToWizardType('ddos')).toBe('ddos')
  })

  it('maps data_loss -> datenverlust', () => {
    expect(mapApiTypeToWizardType('data_loss')).toBe('datenverlust')
  })

  it('maps other -> sonstiges', () => {
    expect(mapApiTypeToWizardType('other')).toBe('sonstiges')
  })

  it('maps null/undefined -> ransomware (default)', () => {
    expect(mapApiTypeToWizardType(null)).toBe('ransomware')
    expect(mapApiTypeToWizardType(undefined)).toBe('ransomware')
  })
})

// ============================================================================
// Tests: mapApiSeverityToWizardSeverity
// ============================================================================

describe('mapApiSeverityToWizardSeverity', () => {
  it('maps critical -> KRITISCH', () => {
    expect(mapApiSeverityToWizardSeverity('critical')).toBe('KRITISCH')
  })

  it('maps high -> HOCH', () => {
    expect(mapApiSeverityToWizardSeverity('high')).toBe('HOCH')
  })

  it('maps medium -> MITTEL', () => {
    expect(mapApiSeverityToWizardSeverity('medium')).toBe('MITTEL')
  })

  it('maps low -> MITTEL (WizardState has no LOW)', () => {
    expect(mapApiSeverityToWizardSeverity('low')).toBe('MITTEL')
  })

  it('maps null/undefined -> MITTEL (default)', () => {
    expect(mapApiSeverityToWizardSeverity(null)).toBe('MITTEL')
    expect(mapApiSeverityToWizardSeverity(undefined)).toBe('MITTEL')
  })
})

// ============================================================================
// Tests: mapIntToYesNo
// ============================================================================

describe('mapIntToYesNo', () => {
  it('maps 1 -> ja', () => {
    expect(mapIntToYesNo(1)).toBe('ja')
  })

  it('maps 0 -> nein', () => {
    expect(mapIntToYesNo(0)).toBe('nein')
  })

  it('maps null -> nein (default)', () => {
    expect(mapIntToYesNo(null)).toBe('nein')
  })
})

// ============================================================================
// Tests: mapIntToYesNoUnbekannt
// ============================================================================

describe('mapIntToYesNoUnbekannt', () => {
  it('maps 1 -> ja', () => {
    expect(mapIntToYesNoUnbekannt(1)).toBe('ja')
  })

  it('maps 0 -> nein', () => {
    expect(mapIntToYesNoUnbekannt(0)).toBe('nein')
  })

  it('maps null -> unbekannt', () => {
    expect(mapIntToYesNoUnbekannt(null)).toBe('unbekannt')
  })

  it('maps undefined -> unbekannt', () => {
    expect(mapIntToYesNoUnbekannt(undefined)).toBe('unbekannt')
  })
})

// ============================================================================
// Tests: mapIncidentToWizardState
// ============================================================================

describe('Wizard resume from API', () => {
  describe('mapIncidentToWizardState', () => {
    it('maps full incident to WizardState with all fields', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      // Erfassen section
      expect(result.erfassen).toBeDefined()
      expect(result.erfassen!.erkannt_durch).toBe('it-mitarbeiter')
      expect(result.erfassen!.betroffene_systeme).toEqual(['Fileserver', 'AD'])
      expect(result.erfassen!.loesegeld_meldung).toBe(true)

      // Klassifikation section
      expect(result.klassifikation).toBeDefined()
      expect(result.klassifikation!.incidentType).toBe('ransomware')
      expect(result.klassifikation!.severity).toBe('KRITISCH')
      expect(result.klassifikation!.q1SystemeBetroffen).toBe('ja')
      expect(result.klassifikation!.q2PdBetroffen).toBe('ja')
      expect(result.klassifikation!.q3AngreiferAktiv).toBe('nein')

      // Reaktion section
      expect(result.reaktion).toBeDefined()
      expect(result.reaktion!.completedSteps).toEqual(['step-1', 'step-2'])

      // Kommunikation section
      expect(result.kommunikation).toBeDefined()
      expect(result.kommunikation!.kritischeInfrastruktur).toBe('ja')
    })

    it('maps erkennungszeitpunkt to datetime-local format (YYYY-MM-DDTHH:mm)', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      // datetime-local format: no seconds, no timezone
      expect(result.erfassen!.erkennungszeitpunkt).toBe('2026-04-09T08:00')
      expect(result.erfassen!.erkennungszeitpunkt).toHaveLength(16)
    })

    it('maps playbook checkedSteps (checked=true only) to reaktion.completedSteps', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      // Only step-1 and step-2 are checked=true, step-3 is checked=false
      expect(result.reaktion!.completedSteps).toEqual(['step-1', 'step-2'])
      expect(result.reaktion!.completedSteps).not.toContain('step-3')
    })

    it('maps metadata.custom_fields to kommunikation section', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      expect(result.kommunikation!.kritischeInfrastruktur).toBe('ja')
      expect(result.kommunikation!.personendatenBetroffen).toBe('ja')
      expect(result.kommunikation!.reguliertesUnternehmen).toBe('nein')
    })

    it('handles incident with all null/undefined optional fields', () => {
      const minimalIncident: Incident = {
        id: 'minimal-uuid',
        createdAt: '2026-04-09T08:00:00.000Z',
        updatedAt: '2026-04-09T08:00:00.000Z',
      }
      const result = mapIncidentToWizardState(minimalIncident)

      // Should not crash, returns partial state with defaults
      expect(result.erfassen).toBeDefined()
      expect(result.erfassen!.erkennungszeitpunkt).toBe('')
      expect(result.erfassen!.betroffene_systeme).toEqual([])
      expect(result.klassifikation!.incidentType).toBe('ransomware')
      expect(result.klassifikation!.severity).toBe('MITTEL')
      expect(result.reaktion!.completedSteps).toEqual([])
      expect(result.kommunikation!.kritischeInfrastruktur).toBeNull()
    })

    it('maps data_loss incident type correctly', () => {
      const incident = buildFullIncident()
      incident.incident_type = 'data_loss'
      const result = mapIncidentToWizardState(incident)

      expect(result.klassifikation!.incidentType).toBe('datenverlust')
    })

    it('does not include currentStep in the mapped state', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      // currentStep is set by WizardProvider, not the mapper
      expect(result).not.toHaveProperty('currentStep')
      expect(result).not.toHaveProperty('noGoConfirmed')
    })

    it('maps erste_erkenntnisse to erfassen.erste_auffaelligkeiten', () => {
      const incident = buildFullIncident()
      const result = mapIncidentToWizardState(incident)

      // Field name difference between API and wizard
      expect(result.erfassen!.erste_auffaelligkeiten).toBe('Verschluesselte Dateien entdeckt')
    })
  })
})
