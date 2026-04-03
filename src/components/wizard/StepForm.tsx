'use client'

import { useForm, type FieldValues, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodObject, ZodRawShape } from 'zod'
import { useWizard } from './WizardContext'
import type { StepKey } from '@/lib/wizard-types'
import { StepNavigator } from './StepNavigator'

interface StepFormProps<T extends FieldValues> {
  stepKey: StepKey
  schema: ZodObject<ZodRawShape>
  children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode
  showPrev?: boolean
  showNext?: boolean
  onPrev?: () => void
  nextLabel?: string
}

export function StepForm<T extends FieldValues>({
  stepKey,
  schema,
  children,
  showPrev,
  showNext,
  onPrev,
  nextLabel,
}: StepFormProps<T>) {
  const { state, dispatch } = useWizard()

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: (state[stepKey] as DefaultValues<T>) ?? ({} as DefaultValues<T>),
  })

  const onSubmit = form.handleSubmit((data) => {
    dispatch({ type: 'UPDATE_STEP', stepKey, data })
    dispatch({ type: 'NEXT_STEP' })
  })

  const handlePrev = onPrev ?? (() => dispatch({ type: 'PREV_STEP' }))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children(form)}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => {}}
        onPrev={handlePrev}
        showPrev={showPrev ?? true}
        showNext={showNext ?? true}
        nextButtonType="submit"
        nextLabel={nextLabel}
      />
    </form>
  )
}
