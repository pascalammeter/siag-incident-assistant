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

      {/* Phase tables */}
      <div className="space-y-6">
        {RANSOMWARE_PLAYBOOK.phases.map((phase) => (
          <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-navy px-4 py-2">
              <h3 className="text-sm font-bold text-white">{phase.title}</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {phase.steps.map((step, idx) => {
                  const isChecked = completedSteps.includes(step.id)
                  return (
                    <>
                      <tr
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${isChecked ? 'bg-green-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                      >
                        <td className="w-10 px-3 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleStep(step.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 accent-navy"
                          />
                        </td>
                        <td className="px-3 py-3 text-navy leading-snug">{step.text}</td>
                        <td className="w-24 px-3 py-3 text-right align-middle">
                          <span className="text-xs font-bold bg-navy/10 text-navy px-2 py-1 rounded-full whitespace-nowrap">
                            {step.role}
                          </span>
                        </td>
                      </tr>
                      {step.noGoWarning && (
                        <tr key={`${step.id}-warn`} className="border-b border-amber/30">
                          <td className="bg-amber/10 px-3 py-2 align-top">
                            <span className="text-amber">&#9888;</span>
                          </td>
                          <td colSpan={2} className="bg-amber/10 px-3 py-2 text-sm text-navy italic">
                            {step.noGoWarning}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
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
