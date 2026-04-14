/**
 * Playbook Tests
 * Tests for playbook structure, validation, and integration
 */

import { describe, it, expect } from 'vitest';
import { PHISHING_PLAYBOOK } from '@/data/playbooks/phishing';
import { getPlaybook, hasPlaybook } from '@/data/playbooks';
import type { PlaybookStep, PlaybookPhase } from '@/types/playbook';

describe('Playbook Structure', () => {
  describe('Phishing Playbook', () => {
    it('should have 4 phases: detection, containment, investigation, communication', () => {
      expect(PHISHING_PLAYBOOK.phases).toHaveLength(4);
      const phaseIds = PHISHING_PLAYBOOK.phases.map((p) => p.id);
      expect(phaseIds).toEqual([
        'detection',
        'containment',
        'investigation',
        'communication',
      ]);
    });

    it('should have 25 total steps across all phases', () => {
      const totalSteps = PHISHING_PLAYBOOK.phases.reduce((sum, p) => sum + p.steps.length, 0);
      expect(totalSteps).toBe(25);
    });

    it('should have 7 detection steps', () => {
      const detection = PHISHING_PLAYBOOK.phases.find((p) => p.id === 'detection');
      expect(detection?.steps).toHaveLength(7);
    });

    it('should have 7 containment steps', () => {
      const containment = PHISHING_PLAYBOOK.phases.find((p) => p.id === 'containment');
      expect(containment?.steps).toHaveLength(7);
    });

    it('should have 7 investigation steps', () => {
      const investigation = PHISHING_PLAYBOOK.phases.find((p) => p.id === 'investigation');
      expect(investigation?.steps).toHaveLength(7);
    });

    it('should have 4 communication steps', () => {
      const communication = PHISHING_PLAYBOOK.phases.find((p) => p.id === 'communication');
      expect(communication?.steps).toHaveLength(4);
    });

    it('should have correct metadata', () => {
      expect(PHISHING_PLAYBOOK.incidentType).toBe('phishing');
    });
  });
});

describe('PlaybookStep Fields', () => {
  it('all steps should have required fields', () => {
    PHISHING_PLAYBOOK.phases.forEach((phase: PlaybookPhase) => {
      phase.steps.forEach((step: PlaybookStep) => {
        expect(step.id).toBeDefined();
        expect(typeof step.id).toBe('string');
        expect(step.id.length).toBeGreaterThan(0);

        expect(step.text).toBeDefined();
        expect(typeof step.text).toBe('string');
        expect(step.text.length).toBeGreaterThan(0);

        expect(step.role).toBeDefined();
        expect(['IT-Leiter', 'CISO', 'CEO', 'Forensik', 'HR', 'Legal']).toContain(
          step.role
        );
      });
    });
  });

  it('steps may have optional warning field', () => {
    // Find steps with warnings
    const stepsWithWarnings = PHISHING_PLAYBOOK.phases.flatMap((p) =>
      p.steps.filter((s) => s.noGoWarning)
    );
    // It's okay if there are none, but if any exist they should be strings
    stepsWithWarnings.forEach((step) => {
      if (step.noGoWarning) {
        expect(typeof step.noGoWarning).toBe('string');
        expect(step.noGoWarning.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Phase Structure', () => {
  it('all phases should have required fields', () => {
    PHISHING_PLAYBOOK.phases.forEach((phase: PlaybookPhase) => {
      expect(phase.id).toBeDefined();
      expect(typeof phase.id).toBe('string');

      expect(phase.title).toBeDefined();
      expect(typeof phase.title).toBe('string');
      expect(phase.title.length).toBeGreaterThan(0);

      expect(phase.steps).toBeDefined();
      expect(Array.isArray(phase.steps)).toBe(true);
      expect(phase.steps.length).toBeGreaterThan(0);
    });
  });
});

describe('Playbook Registry', () => {
  it('should provide getPlaybook function', () => {
    expect(typeof getPlaybook).toBe('function');
  });

  it('should retrieve Phishing playbook by type', () => {
    const playbook = getPlaybook('phishing');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('phishing');
    const totalSteps = playbook?.phases.reduce((sum, p) => sum + p.steps.length, 0) || 0;
    expect(totalSteps).toBe(25);
  });

  it('should retrieve Ransomware playbook by type', () => {
    const playbook = getPlaybook('ransomware');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('ransomware');
  });

  it('should retrieve DDoS playbook by type', () => {
    const playbook = getPlaybook('ddos');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('ddos');
  });

  it('should retrieve Data Loss playbook by type (data_loss)', () => {
    const playbook = getPlaybook('data_loss');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('datenverlust');
  });

  it('should retrieve Data Loss playbook by legacy type (datenverlust)', () => {
    const playbook = getPlaybook('datenverlust');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('datenverlust');
  });

  it('should return Ransomware playbook as default for unknown types', () => {
    const playbook = getPlaybook('unknown_type');
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe('ransomware');
  });

  it('should provide hasPlaybook function', () => {
    expect(typeof hasPlaybook).toBe('function');
    expect(hasPlaybook('phishing')).toBe(true);
    expect(hasPlaybook('ransomware')).toBe(true);
    expect(hasPlaybook('ddos')).toBe(true);
    expect(hasPlaybook('data_loss')).toBe(true);
    expect(hasPlaybook('datenverlust')).toBe(true);
  });
});

describe('Step Type Selection Integration', () => {
  it('Phishing playbook should be selectable as incident type', () => {
    const playbookType = 'phishing';
    const playbook = getPlaybook(playbookType);
    expect(playbook).toBeDefined();
    expect(playbook?.incidentType).toBe(playbookType);
  });

  it('playbook should load correctly when incident_type selected', () => {
    const selectedType = 'phishing';
    const playbook = getPlaybook(selectedType);

    // Step 4 should display this playbook
    expect(playbook).toBeDefined();
    expect(playbook?.phases).toHaveLength(4);
    const totalSteps = playbook?.phases.reduce((sum, p) => sum + p.steps.length, 0) || 0;
    expect(totalSteps).toBe(25);
  });

  it('playbook phases should be in correct order', () => {
    const phaseIds = PHISHING_PLAYBOOK.phases.map((p) => p.id);
    expect(phaseIds[0]).toBe('detection');
    expect(phaseIds[1]).toBe('containment');
    expect(phaseIds[2]).toBe('investigation');
    expect(phaseIds[3]).toBe('communication');
  });
});
