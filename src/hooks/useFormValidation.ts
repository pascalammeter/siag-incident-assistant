'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'

interface ValidationState {
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export function useFormValidation(schema: z.ZodSchema) {
  const [state, setState] = useState<ValidationState>({
    errors: {},
    touched: {},
  })

  /**
   * Validate a single field against the schema
   */
  const validateField = useCallback(
    (fieldName: string, value: unknown) => {
      try {
        // Try to parse just this field using pick
        if (schema instanceof z.ZodObject) {
          const fieldSchema = (schema as z.ZodObject<any>).pick({ [fieldName]: true } as any)
          fieldSchema.parse({ [fieldName]: value })
          // Clear error for this field if validation passes
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [fieldName]: '' },
          }))
        }
      } catch (error) {
        if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
          const errorMessage = error.issues[0].message || 'Invalid input'
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [fieldName]: errorMessage },
          }))
        }
      }
    },
    [schema]
  )

  /**
   * Mark a field as touched and validate it
   */
  const handleBlur = useCallback(
    (fieldName: string) => {
      return (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        const value = 'checked' in target ? target.checked : target.value

        // Mark field as touched
        setState((prev) => ({
          ...prev,
          touched: { ...prev.touched, [fieldName]: true },
        }))

        // Validate the field
        validateField(fieldName, value)
      }
    },
    [validateField]
  )

  /**
   * Validate all fields in the schema against provided data
   */
  const validateForm = useCallback(
    (data: Record<string, unknown>) => {
      try {
        schema.parse(data)
        setState((prev) => ({
          ...prev,
          errors: {},
        }))
        return true
      } catch (error) {
        if (error instanceof z.ZodError && error.issues && error.issues.length > 0) {
          const newErrors: Record<string, string> = {}
          error.issues.forEach((err) => {
            const path = err.path.join('.')
            if (path) {
              newErrors[path] = err.message
            }
          })
          setState((prev) => ({
            ...prev,
            errors: newErrors,
          }))
        }
        return false
      }
    },
    [schema]
  )

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    setState({ errors: {}, touched: {} })
  }, [])

  /**
   * Clear a specific field's error
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' },
    }))
  }, [])

  return {
    errors: state.errors,
    touched: state.touched,
    handleBlur,
    validateField,
    validateForm,
    clearValidation,
    clearFieldError,
  }
}
