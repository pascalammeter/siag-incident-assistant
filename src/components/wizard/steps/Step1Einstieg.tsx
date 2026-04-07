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
    dispatch({ type: 'UPDATE_STEP', stepKey: 'klassifikation', data: { incidentType: type } })
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-navy">Sicherheitsvorfall?</h2>
        <p className="text-base text-gray-600 text-center max-w-xl mx-auto">
          Wenn ein Sicherheitsvorfall erkannt wird, fuehrt Sie dieses Modul durch die Erstreaktion.
        </p>
      </div>

      {/* Incident Type Selection */}
      <div className="bg-lightgray rounded-lg p-6">
        <p className="text-sm font-bold text-navy mb-4">Vorfall-Typ (optional zur schnellen Navigation):</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INCIDENT_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTypeSelect(option.value)}
              className={
                selectedType === option.value
                  ? 'bg-navy text-white px-4 py-3 rounded-lg font-bold min-h-[44px] text-sm'
                  : 'bg-white border border-gray-300 text-navy px-4 py-3 rounded-lg font-normal min-h-[44px] text-sm hover:border-navy transition-colors'
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
