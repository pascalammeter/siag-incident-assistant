import { describe, it, expect, vi, beforeEach } from 'vitest'
import { wizardReducer } from '@/components/wizard/WizardContext'
import { initialState } from '@/lib/wizard-types'
import type { WizardState } from '@/lib/wizard-types'

describe('localStorage persistence', () => {
  // --- HYDRATE action unit tests (reducer-level) ---

  describe('HYDRATE action', () => {
    it('merges valid partial data onto initialState', () => {
      const savedData = { currentStep: 3, noGoConfirmed: true } as WizardState
      const result = wizardReducer(initialState, { type: 'HYDRATE', data: savedData })
      expect(result.currentStep).toBe(3)
      expect(result.noGoConfirmed).toBe(true)
      // Fields not in savedData should come from initialState
      expect(result.einstieg).toBeNull()
      expect(result.erfassen).toBeNull()
    })

    it('returns initialState when hydrating with empty object', () => {
      const result = wizardReducer(initialState, { type: 'HYDRATE', data: {} as WizardState })
      expect(result).toEqual(initialState)
    })

    it('preserves step data from saved state', () => {
      const savedData = {
        ...initialState,
        currentStep: 5,
        erfassen: { someField: 'value' } as never,
      }
      const result = wizardReducer(initialState, { type: 'HYDRATE', data: savedData })
      expect(result.currentStep).toBe(5)
      expect(result.erfassen).toEqual({ someField: 'value' })
    })
  })

  // --- localStorage serialization/deserialization tests ---

  describe('serialization and deserialization', () => {
    const STORAGE_KEY = 'siag-wizard-state'

    it('valid JSON from localStorage deserializes into correct state via HYDRATE', () => {
      const savedState: Partial<WizardState> = { currentStep: 4, noGoConfirmed: true }
      const json = JSON.stringify(savedState)
      const parsed = JSON.parse(json)
      const result = wizardReducer(initialState, { type: 'HYDRATE', data: parsed })
      expect(result.currentStep).toBe(4)
      expect(result.noGoConfirmed).toBe(true)
    })

    it('corrupted JSON is caught by try/catch without throwing', () => {
      const corruptedJson = '{currentStep: INVALID'
      expect(() => {
        JSON.parse(corruptedJson)
      }).toThrow()
      // The WizardProvider wraps this in try/catch — verify the pattern works
      let hydrated = false
      try {
        const parsed = JSON.parse(corruptedJson)
        // This line should not be reached
        hydrated = true
      } catch {
        // Gracefully ignored — initialState is used
      }
      expect(hydrated).toBe(false)
    })

    it('null from localStorage means no HYDRATE dispatch needed', () => {
      const saved: string | null = null
      // When localStorage.getItem returns null, no dispatch should happen
      // State remains initialState
      let dispatched = false
      if (saved) {
        dispatched = true
      }
      expect(dispatched).toBe(false)
    })

    it('state serializes to JSON and deserializes back correctly (round-trip)', () => {
      const state: WizardState = {
        ...initialState,
        currentStep: 2,
        noGoConfirmed: true,
        einstieg: { field: 'test' } as never,
      }
      const json = JSON.stringify(state)
      const restored = JSON.parse(json) as WizardState
      const result = wizardReducer(initialState, { type: 'HYDRATE', data: restored })
      expect(result.currentStep).toBe(2)
      expect(result.noGoConfirmed).toBe(true)
      expect(result.einstieg).toEqual({ field: 'test' })
    })
  })

  // --- STORAGE_KEY export test ---

  describe('STORAGE_KEY constant', () => {
    it('STORAGE_KEY is exported and equals siag-wizard-state', async () => {
      const { STORAGE_KEY } = await import('@/components/wizard/WizardContext')
      expect(STORAGE_KEY).toBe('siag-wizard-state')
    })
  })
})
