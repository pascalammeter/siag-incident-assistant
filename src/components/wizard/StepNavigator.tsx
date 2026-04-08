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
  showNext?: boolean
  nextButtonType?: 'button' | 'submit'
}

export function StepNavigator({
  currentStep,
  onNext,
  onPrev,
  isNextDisabled = false,
  nextLabel,
  prevLabel = 'Zurück',
  showPrev = true,
  showNext = true,
  nextButtonType = 'button',
}: StepNavigatorProps) {
  const resolvedNextLabel = nextLabel ?? (currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter')

  return (
    <div className="flex justify-between items-center pt-6 print:hidden">
      {showPrev && currentStep > 0 ? (
        <button
          type="button"
          onClick={onPrev}
          className="bg-white border border-navy text-navy px-6 py-3 rounded-full font-medium min-h-[44px] hover:bg-lightgray transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CC0033]"
        >
          {prevLabel}
        </button>
      ) : (
        <div />
      )}
      {showNext ? (
        <button
          type={nextButtonType}
          onClick={nextButtonType === 'submit' ? undefined : onNext}
          disabled={isNextDisabled}
          className={`bg-[#CC0033] text-white px-6 py-3 rounded-full font-medium min-h-[44px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B51D2C]'
          }`}
        >
          {resolvedNextLabel}
        </button>
      ) : (
        <div />
      )}
    </div>
  )
}
