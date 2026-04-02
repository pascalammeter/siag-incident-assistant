'use client'

import { WizardProvider, useWizard } from './WizardContext'
import { WizardProgress } from './WizardProgress'
import { StepNavigator } from './StepNavigator'
import { type WizardState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'
import { StepInterstitial } from './steps/StepInterstitial'
import { Step1Einstieg } from './steps/Step1Einstieg'
import { Step2Erfassen } from './steps/Step2Erfassen'
import { Step3Klassifikation } from './steps/Step3Klassifikation'
import { Step4Reaktion } from './steps/Step4Reaktion'
import { Step5Kommunikation } from './steps/Step5Kommunikation'
import { Step6Dokumentation } from './steps/Step6Dokumentation'

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

  const stepComponents: Record<number, React.ReactNode> = {
    0: <StepInterstitial />,
    1: <Step1Einstieg />,
    2: <Step2Erfassen />,
    3: <Step3Klassifikation />,
    4: <Step4Reaktion />,
    5: <Step5Kommunikation />,
    6: <Step6Dokumentation />,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <WizardProgress currentStep={state.currentStep} totalSteps={MAX_STEP} />
      <div className="min-h-[300px] py-6">
        {stepComponents[state.currentStep]}
      </div>
      {state.currentStep > 0 && (
        <StepNavigator
          currentStep={state.currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          showPrev={state.currentStep > MIN_STEP}
          nextLabel={state.currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter'}
        />
      )}
    </div>
  )
}
