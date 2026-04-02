'use client'

import { StepForm } from '../StepForm'
import { klassifikationSchema } from '@/lib/wizard-schemas'

export function Step3Klassifikation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Klassifikation</h2>
      <p className="text-gray-600">Bestimmen Sie den Schweregrad des Vorfalls.</p>
      <StepForm stepKey="klassifikation" schema={klassifikationSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 3 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
