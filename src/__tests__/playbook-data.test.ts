import { describe, it, expect } from 'vitest'
import {
  RANSOMWARE_PLAYBOOK,
  PLAYBOOKS,
  type PlaybookStep,
  type PlaybookPhase,
  type Playbook,
} from '@/lib/playbook-data'

describe('playbook-data', () => {
  it('RANSOMWARE_PLAYBOOK has exactly 4 phases', () => {
    expect(RANSOMWARE_PLAYBOOK.phases).toHaveLength(4)
  })

  it('total steps across all phases === 25', () => {
    const total = RANSOMWARE_PLAYBOOK.phases.reduce(
      (sum, phase) => sum + phase.steps.length,
      0
    )
    expect(total).toBe(25)
  })

  it('every step has id, text, and valid role', () => {
    const validRoles = ['IT-Leiter', 'CISO', 'CEO', 'Forensik']
    for (const phase of RANSOMWARE_PLAYBOOK.phases) {
      for (const step of phase.steps) {
        expect(step.id).toBeTruthy()
        expect(typeof step.id).toBe('string')
        expect(step.text).toBeTruthy()
        expect(typeof step.text).toBe('string')
        expect(validRoles).toContain(step.role)
      }
    }
  })

  it('at least 3 steps have a non-empty noGoWarning', () => {
    const noGoSteps = RANSOMWARE_PLAYBOOK.phases.flatMap((p) =>
      p.steps.filter((s) => s.noGoWarning && s.noGoWarning.length > 0)
    )
    expect(noGoSteps.length).toBeGreaterThanOrEqual(3)
  })

  it('PLAYBOOKS["ransomware"] === RANSOMWARE_PLAYBOOK', () => {
    expect(PLAYBOOKS['ransomware']).toBe(RANSOMWARE_PLAYBOOK)
  })

  it('each phase.id is unique', () => {
    const ids = RANSOMWARE_PLAYBOOK.phases.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each step.id is unique across all phases', () => {
    const ids = RANSOMWARE_PLAYBOOK.phases.flatMap((p) =>
      p.steps.map((s) => s.id)
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('step IDs follow {phase.id}-{nn} pattern', () => {
    for (const phase of RANSOMWARE_PLAYBOOK.phases) {
      for (const step of phase.steps) {
        expect(step.id).toMatch(new RegExp(`^${phase.id}-\\d{2}$`))
      }
    }
  })

  it('incidentType is "ransomware"', () => {
    expect(RANSOMWARE_PLAYBOOK.incidentType).toBe('ransomware')
  })
})
