'use client'

import { useWizard } from '../WizardContext'
import { StepNavigator } from '../StepNavigator'
import { RANSOMWARE_PLAYBOOK } from '@/lib/playbook-data'
import type { ReaktionData } from '@/lib/wizard-types'

function Step4Content() {
  const { state, dispatch } = useWizard()
  const completedSteps: string[] = (state.reaktion as ReaktionData)?.completedSteps ?? []
  const totalSteps = RANSOMWARE_PLAYBOOK.phases.reduce((sum, p) => sum + p.steps.length, 0)
  const completedCount = completedSteps.length
  const percent = Math.round((completedCount / totalSteps) * 100)

  const toggleStep = (stepId: string) => {
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId]
    dispatch({ type: 'UPDATE_STEP', stepKey: 'reaktion', data: { completedSteps: next } })
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-navy">Reaktionsschritte</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        Arbeiten Sie die Ransomware-Checkliste Schritt fuer Schritt ab. Alle 25 Punkte muessen bestaetigt werden.
      </p>

      {/* Progress counter */}
      <div className="bg-lightgray rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-bold text-navy">{completedCount} von 25 erledigt</span>
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Phase groups */}
      <div className="space-y-8">
        {RANSOMWARE_PLAYBOOK.phases.map((phase) => (
          <div key={phase.id} className="space-y-3">
            <h3 className="text-lg font-bold text-navy">{phase.title}</h3>
            {phase.steps.map((step) => {
              const isChecked = completedSteps.includes(step.id)

              if (step.noGoWarning) {
                return (
                  <div key={step.id} className="space-y-0">
                    <label className="flex items-start gap-3 p-4 bg-lightgray rounded-t-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStep(step.id)}
                        className="w-5 h-5 accent-navy mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-navy">{step.text}</span>
                        <span className="inline-block ml-2 text-xs font-bold bg-navy/10 text-navy px-2 py-0.5 rounded-full">
                          {step.role}
                        </span>
                      </div>
                    </label>
                    <div className="border-l-4 border-amber bg-amber/10 rounded-br-lg p-4">
                      <p className="text-sm font-normal text-navy">
                        <span className="mr-2">&#9888;</span>
                        {step.noGoWarning}
                      </p>
                    </div>
                  </div>
                )
              }

              return (
                <label
                  key={step.id}
                  className="flex items-start gap-3 p-4 bg-lightgray rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStep(step.id)}
                    className="w-5 h-5 accent-navy mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-navy">{step.text}</span>
                    <span className="inline-block ml-2 text-xs font-bold bg-navy/10 text-navy px-2 py-0.5 rounded-full">
                      {step.role}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => dispatch({ type: 'NEXT_STEP' })}
        onPrev={() => dispatch({ type: 'PREV_STEP' })}
        isNextDisabled={completedCount < totalSteps}
      />
    </>
  )
}

export function Step4Reaktion() {
  return (
    <div className="space-y-6">
      <Step4Content />
    </div>
  )
}
