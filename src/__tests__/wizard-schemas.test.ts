import { describe, it, expect } from 'vitest'
import {
  einstiegSchema, erfassenSchema, klassifikationSchema,
  reaktionSchema, kommunikationSchema, dokumentationSchema,
  stepSchemas
} from '@/lib/wizard-schemas'

describe('wizard-schemas', () => {
  // Placeholder schemas that still accept empty objects
  const emptySchemas = [
    ['einstiegSchema', einstiegSchema],
    ['dokumentationSchema', dokumentationSchema],
  ] as const

  emptySchemas.forEach(([name, schema]) => {
    it(`${name} accepts empty object`, () => {
      expect(schema.parse({})).toEqual({})
    })
  })

  // Phase 4: reaktionSchema and kommunikationSchema accept empty but apply defaults
  it('reaktionSchema accepts empty object with defaults', () => {
    expect(reaktionSchema.parse({})).toEqual({ completedSteps: [] })
  })

  it('kommunikationSchema accepts empty object with defaults', () => {
    const result = kommunikationSchema.parse({})
    expect(result.kritischeInfrastruktur).toBeNull()
    expect(result.kommChecklist).toEqual([])
  })

  // Phase 3 schemas: erfassenSchema and klassifikationSchema now have required fields
  it('erfassenSchema rejects empty object (required fields: erkennungszeitpunkt, erkannt_durch)', () => {
    expect(() => erfassenSchema.parse({})).toThrow()
  })

  it('klassifikationSchema rejects empty object (required fields: q1, q2, q3, incidentType, severity)', () => {
    expect(() => klassifikationSchema.parse({})).toThrow()
  })

  it('stepSchemas maps all 6 step keys', () => {
    expect(Object.keys(stepSchemas)).toEqual([
      'einstieg', 'erfassen', 'klassifikation', 'reaktion', 'kommunikation', 'dokumentation'
    ])
  })

  // Phase 4: reaktionSchema tests
  describe('reaktionSchema', () => {
    it('validates { completedSteps: ["sofort-01"] } successfully', () => {
      const result = reaktionSchema.parse({ completedSteps: ['sofort-01'] })
      expect(result.completedSteps).toEqual(['sofort-01'])
    })

    it('validates { completedSteps: [] } successfully (partial progress OK)', () => {
      const result = reaktionSchema.parse({ completedSteps: [] })
      expect(result.completedSteps).toEqual([])
    })

    it('defaults completedSteps to [] when not provided', () => {
      const result = reaktionSchema.parse({})
      expect(result.completedSteps).toEqual([])
    })
  })

  // Phase 4: kommunikationSchema tests
  describe('kommunikationSchema', () => {
    it('validates full KommunikationData object', () => {
      const result = kommunikationSchema.parse({
        kritischeInfrastruktur: 'ja',
        personendatenBetroffen: 'nein',
        reguliertesUnternehmen: 'ja',
        kommChecklist: ['gl-informiert', 'mitarbeitende-informiert'],
        templateGL: 'Sehr geehrte Damen und Herren...',
        templateMitarbeitende: 'Liebe Kolleginnen...',
        templateMedien: 'Pressemitteilung...',
      })
      expect(result.kritischeInfrastruktur).toBe('ja')
      expect(result.personendatenBetroffen).toBe('nein')
      expect(result.kommChecklist).toHaveLength(2)
    })

    it('allows null for Meldepflicht fields (default state)', () => {
      const result = kommunikationSchema.parse({})
      expect(result.kritischeInfrastruktur).toBeNull()
      expect(result.personendatenBetroffen).toBeNull()
      expect(result.reguliertesUnternehmen).toBeNull()
      expect(result.kommChecklist).toEqual([])
    })

    it('rejects invalid enum values for Meldepflicht fields', () => {
      expect(() =>
        kommunikationSchema.parse({ kritischeInfrastruktur: 'vielleicht' })
      ).toThrow()
    })
  })
})
