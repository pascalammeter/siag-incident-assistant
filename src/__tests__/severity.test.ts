import { describe, it, expect } from 'vitest'
import { calculateSeverity } from '@/lib/wizard-schemas'

describe('calculateSeverity', () => {
  describe('KRITISCH', () => {
    it('returns KRITISCH when Q1=ja (critical systems affected)', () => {
      expect(calculateSeverity('ja', 'nein', 'nein')).toBe('KRITISCH')
    })

    it('returns KRITISCH when Q3=ja (attacker active)', () => {
      expect(calculateSeverity('nein', 'nein', 'ja')).toBe('KRITISCH')
    })

    it('returns KRITISCH when Q3=unbekannt (worst-case assumption per D-01)', () => {
      expect(calculateSeverity('nein', 'nein', 'unbekannt')).toBe('KRITISCH')
    })

    it('returns KRITISCH when all answers are ja', () => {
      expect(calculateSeverity('ja', 'ja', 'ja')).toBe('KRITISCH')
    })

    it('returns KRITISCH when Q1=ja even if Q2=ja (Q1 takes precedence)', () => {
      expect(calculateSeverity('ja', 'ja', 'nein')).toBe('KRITISCH')
    })
  })

  describe('HOCH', () => {
    it('returns HOCH when only Q2=ja (personal data affected)', () => {
      expect(calculateSeverity('nein', 'ja', 'nein')).toBe('HOCH')
    })
  })

  describe('MITTEL', () => {
    it('returns MITTEL when all answers are nein', () => {
      expect(calculateSeverity('nein', 'nein', 'nein')).toBe('MITTEL')
    })
  })
})
