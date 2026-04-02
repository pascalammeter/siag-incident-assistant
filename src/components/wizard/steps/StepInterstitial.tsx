'use client'

import { useState } from 'react'
import { useWizard } from '../WizardContext'

export function StepInterstitial() {
  const { state, dispatch } = useWizard()
  const [checked, setChecked] = useState(state.noGoConfirmed)

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_NO_GO' })
    dispatch({ type: 'NEXT_STEP' })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-siag-navy">Wichtige Hinweise vor dem Start</h2>
      <p className="text-gray-600">
        Bevor Sie mit der Incident-Erfassung beginnen, beachten Sie diese kritischen Regeln.
      </p>
      {/* Placeholder for the 8 No-Go rules — content in Phase 3 */}
      <div className="border-l-4 border-siag-amber bg-amber-50 p-4 rounded-r-lg">
        <p className="font-medium text-siag-navy">8 No-Go-Regeln werden hier in Phase 3 eingefuegt.</p>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Ich habe diese Hinweise gelesen und verstanden.</span>
      </label>
      <button
        onClick={handleConfirm}
        disabled={!checked}
        className="bg-siag-navy text-white px-6 py-3 rounded-lg font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verstanden — Weiter
      </button>
    </div>
  )
}
