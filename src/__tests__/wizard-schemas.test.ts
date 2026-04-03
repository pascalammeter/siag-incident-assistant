import { describe, it, expect } from 'vitest'
import {
  einstiegSchema, erfassenSchema, klassifikationSchema,
  reaktionSchema, kommunikationSchema, dokumentationSchema,
  stepSchemas
} from '@/lib/wizard-schemas'

describe('wizard-schemas', () => {
  // These placeholder schemas still accept empty objects (filled in later phases)
  const emptySchemas = [
    ['einstiegSchema', einstiegSchema],
    ['reaktionSchema', reaktionSchema],
    ['kommunikationSchema', kommunikationSchema],
    ['dokumentationSchema', dokumentationSchema],
  ] as const

  emptySchemas.forEach(([name, schema]) => {
    it(`${name} accepts empty object`, () => {
      expect(schema.parse({})).toEqual({})
    })
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
})
