import { describe, it, expect } from 'vitest'
import { wizardReducer } from '@/components/wizard/WizardContext'
import { initialState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'
import type { WizardState } from '@/lib/wizard-types'

describe('wizardReducer', () => {
  // NEXT_STEP
  it('NEXT_STEP: increments currentStep from 1 to 2', () => {
    const state: WizardState = { ...initialState, currentStep: 1 }
    const result = wizardReducer(state, { type: 'NEXT_STEP' })
    expect(result.currentStep).toBe(2)
  })

  it('NEXT_STEP: does not overflow beyond MAX_STEP', () => {
    const state: WizardState = { ...initialState, currentStep: MAX_STEP }
    const result = wizardReducer(state, { type: 'NEXT_STEP' })
    expect(result.currentStep).toBe(MAX_STEP)
  })

  // PREV_STEP
  it('PREV_STEP: decrements currentStep from 2 to 1', () => {
    const state: WizardState = { ...initialState, currentStep: 2 }
    const result = wizardReducer(state, { type: 'PREV_STEP' })
    expect(result.currentStep).toBe(1)
  })

  it('PREV_STEP: does not underflow below MIN_STEP', () => {
    const state: WizardState = { ...initialState, currentStep: MIN_STEP }
    const result = wizardReducer(state, { type: 'PREV_STEP' })
    expect(result.currentStep).toBe(MIN_STEP)
  })

  // GO_TO_STEP
  it('GO_TO_STEP: sets currentStep to specified step', () => {
    const result = wizardReducer(initialState, { type: 'GO_TO_STEP', step: 3 })
    expect(result.currentStep).toBe(3)
  })

  it('GO_TO_STEP: clamps to MAX_STEP if step exceeds max', () => {
    const result = wizardReducer(initialState, { type: 'GO_TO_STEP', step: 99 })
    expect(result.currentStep).toBe(MAX_STEP)
  })

  it('GO_TO_STEP: clamps to MIN_STEP if step is below min', () => {
    const result = wizardReducer(initialState, { type: 'GO_TO_STEP', step: -5 })
    expect(result.currentStep).toBe(MIN_STEP)
  })

  // UPDATE_STEP
  it('UPDATE_STEP: sets step data for the given stepKey', () => {
    const data = { foo: 'bar' }
    const result = wizardReducer(initialState, { type: 'UPDATE_STEP', stepKey: 'erfassen', data })
    expect(result.erfassen).toEqual(data)
  })

  it('UPDATE_STEP: does not mutate other step keys', () => {
    const data = { foo: 'bar' }
    const result = wizardReducer(initialState, { type: 'UPDATE_STEP', stepKey: 'erfassen', data })
    expect(result.einstieg).toBeNull()
    expect(result.klassifikation).toBeNull()
  })

  // CONFIRM_NO_GO
  it('CONFIRM_NO_GO: sets noGoConfirmed to true', () => {
    const result = wizardReducer(initialState, { type: 'CONFIRM_NO_GO' })
    expect(result.noGoConfirmed).toBe(true)
  })

  // RESET
  it('RESET: returns initialState', () => {
    const modifiedState: WizardState = {
      ...initialState,
      currentStep: 4,
      noGoConfirmed: true,
      erfassen: { someData: true } as never,
    }
    const result = wizardReducer(modifiedState, { type: 'RESET' })
    expect(result).toEqual(initialState)
  })

  // HYDRATE
  it('HYDRATE: merges provided data into state', () => {
    const data: WizardState = { ...initialState, currentStep: 3, noGoConfirmed: true }
    const result = wizardReducer(initialState, { type: 'HYDRATE', data })
    expect(result.currentStep).toBe(3)
    expect(result.noGoConfirmed).toBe(true)
  })
})
