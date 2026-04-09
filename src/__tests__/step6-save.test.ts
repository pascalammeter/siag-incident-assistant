/**
 * Tests for wizard-to-API mapping (mapIncidentState) and save flow
 * Plan: 13-05 — Wire wizard save to API
 */

import { describe, it, expect } from 'vitest'
import { mapIncidentState, LegacyWizardState } from '../lib/migration'

// ============================================================================
// Shared fixtures
// ============================================================================

const DETECTION_TIME = '2026-04-09T08:00:00.000Z'

function buildFullState(): LegacyWizardState {
  return {
    currentStep: 6,
    noGoConfirmed: true,
    einstieg: {},
    erfassen: {
      erkennungszeitpunkt: DETECTION_TIME,
      erkannt_durch: 'it-mitarbeiter',
      betroffene_systeme: ['Fileserver', 'AD'],
      erste_auffaelligkeiten: 'Verschluesselte Dateien entdeckt',
      loesegeld_meldung: true,
    },
    klassifikation: {
      q1SystemeBetroffen: 'ja',
      q2PdBetroffen: 'ja',
      q3AngreiferAktiv: 'nein',
      incidentType: 'ransomware',
      severity: 'KRITISCH',
    },
    reaktion: {
      completedSteps: ['step-1', 'step-2', 'step-3'],
    },
    kommunikation: {
      kritischeInfrastruktur: 'ja',
      personendatenBetroffen: 'ja',
      reguliertesUnternehmen: 'nein',
      kommChecklist: ['siag-benachrichtigt', 'gl-informiert'],
    },
  }
}

// ============================================================================
// Tests: Wizard to API mapping
// ============================================================================

describe('Wizard to API mapping', () => {
  it('Test 1: maps full wizard state to CreateIncidentInput with all fields', () => {
    const state = buildFullState()
    const result = mapIncidentState(state)

    expect(result).not.toBeNull()
    expect(result!.incident_type).toBe('ransomware')
    expect(result!.severity).toBe('critical')
    expect(result!.erkannt_durch).toBe('it-mitarbeiter')
    expect(result!.betroffene_systeme).toEqual(['Fileserver', 'AD'])
    expect(result!.erste_erkenntnisse).toBe('Verschluesselte Dateien entdeckt')
    expect(result!.erkennungszeitpunkt).toBe(DETECTION_TIME)
    expect(result!.q1).toBe(1) // 'ja'
    expect(result!.q2).toBe(1) // 'ja'
    expect(result!.q3).toBe(0) // 'nein'
  })

  it('Test 2: maps Phishing wizard state — incidentType=phishing, severity HOCH → high', () => {
    const state: LegacyWizardState = {
      erfassen: { erkennungszeitpunkt: DETECTION_TIME },
      klassifikation: {
        incidentType: 'phishing',
        severity: 'HOCH',
      },
      reaktion: {},
      kommunikation: {},
    }
    const result = mapIncidentState(state)

    expect(result).not.toBeNull()
    expect(result!.incident_type).toBe('phishing')
    expect(result!.severity).toBe('high')
  })

  it('Test 3: maps datenverlust incident type to data_loss', () => {
    const state: LegacyWizardState = {
      erfassen: {},
      klassifikation: {
        incidentType: 'datenverlust',
        severity: 'MITTEL',
      },
      reaktion: {},
      kommunikation: {},
    }
    const result = mapIncidentState(state)

    expect(result).not.toBeNull()
    expect(result!.incident_type).toBe('data_loss')
    expect(result!.severity).toBe('medium')
  })

  it('Test 4: kommunikation data populates regulatorische_meldungen with ISG/DSG/FINMA flags', () => {
    const state = buildFullState()
    // kritischeInfrastruktur=ja, personendatenBetroffen=ja, reguliertesUnternehmen=nein
    const result = mapIncidentState(state)

    expect(result).not.toBeNull()
    expect(result!.regulatorische_meldungen).toBeDefined()
    // ISG 24h deadline should be set (kritischeInfrastruktur=ja)
    expect(result!.regulatorische_meldungen!.isg_24h).toBeDefined()
    const isgDeadline = new Date(result!.regulatorische_meldungen!.isg_24h as string)
    const expectedIsg = new Date(new Date(DETECTION_TIME).getTime() + 24 * 60 * 60 * 1000)
    expect(isgDeadline.toISOString()).toBe(expectedIsg.toISOString())
    // DSG should be true (personendatenBetroffen=ja)
    expect(result!.regulatorische_meldungen!.dsg).toBe(true)
    // FINMA should NOT be set (reguliertesUnternehmen=nein)
    expect(result!.regulatorische_meldungen!.finma_24h).toBeUndefined()
    expect(result!.regulatorische_meldungen!.finma_72h).toBeUndefined()
  })

  it('Test 5: missing klassifikation returns null (graceful failure)', () => {
    const state: LegacyWizardState = {
      erfassen: { erkennungszeitpunkt: DETECTION_TIME },
      // klassifikation intentionally omitted — no incidentType or severity
      reaktion: {},
      kommunikation: {},
    }
    const result = mapIncidentState(state)
    expect(result).toBeNull()
  })

  it('Test 6: missing severity returns null', () => {
    const state: LegacyWizardState = {
      erfassen: {},
      klassifikation: {
        incidentType: 'ransomware',
        // severity intentionally omitted
      },
      reaktion: {},
      kommunikation: {},
    }
    const result = mapIncidentState(state)
    expect(result).toBeNull()
  })
})
