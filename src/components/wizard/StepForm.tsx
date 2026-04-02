'use client'

import { useForm, type FieldValues, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodObject, ZodRawShape } from 'zod'
import { useWizard } from './WizardContext'
import type { StepKey } from '@/lib/wizard-types'

interface StepFormProps<T extends FieldValues> {
  stepKey: StepKey
  schema: ZodObject<ZodRawShape>
  children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode
}

export function StepForm<T extends FieldValues>({ stepKey, schema, children }: StepFormProps<T>) {
  const { state, dispatch } = useWizard()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: (state[stepKey] as DefaultValues<T>) ?? ({} as DefaultValues<T>),
  })

  const onSubmit = form.handleSubmit((data) => {
    dispatch({ type: 'UPDATE_STEP', stepKey, data })
    dispatch({ type: 'NEXT_STEP' })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children(form)}
    </form>
  )
}
