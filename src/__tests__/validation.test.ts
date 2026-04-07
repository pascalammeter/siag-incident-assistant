import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { useFormValidation } from '@/hooks/useFormValidation'
import { erfassenSchema, klassifikationSchema, kommunikationSchema } from '@/lib/wizard-schemas'

describe('useFormValidation Hook', () => {
  describe('Field Validation on Blur', () => {
    it('should mark field as touched on blur', () => {
      const schema = z.object({ email: z.string().email('Invalid email') })
      const { result } = renderHook(() => useFormValidation(schema))

      const mockEvent = {
        target: { value: 'test@example.com' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('email')(mockEvent)
      })

      expect(result.current.touched['email']).toBe(true)
    })

    it('should validate field on blur with valid input', () => {
      const schema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      const mockEvent = {
        target: { value: 'John' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('name')(mockEvent)
      })

      expect(result.current.errors['name']).toBe('')
    })

    it('should show error message when field validation fails on blur', () => {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      const mockEvent = {
        target: { value: 'invalid-email' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('email')(mockEvent)
      })

      expect(result.current.errors['email']).toBeTruthy()
      expect(result.current.touched['email']).toBe(true)
    })

    it('should clear error when field is corrected and re-blurred', () => {
      const schema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      // First blur with invalid value
      const invalidEvent = {
        target: { value: 'ab' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('name')(invalidEvent)
      })

      expect(result.current.errors['name']).toBeTruthy()

      // Second blur with valid value
      const validEvent = {
        target: { value: 'abc' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('name')(validEvent)
      })

      expect(result.current.errors['name']).toBe('')
    })
  })

  describe('Validation with Custom Error Messages', () => {
    it('should display custom error message from schema', () => {
      const schema = z.object({
        description: z.string().min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      const mockEvent = {
        target: { value: 'short' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('description')(mockEvent)
      })

      expect(result.current.errors['description']).toBe(
        'Beschreibung muss mindestens 10 Zeichen lang sein'
      )
    })
  })

  describe('Form-Level Validation', () => {
    it('should validate entire form and return true on success', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      let isValid = false
      act(() => {
        isValid = result.current.validateForm({
          email: 'test@example.com',
          name: 'John',
        })
      })

      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('should validate entire form and return false on failure', () => {
      const schema = z.object({
        email: z.string().email('Invalid email'),
        name: z.string().min(1, 'Name required'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      let isValid = false
      act(() => {
        isValid = result.current.validateForm({
          email: 'invalid',
          name: '',
        })
      })

      expect(isValid).toBe(false)
      expect(result.current.errors['email']).toBeTruthy()
      expect(result.current.errors['name']).toBeTruthy()
    })

    it('should collect all field errors from schema validation', () => {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password too short'),
        age: z.number().min(18, 'Must be 18 or older'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      let isValid = false
      act(() => {
        isValid = result.current.validateForm({
          email: 'not-email',
          password: '123',
          age: 15,
        })
      })

      expect(isValid).toBe(false)
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
    })
  })

  describe('Real-world Erfassen Schema', () => {
    it('should validate erfassenSchema with valid data', () => {
      const { result } = renderHook(() => useFormValidation(erfassenSchema))

      const validData = {
        erkennungszeitpunkt: new Date().toISOString().slice(0, 16),
        erkannt_durch: 'it-mitarbeiter' as const,
        betroffene_systeme: ['server', 'workstations'],
        erste_auffaelligkeiten: 'Files are encrypted with .locked extension',
        loesegeld_meldung: true,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(validData)
      })

      expect(isValid).toBe(true)
    })

    it('should reject erfassenSchema with missing erkennungszeitpunkt', () => {
      const { result } = renderHook(() => useFormValidation(erfassenSchema))

      const invalidData = {
        erkennungszeitpunkt: '',
        erkannt_durch: 'it-mitarbeiter' as const,
        betroffene_systeme: [],
        erste_auffaelligkeiten: '',
        loesegeld_meldung: false,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(invalidData)
      })

      expect(isValid).toBe(false)
      expect(result.current.errors['erkennungszeitpunkt']).toBeTruthy()
    })

    it('should reject erfassenSchema with invalid erkennungszeitpunkt', () => {
      const { result } = renderHook(() => useFormValidation(erfassenSchema))

      const invalidData = {
        erkennungszeitpunkt: 'not-a-date',
        erkannt_durch: 'it-mitarbeiter' as const,
        betroffene_systeme: [],
        erste_auffaelligkeiten: '',
        loesegeld_meldung: false,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(invalidData)
      })

      expect(isValid).toBe(false)
      expect(result.current.errors['erkennungszeitpunkt']).toBeTruthy()
    })

    it('should reject erfassenSchema with invalid erkannt_durch', () => {
      const { result } = renderHook(() => useFormValidation(erfassenSchema))

      const invalidData = {
        erkennungszeitpunkt: new Date().toISOString().slice(0, 16),
        erkannt_durch: 'invalid-option',
        betroffene_systeme: [],
        erste_auffaelligkeiten: '',
        loesegeld_meldung: false,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(invalidData)
      })

      expect(isValid).toBe(false)
    })
  })

  describe('Real-world Klassifikation Schema', () => {
    it('should validate klassifikationSchema with valid data', () => {
      const { result } = renderHook(() => useFormValidation(klassifikationSchema))

      const validData = {
        q1SystemeBetroffen: 'ja' as const,
        q2PdBetroffen: 'nein' as const,
        q3AngreiferAktiv: 'unbekannt' as const,
        incidentType: 'ransomware' as const,
        severity: 'KRITISCH' as const,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(validData)
      })

      expect(isValid).toBe(true)
    })

    it('should validate all classification questions are answered', () => {
      const { result } = renderHook(() => useFormValidation(klassifikationSchema))

      const incompleteData = {
        q1SystemeBetroffen: 'ja' as const,
        q2PdBetroffen: undefined,
        q3AngreiferAktiv: undefined,
        incidentType: 'ddos' as const,
        severity: 'HOCH' as const,
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(incompleteData)
      })

      expect(isValid).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('should clear validation state', () => {
      const schema = z.object({ field: z.string() })
      const { result } = renderHook(() => useFormValidation(schema))

      // Set some errors and touched state
      const mockEvent = {
        target: { value: '' },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('field')(mockEvent)
      })

      expect(Object.keys(result.current.touched).length).toBeGreaterThan(0)

      // Clear validation
      act(() => {
        result.current.clearValidation()
      })

      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
    })

    it('should clear a specific field error', () => {
      const schema = z.object({
        email: z.string().email('Invalid'),
        name: z.string().min(1, 'Required'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      // Set errors on both fields
      let isValid = false
      act(() => {
        isValid = result.current.validateForm({
          email: 'invalid',
          name: '',
        })
      })

      expect(result.current.errors['email']).toBeTruthy()
      expect(result.current.errors['name']).toBeTruthy()

      // Clear only email error
      act(() => {
        result.current.clearFieldError('email')
      })

      expect(result.current.errors['email']).toBe('')
      expect(result.current.errors['name']).toBeTruthy()
    })

    it('should validate a single field independently', () => {
      const schema = z.object({
        email: z.string().email('Invalid email'),
        name: z.string().min(1),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      act(() => {
        result.current.validateField('email', 'invalid-email')
      })

      expect(result.current.errors['email']).toBeTruthy()
    })
  })

  describe('Checkbox Handling', () => {
    it('should handle checkbox blur events', () => {
      const schema = z.object({
        acceptTerms: z.boolean(),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      const mockEvent = {
        target: { checked: true },
      } as unknown as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('acceptTerms')(mockEvent)
      })

      expect(result.current.touched['acceptTerms']).toBe(true)
    })
  })

  describe('Multiple Fields Simultaneous Validation', () => {
    it('should validate multiple fields at once', () => {
      const schema = z.object({
        email: z.string().email('Invalid email'),
        phone: z.string().min(10, 'Phone too short'),
        name: z.string().min(3, 'Name too short'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      let isValid = false
      act(() => {
        isValid = result.current.validateForm({
          email: 'valid@example.com',
          phone: '1234567890',
          name: 'Jo',  // Only 2 chars, needs 3 — should fail
        })
      })

      expect(result.current.errors['email']).toBeFalsy()
      expect(result.current.errors['phone']).toBeFalsy()
      expect(result.current.errors['name']).toBeTruthy()
      expect(isValid).toBe(false)
    })
  })

  describe('Integration with Wizard Schemas', () => {
    it('should work with kommunikationSchema', () => {
      const { result } = renderHook(() => useFormValidation(kommunikationSchema))

      const validData = {
        kritischeInfrastruktur: 'ja' as const,
        personendatenBetroffen: 'nein' as const,
        reguliertesUnternehmen: 'ja' as const,
        kommChecklist: ['krisenstab', 'gl-vr'],
        templateGL: 'Template text',
        templateMitarbeitende: 'Template text',
        templateMedien: 'Template text',
      }

      let isValid = false
      act(() => {
        isValid = result.current.validateForm(validData)
      })

      expect(isValid).toBe(true)
    })
  })

  describe('Error Message Format', () => {
    it('should provide detailed error messages from schema', () => {
      const schema = z.object({
        age: z.number().min(18, 'Du musst mindestens 18 Jahre alt sein'),
      })
      const { result } = renderHook(() => useFormValidation(schema))

      let isValid = false
      act(() => {
        isValid = result.current.validateForm({ age: 16 })
      })

      expect(result.current.errors['age']).toBe('Du musst mindestens 18 Jahre alt sein')
    })
  })
})
