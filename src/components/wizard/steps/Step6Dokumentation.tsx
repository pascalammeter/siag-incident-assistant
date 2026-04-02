'use client'

import { StepForm } from '../StepForm'
import { dokumentationSchema } from '@/lib/wizard-schemas'

export function Step6Dokumentation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-siag-navy">Dokumentation</h2>
      <p className="text-gray-600">Dokumentieren Sie den Vorfall und die getroffenen Massnahmen.</p>
      <StepForm stepKey="dokumentation" schema={dokumentationSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 5 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
