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
      const result = schema.parse({})
      // Schemas with defaults may add fields (e.g. reaktionSchema adds completedSteps: [])
      expect(result).toMatchObject({})
    })
  })

  it('reaktionSchema defaults completedSteps to empty array', () => {
    expect(reaktionSchema.parse({})).toEqual({ completedSteps: [] })
  })

  it('reaktionSchema accepts completedSteps array', () => {
    expect(reaktionSchema.parse({ completedSteps: ['sofort-01'] })).toEqual({ completedSteps: ['sofort-01'] })
  })

  it('stepSchemas maps all 6 step keys', () => {
    expect(Object.keys(stepSchemas)).toEqual([
      'einstieg', 'erfassen', 'klassifikation', 'reaktion', 'kommunikation', 'dokumentation'
    ])
  })
})
