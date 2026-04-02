'use client'

import { StepForm } from '../StepForm'
import { kommunikationSchema } from '@/lib/wizard-schemas'

export function Step5Kommunikation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Kommunikation & Eskalation</h2>
      <p className="text-gray-600">Planen Sie die Kommunikation und Eskalation des Vorfalls.</p>
      <StepForm stepKey="kommunikation" schema={kommunikationSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 4 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
