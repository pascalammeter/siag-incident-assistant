'use client'

import { useEffect, useState } from 'react'
import { useForm, type FieldValues, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodObject, ZodRawShape } from 'zod'
import { useWizard } from './WizardContext'
import type { StepKey } from '@/lib/wizard-types'
import { StepNavigator } from './StepNavigator'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: (state[stepKey] as DefaultValues<T>) ?? ({} as DefaultValues<T>),
  })

  // Auto-save form values to context on every change so a page reload restores them
  useEffect(() => {
    const subscription = form.watch((values) => {
      dispatch({ type: 'UPDATE_STEP', stepKey, data: values as T })
    })
    return () => subscription.unsubscribe()
  }, [form, stepKey, dispatch])

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      dispatch({ type: 'UPDATE_STEP', stepKey, data })
      dispatch({ type: 'NEXT_STEP' })
    } finally {
      setIsSubmitting(false)
    }
  })

  const handlePrev = onPrev ?? (() => dispatch({ type: 'PREV_STEP' }))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSubmitting && (
        <div className="flex justify-center items-center py-4">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">Saving...</span>
        </div>
      )}
      {children(form)}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => {}}
        onPrev={handlePrev}
        showPrev={showPrev ?? true}
        showNext={showNext ?? true}
        nextButtonType="submit"
        nextLabel={nextLabel}
        isNextDisabled={isSubmitting}
      />
    </form>
  )
}
