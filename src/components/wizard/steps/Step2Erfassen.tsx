'use client'

import { StepForm } from '../StepForm'
import { erfassenSchema } from '@/lib/wizard-schemas'

export function Step2Erfassen() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Vorfall erfassen</h2>
      <p className="text-gray-600">Erfassen Sie die wichtigsten Details zum Vorfall.</p>
      <StepForm stepKey="erfassen" schema={erfassenSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 3 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
