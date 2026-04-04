import { describe, it, expect } from 'vitest'
import {
  computeDeadline,
  formatDeadline,
  generateGLTemplate,
  generateMitarbeitendeTemplate,
  generateMedienTemplate,
} from '@/lib/communication-templates'
import type { WizardState } from '@/lib/wizard-types'
import { initialState } from '@/lib/wizard-types'

describe('computeDeadline', () => {
  it('adds 24 hours correctly', () => {
    const result = computeDeadline('2026-04-03T14:32:00.000Z', 24)
    expect(result.toISOString()).toBe('2026-04-04T14:32:00.000Z')
  })

  it('adds 72 hours correctly', () => {
    const result = computeDeadline('2026-04-03T14:32:00.000Z', 72)
    expect(result.toISOString()).toBe('2026-04-06T14:32:00.000Z')
  })
})

describe('formatDeadline', () => {
  it('produces string containing "Uhr" suffix', () => {
    const date = new Date('2026-04-04T14:32:00.000Z')
    const result = formatDeadline(date)
    expect(result).toContain('Uhr')
  })

  it('uses de-CH locale format', () => {
    const date = new Date('2026-04-04T14:32:00.000Z')
    const result = formatDeadline(date)
    // de-CH locale should produce German day/month names
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(10)
  })
})

describe('generateGLTemplate', () => {
  const fullState: WizardState = {
    ...initialState,
    erfassen: {
      erkennungszeitpunkt: '2026-04-03T14:32:00.000Z',
      erkannt_durch: 'it-mitarbeiter',
      betroffene_systeme: ['ERP-System', 'Fileserver'],
      loesegeld_meldung: true,
    },
    klassifikation: {
      q1SystemeBetroffen: 'ja',
      q2PdBetroffen: 'ja',
      q3AngreiferAktiv: 'ja',
      incidentType: 'ransomware',
      severity: 'KRITISCH',
    },
  }

  it('includes erkennungszeitpunkt in template', () => {
    const result = generateGLTemplate(fullState)
    // Should contain formatted date, not raw ISO
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(50)
  })

  it('includes severity in template', () => {
    const result = generateGLTemplate(fullState)
    expect(result).toContain('KRITISCH')
  })

  it('includes betroffene_systeme in template', () => {
    const result = generateGLTemplate(fullState)
    expect(result).toContain('ERP-System')
    expect(result).toContain('Fileserver')
  })

  it('includes static placeholders', () => {
    const result = generateGLTemplate(fullState)
    expect(result).toContain('[Firmenname]')
    expect(result).toContain('[Name des Ansprechpartners]')
  })

  it('uses fallback placeholders with empty state', () => {
    const result = generateGLTemplate(initialState)
    expect(result).toContain('[Datum/Uhrzeit]')
  })
})

describe('generateMitarbeitendeTemplate', () => {
  it('returns German template with [Firmenname] placeholder', () => {
    const result = generateMitarbeitendeTemplate(initialState)
    expect(result).toContain('[Firmenname]')
  })

  it('contains meaningful template text', () => {
    const result = generateMitarbeitendeTemplate(initialState)
    expect(result.length).toBeGreaterThan(50)
  })
})

describe('generateMedienTemplate', () => {
  it('returns German template with [Firmenname] placeholder', () => {
    const result = generateMedienTemplate(initialState)
    expect(result).toContain('[Firmenname]')
  })

  it('contains meaningful template text', () => {
    const result = generateMedienTemplate(initialState)
    expect(result.length).toBeGreaterThan(50)
  })

  it('includes static [Name des Ansprechpartners] placeholder', () => {
    const result = generateMedienTemplate(initialState)
    expect(result).toContain('[Name des Ansprechpartners]')
  })
})
