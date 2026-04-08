'use client'

import { useTheme } from 'next-themes' // used by ToastContainer
import { Toaster, toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onDismiss?: () => void
  action?: ToastAction
}

/**
 * Toast Component
 * Displays notifications with support for light/dark modes
 * Uses Sonner library for reliable, accessible toast notifications
 *
 * Features:
 * - Auto-dismisses after 4-5 seconds (configurable)
 * - Dismiss button always available
 * - Optional action button for "Retry" scenarios
 * - Supports light/dark modes via next-themes
 * - Accessible with ARIA labels
 * - Position: bottom-right (or top-right on mobile)
 */
export function Toast({ message, type, duration = 4000, onDismiss, action }: ToastProps) {
  // Theme is handled by ToastContainer (Sonner's <Toaster theme=...>); no hook needed here

  // Map toast type to Sonner method
  const toastMap = {
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
  }

  const toastFn = toastMap[type]

  toastFn(message, {
    duration,
    onDismiss: onDismiss,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })

  return null
}

/**
 * Toast Container Component
 * Renders the Sonner toaster provider in the root layout
 * Handles theme detection and positioning
 */
export function ToastContainer() {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (theme === 'system' ? resolvedTheme : theme) || 'light'

  return (
    <Toaster
      theme={currentTheme as 'light' | 'dark'}
      position="bottom-right"
      richColors
      expand
      closeButton
      gap={12}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50',
          success: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
          error: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
          warning: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
          info: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
        },
      }}
    />
  )
}

/**
 * Helper function to show a success toast
 * @param message - Toast message
 * @param action - Optional action button
 * @param duration - Duration in milliseconds (default: 4000)
 */
export function showSuccessToast(
  message: string,
  action?: ToastAction,
  duration: number = 4000
): void {
  sonnerToast.success(message, {
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })
}

/**
 * Helper function to show an error toast
 * @param message - Toast message
 * @param action - Optional action button (typically "Retry")
 * @param duration - Duration in milliseconds (default: 4000)
 */
export function showErrorToast(
  message: string,
  action?: ToastAction,
  duration: number = 4000
): void {
  sonnerToast.error(message, {
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })
}

/**
 * Helper function to show a warning toast
 * @param message - Toast message
 * @param action - Optional action button
 * @param duration - Duration in milliseconds (default: 4000)
 */
export function showWarningToast(
  message: string,
  action?: ToastAction,
  duration: number = 4000
): void {
  sonnerToast.warning(message, {
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })
}

/**
 * Helper function to show an info toast
 * @param message - Toast message
 * @param action - Optional action button
 * @param duration - Duration in milliseconds (default: 4000)
 */
export function showInfoToast(
  message: string,
  action?: ToastAction,
  duration: number = 4000
): void {
  sonnerToast.info(message, {
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  })
}
