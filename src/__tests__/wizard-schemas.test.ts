import { describe, it, expect } from 'vitest'
import {
  einstiegSchema, erfassenSchema, klassifikationSchema,
  reaktionSchema, kommunikationSchema, dokumentationSchema,
  stepSchemas
} from '@/lib/wizard-schemas'

describe('wizard-schemas', () => {
  const schemas = [
    ['einstiegSchema', einstiegSchema],
    ['erfassenSchema', erfassenSchema],
    ['klassifikationSchema', klassifikationSchema],
    ['reaktionSchema', reaktionSchema],
    ['kommunikationSchema', kommunikationSchema],
    ['dokumentationSchema', dokumentationSchema],
  ] as const

  schemas.forEach(([name, schema]) => {
    it(`${name} accepts empty object`, () => {
      expect(schema.parse({})).toEqual({})
    })
  })

  it('stepSchemas maps all 6 step keys', () => {
    expect(Object.keys(stepSchemas)).toEqual([
      'einstieg', 'erfassen', 'klassifikation', 'reaktion', 'kommunikation', 'dokumentation'
    ])
  })
})
