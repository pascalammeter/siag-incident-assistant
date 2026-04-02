'use client'

import { StepForm } from '../StepForm'
import { reaktionSchema } from '@/lib/wizard-schemas'

export function Step4Reaktion() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-siag-navy">Reaktionsschritte</h2>
      <p className="text-gray-600">Definieren Sie die naechsten Reaktionsschritte.</p>
      <StepForm stepKey="reaktion" schema={reaktionSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 4 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
