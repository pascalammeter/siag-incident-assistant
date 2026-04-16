'use client'

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { type WizardState, type WizardAction, initialState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'
import { apiClient, APIError, shouldFallback } from '@/api/client'
import { mapIncidentToWizardState } from '@/lib/migration'
import { showWarningToast, showErrorToast } from '@/components/Toast'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import type { Incident } from '@/lib/incident-types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

export function WizardProvider({ children, incidentId }: { children: ReactNode; incidentId?: string }) {
  const router = useRouter()
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate wizard state on mount: API fetch path (resume) or localStorage path (new incident)
  useEffect(() => {
    async function hydrate() {
      if (incidentId) {
        // === API FETCH PATH (resume existing incident) ===
        // Per D-05: no partial/optimistic rendering from localStorage
        // Per D-07: resume starts at Step 1

        // UUID validation (T-19-02 security: prevent injection)
        if (!UUID_RE.test(incidentId)) {
          showErrorToast('Ungueltige Vorfall-ID.')
          setTimeout(() => router.push('/incidents'), 1500)
          setIsHydrated(true)
          return
        }

        try {
          const incident = await apiClient.get<Incident>(`/api/incidents/${incidentId}`)
          const mapped = mapIncidentToWizardState(incident)
          dispatch({ type: 'HYDRATE', data: { ...mapped, currentStep: 1 } as WizardState })
        } catch (err) {
          // 404: incident not found or soft-deleted (D-13)
          if (err instanceof APIError && err.isNotFound()) {
            showErrorToast('Vorfall nicht gefunden oder geloescht.')
            setTimeout(() => router.push('/incidents'), 1500)
            setIsHydrated(true)
            return
          }

          // Network/server error: fall back to localStorage (D-09, D-10)
          if (shouldFallback(err)) {
            try {
              const saved = localStorage.getItem(STORAGE_KEY)
              if (saved) {
                const parsed = JSON.parse(saved)
                dispatch({ type: 'HYDRATE', data: { ...parsed, currentStep: 1 } })
                showWarningToast('Offline-Modus \u2014 zwischengespeicherte Daten geladen')
              } else {
                // No localStorage data either (D-12)
                showErrorToast('Vorfall konnte nicht geladen werden. Bitte versuchen Sie es erneut.')
                dispatch({ type: 'HYDRATE', data: { ...initialState, currentStep: 1 } as WizardState })
              }
            } catch {
              showErrorToast('Vorfall konnte nicht geladen werden. Bitte versuchen Sie es erneut.')
              dispatch({ type: 'HYDRATE', data: { ...initialState, currentStep: 1 } as WizardState })
            }
          } else {
            // Other client errors (400, 403, etc.)
            showErrorToast('Vorfall konnte nicht geladen werden.')
            setTimeout(() => router.push('/incidents'), 1500)
            setIsHydrated(true)
            return
          }
        }
      } else {
        // === LOCALSTORAGE PATH (new incident, unchanged behavior) ===
        // Per D-08: new incidents start at Step 0
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) {
            const parsed = JSON.parse(saved)
            dispatch({ type: 'HYDRATE', data: { ...parsed, currentStep: 0, noGoConfirmed: false } })
          }
        } catch {
          // Ignore corrupted data — start fresh
        }
      }
      setIsHydrated(true)
    }
    hydrate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // incidentId is a prop from Server Component, stable across renders

  // Write to localStorage on every state change (skip until hydrated to avoid overwriting with initialState)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  // Prevent rendering children until hydration complete (avoids flash of initial state)
  if (!isHydrated) {
    if (incidentId) {
      return (
        <div className="flex justify-center items-center py-12" role="status" aria-label="Vorfall wird geladen">
          <LoadingSpinner size="lg" />
        </div>
      )
    }
    return null
  }

  return <WizardContext.Provider value={{ state, dispatch }}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
