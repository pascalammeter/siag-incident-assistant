import { describe, it, expect } from 'vitest'
import { calculateSeverity, erfassenSchema, klassifikationSchema } from '@/lib/wizard-schemas'

describe('calculateSeverity', () => {
  it('returns KRITISCH when Q1 is ja', () => {
    expect(calculateSeverity('ja', 'nein', 'nein')).toBe('KRITISCH')
  })

  it('returns KRITISCH when Q3 is ja', () => {
    expect(calculateSeverity('nein', 'nein', 'ja')).toBe('KRITISCH')
  })

  it('returns KRITISCH when Q3 is unbekannt (assume worst case)', () => {
    expect(calculateSeverity('nein', 'nein', 'unbekannt')).toBe('KRITISCH')
  })

  it('returns HOCH when Q1=nein, Q3=nein, Q2=ja', () => {
    expect(calculateSeverity('nein', 'ja', 'nein')).toBe('HOCH')
  })

  it('returns MITTEL when all nein', () => {
    expect(calculateSeverity('nein', 'nein', 'nein')).toBe('MITTEL')
  })
})

describe('erfassenSchema', () => {
  it('rejects empty object (required fields missing)', () => {
    expect(() => erfassenSchema.parse({})).toThrow()
  })

  it('accepts valid full data', () => {
    const result = erfassenSchema.parse({
      erkennungszeitpunkt: '2026-04-03T09:00',
      erkannt_durch: 'it-mitarbeiter',
      betroffene_systeme: ['Server', 'Backups'],
      erste_auffaelligkeiten: 'Verschluesselte Dateien entdeckt',
      loesegeld_meldung: true,
    })
    expect(result.erkennungszeitpunkt).toBe('2026-04-03T09:00')
    expect(result.erkannt_durch).toBe('it-mitarbeiter')
    expect(result.loesegeld_meldung).toBe(true)
  })

  it('defaults betroffene_systeme to [] if omitted', () => {
    const result = erfassenSchema.parse({
      erkennungszeitpunkt: '2026-04-03T09:00',
      erkannt_durch: 'nutzer',
    })
    expect(result.betroffene_systeme).toEqual([])
  })

  it('defaults loesegeld_meldung to false if omitted', () => {
    const result = erfassenSchema.parse({
      erkennungszeitpunkt: '2026-04-03T09:00',
      erkannt_durch: 'nutzer',
    })
    expect(result.loesegeld_meldung).toBe(false)
  })
})

describe('klassifikationSchema', () => {
  it('rejects empty object (required fields missing)', () => {
    expect(() => klassifikationSchema.parse({})).toThrow()
  })

  it('accepts valid full data', () => {
    const result = klassifikationSchema.parse({
      q1SystemeBetroffen: 'ja',
      q2PdBetroffen: 'nein',
      q3AngreiferAktiv: 'unbekannt',
      incidentType: 'ransomware',
      severity: 'KRITISCH',
    })
    expect(result.q1SystemeBetroffen).toBe('ja')
    expect(result.incidentType).toBe('ransomware')
    expect(result.severity).toBe('KRITISCH')
  })
})
