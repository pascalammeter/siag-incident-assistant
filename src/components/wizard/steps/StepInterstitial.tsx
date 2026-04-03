'use client'

import { useState } from 'react'
import { useWizard } from '../WizardContext'

const NO_GO_RULES = [
  'Systeme nicht neu starten \u2014 Beweise gehen verloren',
  'Kein Loesegeld zahlen \u2014 keine Garantie fuer Entschluesselung',
  'Keinen Kontakt mit Angreifern ohne juristischen Beistand',
  'Keine Bereinigung vor der forensischen Sicherung',
  'Keine Logdateien loeschen oder ueberschreiben',
  'Vorfall nicht vertuschen \u2014 Meldepflichten beachten',
  'Backups sofort isolieren \u2014 nicht auf infizierte Systeme zugreifen',
  'Normale Arbeit sofort stoppen \u2014 Schadensbegrenzung priorisieren',
]

export function StepInterstitial() {
  const { state, dispatch } = useWizard()
  const [checked, setChecked] = useState(state.noGoConfirmed)

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_NO_GO' })
    dispatch({ type: 'NEXT_STEP' })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Wichtige Hinweise vor dem Start</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        Bevor Sie mit der Incident-Erfassung beginnen, beachten Sie diese kritischen Regeln.
      </p>

      {/* 8 No-Go Rule Cards */}
      <div className="space-y-3">
        {NO_GO_RULES.map((rule, index) => (
          <div key={index} className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4">
            <p className="text-sm font-normal text-navy">
              <span className="mr-2">&#9888;</span>
              {rule}
            </p>
          </div>
        ))}
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 accent-navy mt-0.5"
        />
        <span className="text-sm text-gray-700">Ich habe diese Hinweise gelesen und verstanden.</span>
      </label>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!checked}
        className="bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-light transition-colors"
      >
        Verstanden — Weiter
      </button>
    </div>
  )
}
