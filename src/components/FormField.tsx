'use client'

import React from 'react'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  helperText?: string
  error?: string
  touched?: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  children?: React.ReactNode
  placeholder?: string
  disabled?: boolean
  value?: string | number | readonly string[]
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

/**
 * FormField Component
 * Wraps form inputs with consistent error display, required indicators, and helper text.
 * Displays error messages in red (#CC0033) when validation fails.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  required,
  helperText,
  error,
  touched,
  onBlur,
  children,
  placeholder,
  disabled,
  value,
  onChange,
}) => {
  const showError = Boolean(error && touched)
  // Unique IDs for aria-describedby associations
  const errorId = `${name}-error`
  const helperId = `${name}-helper`
  // Build aria-describedby: point to error when visible, helper text otherwise
  const describedBy = showError ? errorId : helperText ? helperId : undefined

  return (
    <div className="form-group">
      {/* Label with required indicator */}
      <label htmlFor={name} className="form-label">
        {label}
        {required && (
          <span className="required-indicator" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>

      {/* Custom children or default input */}
      {children ? (
        <div onBlur={onBlur as React.FocusEventHandler<HTMLDivElement>}>{children}</div>
      ) : (
        <>
          {type === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              onChange={onChange}
              aria-required={required}
              aria-invalid={showError}
              aria-describedby={describedBy}
              className={`form-input ${showError ? 'error' : ''}`}
            />
          ) : type === 'select' ? (
            <select
              id={name}
              name={name}
              onBlur={onBlur}
              disabled={disabled}
              value={value}
              onChange={onChange}
              aria-required={required}
              aria-invalid={showError}
              aria-describedby={describedBy}
              className={`form-input ${showError ? 'error' : ''}`}
            />
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              onChange={onChange}
              aria-required={required}
              aria-invalid={showError}
              aria-describedby={describedBy}
              className={`form-input ${showError ? 'error' : ''}`}
            />
          )}
        </>
      )}

      {/* Error message in red — announced by screen readers via aria-live */}
      {showError && (
        <div id={errorId} className="form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Helper text in gray (only if no error) */}
      {helperText && !showError && (
        <div id={helperId} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  )
}
