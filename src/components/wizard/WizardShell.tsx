'use client'

import { WizardProvider, useWizard } from './WizardContext'
import { WizardProgress } from './WizardProgress'
import { StepNavigator } from './StepNavigator'
import { type WizardState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'

interface WizardShellProps {
  onComplete?: (state: WizardState) => void
}

export function WizardShell({ onComplete }: WizardShellProps) {
  return (
    <WizardProvider>
      <WizardShellInner onComplete={onComplete} />
    </WizardProvider>
  )
}

function WizardShellInner({ onComplete }: WizardShellProps) {
  const { state, dispatch } = useWizard()

  const handleNext = () => {
    if (state.currentStep === MAX_STEP && onComplete) {
      onComplete(state)
    } else {
      dispatch({ type: 'NEXT_STEP' })
    }
  }

  const handlePrev = () => dispatch({ type: 'PREV_STEP' })

  // Step routing — placeholder components will be replaced in Plans 04/05
  const stepComponents: Record<number, React.ReactNode> = {
    0: <div className="text-center text-gray-500">Placeholder: No-Go Interstitial</div>,
    1: <div className="text-center text-gray-500">Placeholder: Einstieg</div>,
    2: <div className="text-center text-gray-500">Placeholder: Erfassen</div>,
    3: <div className="text-center text-gray-500">Placeholder: Klassifikation</div>,
    4: <div className="text-center text-gray-500">Placeholder: Reaktion</div>,
    5: <div className="text-center text-gray-500">Placeholder: Kommunikation</div>,
    6: <div className="text-center text-gray-500">Placeholder: Dokumentation</div>,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <WizardProgress currentStep={state.currentStep} totalSteps={MAX_STEP} />
      <div className="min-h-[300px] py-6">
        {stepComponents[state.currentStep]}
      </div>
      <StepNavigator
        currentStep={state.currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        showPrev={state.currentStep > MIN_STEP}
        nextLabel={state.currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter'}
      />
    </div>
  )
}
