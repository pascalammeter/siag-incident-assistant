'use client'

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { type WizardState, type WizardAction, initialState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, MAX_STEP) }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, MIN_STEP) }
    case 'GO_TO_STEP':
      return { ...state, currentStep: Math.max(MIN_STEP, Math.min(action.step, MAX_STEP)) }
    case 'CONFIRM_NO_GO':
      return { ...state, noGoConfirmed: true }
    case 'UPDATE_STEP':
      return { ...state, [action.stepKey]: action.data }
    case 'RESET':
      return initialState
    case 'HYDRATE':
      return { ...initialState, ...action.data }
    default:
      return state
  }
}

export const STORAGE_KEY = 'siag-wizard-state'

const WizardContext = createContext<{ state: WizardState; dispatch: Dispatch<WizardAction> } | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Read from localStorage on mount (SSR-safe: useEffect only runs in browser)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'HYDRATE', data: parsed })
      }
    } catch {
      // Ignore corrupted data — start fresh
    }
    setIsHydrated(true)
  }, [])

  // Write to localStorage on every state change (skip until hydrated to avoid overwriting with initialState)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  // Prevent rendering children until hydration complete (avoids flash of initial state)
  if (!isHydrated) {
    return null
  }

  return <WizardContext.Provider value={{ state, dispatch }}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
