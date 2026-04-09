'use client'

import { useMemo } from 'react'
import { useWizard } from '../WizardContext'
import { StepNavigator } from '../StepNavigator'
import { RANSOMWARE_PLAYBOOK, getPlaybook } from '@/lib/playbook-data'
import type { ReaktionData, KlassifikationData } from '@/lib/wizard-types'

function Step4Content() {
  const { state, dispatch } = useWizard()
  const completedSteps: string[] = (state.reaktion as ReaktionData)?.completedSteps ?? []
  const selectedIncidentType = (state.klassifikation as Partial<KlassifikationData>)?.incidentType

  // Determine which playbook to use based on selected incident type
  const displayedPlaybook = useMemo(() => {
    if (selectedIncidentType && selectedIncidentType !== 'sonstiges') {
      try {
        return getPlaybook(selectedIncidentType)
      } catch {
        return RANSOMWARE_PLAYBOOK
      }
    }
    return RANSOMWARE_PLAYBOOK
  }, [selectedIncidentType])

  // Calculate total steps based on playbook structure (phases with steps)
  const totalSteps = useMemo(() => {
    return (displayedPlaybook as any).phases?.reduce((sum: number, p: any) => sum + p.steps.length, 0) || 0
  }, [displayedPlaybook])

  const completedCount = completedSteps.length
  const percent = Math.round((completedCount / totalSteps) * 100)

  const toggleStep = (stepId: string | number) => {
    const stepIdStr = String(stepId)
    const next = completedSteps.includes(stepIdStr)
      ? completedSteps.filter(id => id !== stepIdStr)
      : [...completedSteps, stepIdStr]
    dispatch({ type: 'UPDATE_STEP', stepKey: 'reaktion', data: { completedSteps: next } })
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-navy dark:text-white">Reaktionsschritte</h2>
      <p className="text-base text-gray-600 dark:text-slate-300 leading-relaxed">
        Arbeiten Sie die Checkliste Schritt fuer Schritt ab. Alle {totalSteps} Punkte muessen bestaetigt werden.
      </p>

      {/* Progress counter */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-bold text-navy dark:text-white">
          {completedCount} von {totalSteps} erledigt
        </span>
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Playbook phases with steps */}
        <div className="space-y-6">
          {(displayedPlaybook as any).phases?.map((phase: any) => (
            <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-navy px-4 py-2">
                <h3 className="text-sm font-bold text-white">{phase.title}</h3>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {phase.steps.map((step: any, idx: number) => {
                    const isChecked = completedSteps.includes(step.id)
                    return (
                      <>
                        <tr
                          key={step.id}
                          onClick={() => toggleStep(step.id)}
                          className={`border-b border-gray-100 dark:border-slate-700 last:border-0 cursor-pointer transition-colors ${isChecked ? 'bg-green-50 dark:bg-green-900/20' : idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'} hover:bg-blue-50 dark:hover:bg-slate-700`}
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
                          <td className="px-3 py-3 text-navy dark:text-slate-200 leading-snug">{step.text}</td>
                          <td className="w-24 px-3 py-3 text-right align-middle">
                            <span className="text-xs font-bold bg-navy/10 dark:bg-white/10 text-navy dark:text-slate-200 px-2 py-1 rounded-full whitespace-nowrap">
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
