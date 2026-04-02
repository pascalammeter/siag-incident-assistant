'use client'

import { MAX_STEP } from '@/lib/wizard-types'

interface StepNavigatorProps {
  currentStep: number
  onNext: () => void
  onPrev: () => void
  isNextDisabled?: boolean
  nextLabel?: string
  prevLabel?: string
  showPrev?: boolean
}

export function StepNavigator({
  currentStep,
  onNext,
  onPrev,
  isNextDisabled = false,
  nextLabel,
  prevLabel = 'Zurück',
  showPrev = true,
}: StepNavigatorProps) {
  const resolvedNextLabel = nextLabel ?? (currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter')

  return (
    <div className="flex justify-between items-center pt-6">
      {showPrev && currentStep > 0 ? (
        <button
          type="button"
          onClick={onPrev}
          className="bg-white border border-navy text-navy px-6 py-3 rounded-lg font-medium min-h-[44px] hover:bg-lightgray transition-colors"
        >
          {prevLabel}
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        className={`bg-navy text-white px-6 py-3 rounded-lg font-medium min-h-[44px] transition-colors ${
          isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navy-light'
        }`}
      >
        {resolvedNextLabel}
      </button>
    </div>
  )
}
