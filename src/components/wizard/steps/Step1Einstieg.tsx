'use client'

import { StepForm } from '../StepForm'
import { einstiegSchema } from '@/lib/wizard-schemas'

export function Step1Einstieg() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Einstieg</h2>
      <p className="text-gray-600">Willkommen beim Incident-Response-Assistenten.</p>
      <StepForm stepKey="einstieg" schema={einstiegSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 3 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
