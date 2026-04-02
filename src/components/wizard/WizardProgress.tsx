'use client'

import { STEP_LABELS } from '@/lib/wizard-types'

interface WizardProgressProps {
  currentStep: number    // 0-6
  totalSteps: number     // 6 (excludes interstitial for display)
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  return (
    <div className="w-full mb-6">
      {/* Step counter text */}
      <p className="text-sm text-gray-500 mb-2">
        {currentStep === 0 ? 'Vorbereitung' : `Schritt ${currentStep} von ${totalSteps}`}
      </p>
      {/* Progress bar */}
      <div className="w-full bg-lightgray h-2 rounded-full">
        <div
          className="bg-navy h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      {/* Step labels — hidden on mobile */}
      <div className="hidden md:flex justify-between mt-2">
        {STEP_LABELS.slice(1).map((label, i) => {
          const stepIndex = i + 1
          const isCompleted = stepIndex < currentStep
          const isCurrent = stepIndex === currentStep

          return (
            <span
              key={label}
              className={`text-xs ${
                isCurrent
                  ? 'font-bold text-navy'
                  : isCompleted
                    ? 'text-navy-light'
                    : 'text-gray-400'
              }`}
            >
              {isCompleted ? '✓ ' : ''}{label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
