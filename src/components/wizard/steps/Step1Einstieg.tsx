'use client'

import { useWizard } from '../WizardContext'
import type { KlassifikationData } from '@/lib/wizard-types'

const INCIDENT_TYPE_OPTIONS = [
  { value: 'ransomware' as const, label: 'Ransomware' },
  { value: 'phishing' as const, label: 'Phishing' },
  { value: 'ddos' as const, label: 'DDoS' },
  { value: 'datenverlust' as const, label: 'Datenverlust' },
  { value: 'unbefugter-zugriff' as const, label: 'Unbefugter Zugriff' },
  { value: 'sonstiges' as const, label: 'Sonstiges' },
] as const

export function Step1Einstieg() {
  const { dispatch, state } = useWizard()
  const selectedType = (state.klassifikation as Partial<KlassifikationData>)?.incidentType

  const handleAdvance = () => {
    dispatch({ type: 'NEXT_STEP' })
  }

  const handleTypeSelect = (type: KlassifikationData['incidentType']) => {
    // Playbook-Fortschritt zurücksetzen wenn Typ wechselt — verhindert "34 von 25" Bug
    if (type !== selectedType) {
      dispatch({ type: 'UPDATE_STEP', stepKey: 'reaktion', data: { completedSteps: [] } })
    }
    dispatch({ type: 'UPDATE_STEP', stepKey: 'klassifikation', data: { incidentType: type } })
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-navy dark:text-white">Sicherheitsvorfall?</h2>
        <p className="text-base text-gray-600 dark:text-slate-300 text-center max-w-xl mx-auto">
          Wenn ein Sicherheitsvorfall erkannt wird, fuehrt Sie dieses Modul durch die Erstreaktion.
        </p>
      </div>

      {/* Incident Type Selection */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-6">
        <p className="text-sm font-bold text-navy dark:text-white mb-4" id="incident-type-group-label">Vorfall-Typ (optional zur schnellen Navigation):</p>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
          role="group"
          aria-labelledby="incident-type-group-label"
        >
          {INCIDENT_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTypeSelect(option.value)}
              aria-pressed={selectedType === option.value}
              className={
                selectedType === option.value
                  ? 'bg-navy text-white px-4 py-3 rounded-full font-bold min-h-[44px] text-sm'
                  : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-navy dark:text-white px-4 py-3 rounded-full font-normal min-h-[44px] text-sm hover:border-navy dark:hover:border-slate-400 transition-colors'
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shit-Happens Hero CTA */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleAdvance}
          className="bg-navy text-white text-2xl font-bold px-6 sm:px-12 py-6 rounded-xl min-h-[64px] shadow-lg hover:bg-navy-light transition-colors mx-auto block"
        >
          Shit Happens — Los geht&apos;s
        </button>
      </div>

      {/* Kurzbeschreibung */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <p className="text-base text-navy leading-relaxed">
          Dieser Assistent begleitet Sie Schritt fuer Schritt durch die ersten kritischen Stunden nach einem Cyber-Vorfall. Von der Erfassung ueber die Klassifikation bis zur Reaktion und Meldung. Sie koennen den Vorfall-Typ oben waehlen fuer eine spezialisierte Reaktionscheckliste.
        </p>
      </div>

      {/* Alternative Entry */}
      <p className="text-sm text-gray-500 text-center">
        Oder direkt:{' '}
        <button
          type="button"
          onClick={handleAdvance}
          className="text-navy underline font-bold"
        >
          Vorfall erfassen
        </button>
      </p>
    </div>
  )
}
