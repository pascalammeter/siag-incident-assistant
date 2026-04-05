'use client'

import { useWizard } from '../WizardContext'

export function Step1Einstieg() {
  const { dispatch } = useWizard()

  const handleAdvance = () => {
    dispatch({ type: 'NEXT_STEP' })
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
      <div className="bg-lightgray rounded-lg p-6">
        <p className="text-base text-navy leading-relaxed">
          Dieser Assistent begleitet Sie Schritt fuer Schritt durch die ersten kritischen Stunden nach einem Cyber-Vorfall. Von der Erfassung ueber die Klassifikation bis zur Reaktion und Meldung.
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
