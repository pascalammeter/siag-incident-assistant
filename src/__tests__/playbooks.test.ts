/**
 * Playbook Tests
 * Tests for playbook structure, validation, and integration
 */

import { describe, it, expect } from 'vitest';
import { PHISHING_PLAYBOOK } from '@/data/playbooks/phishing';
import { getPlaybook, hasPlaybook, getAllPlaybooks } from '@/data/playbooks';
import type { PlaybookStep } from '@/types/playbook';

describe('Playbook Structure', () => {
  describe('Phishing Playbook', () => {
    it('should have 25 steps total', () => {
      expect(PHISHING_PLAYBOOK.steps).toHaveLength(25);
    });

    it('should have 4 sections: detection, containment, investigation, communication', () => {
      const sectionNames = PHISHING_PLAYBOOK.sections.map((s) => s.name);
      expect(sectionNames).toEqual([
        'detection',
        'containment',
        'investigation',
        'communication',
      ]);
    });

    it('should have 7 detection steps', () => {
      const detectionSteps = PHISHING_PLAYBOOK.steps.filter(
        (s) => s.section === 'detection'
      );
      expect(detectionSteps).toHaveLength(7);
    });

    it('should have 7 containment steps', () => {
      const containmentSteps = PHISHING_PLAYBOOK.steps.filter(
        (s) => s.section === 'containment'
      );
      expect(containmentSteps).toHaveLength(7);
    });

    it('should have 7 investigation steps', () => {
      const investigationSteps = PHISHING_PLAYBOOK.steps.filter(
        (s) => s.section === 'investigation'
      );
      expect(investigationSteps).toHaveLength(7);
    });

    it('should have 4 communication steps', () => {
      const communicationSteps = PHISHING_PLAYBOOK.steps.filter(
        (s) => s.section === 'communication'
      );
      expect(communicationSteps).toHaveLength(4);
    });

    it('should have steps numbered 1-25 sequentially', () => {
      const numbers = PHISHING_PLAYBOOK.steps.map((s) => s.number);
      const expected = Array.from({ length: 25 }, (_, i) => i + 1);
      expect(numbers).toEqual(expected);
    });

    it('should have correct metadata', () => {
      expect(PHISHING_PLAYBOOK.type).toBe('phishing');
      expect(PHISHING_PLAYBOOK.title).toContain('Phishing');
      expect(PHISHING_PLAYBOOK.description).toBeTruthy();
      expect(PHISHING_PLAYBOOK.estimatedDuration).toBeTruthy();
    });
  });
});

describe('PlaybookStep Fields', () => {
  it('all steps should have required fields', () => {
    PHISHING_PLAYBOOK.steps.forEach((step: PlaybookStep) => {
      expect(step.number).toBeDefined();
      expect(typeof step.number).toBe('number');
      expect(step.section).toBeDefined();
      expect(['detection', 'containment', 'investigation', 'communication']).toContain(
        step.section
      );
      expect(step.title).toBeDefined();
      expect(typeof step.title).toBe('string');
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.action).toBeDefined();
      expect(typeof step.action).toBe('string');
      expect(step.action.length).toBeGreaterThan(0);
      expect(step.responsible).toBeDefined();
      expect([
        'IT-Leiter',
        'CISO',
        'CEO',
        'Forensik',
        'HR',
        'Legal',
      ]).toContain(step.responsible);
      expect(step.timeframe).toBeDefined();
      expect(typeof step.timeframe).toBe('string');
      expect(step.timeframe.length).toBeGreaterThan(0);
    });
  });

  it('all steps should have valid dependencies if specified', () => {
    PHISHING_PLAYBOOK.steps.forEach((step: PlaybookStep) => {
      if (step.dependencies) {
        expect(Array.isArray(step.dependencies)).toBe(true);
        step.dependencies.forEach((depNum) => {
          expect(typeof depNum).toBe('number');
          expect(depNum).toBeGreaterThanOrEqual(1);
          expect(depNum).toBeLessThanOrEqual(25);
          // Dependency must not be self-referential
          expect(depNum).not.toBe(step.number);
        });
      }
    });
  });
});

describe('Playbook Dependencies', () => {
  it('should not have circular dependencies', () => {
    const visited = new Set<number>();
    const visiting = new Set<number>();

    function hasCycle(stepNum: number): boolean {
      if (visiting.has(stepNum)) return true;
      if (visited.has(stepNum)) return false;

      visiting.add(stepNum);
      const step = PHISHING_PLAYBOOK.steps.find((s) => s.number === stepNum);

      if (step?.dependencies) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      visiting.delete(stepNum);
      visited.add(stepNum);
      return false;
    }

    PHISHING_PLAYBOOK.steps.forEach((step) => {
      visited.clear();
      visiting.clear();
      expect(hasCycle(step.number)).toBe(false);
    });
  });

  it('all dependencies should reference existing steps', () => {
    const stepNumbers = new Set(PHISHING_PLAYBOOK.steps.map((s) => s.number));

    PHISHING_PLAYBOOK.steps.forEach((step) => {
      if (step.dependencies) {
        step.dependencies.forEach((depNum) => {
          expect(stepNumbers.has(depNum)).toBe(true);
        });
      }
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
    expect(playbook?.type).toBe('phishing');
    expect(playbook?.steps).toHaveLength(25);
  });

  it('should return undefined for unknown playbook type', () => {
    const playbook = getPlaybook('unknown_type');
    expect(playbook).toBeUndefined();
  });

  it('should provide hasPlaybook function', () => {
    expect(typeof hasPlaybook).toBe('function');
    expect(hasPlaybook('phishing')).toBe(true);
    expect(hasPlaybook('unknown')).toBe(false);
  });

  it('should provide getAllPlaybooks function', () => {
    expect(typeof getAllPlaybooks).toBe('function');
    const playbooks = getAllPlaybooks();
    expect(Array.isArray(playbooks)).toBe(true);
    expect(playbooks.length).toBeGreaterThan(0);
    expect(playbooks.some((p) => p.type === 'phishing')).toBe(true);
  });
});

describe('Playbook Sections', () => {
  it('sections should match steps', () => {
    const stepsInSections = PHISHING_PLAYBOOK.sections.flatMap((s) =>
      s.steps.map((st) => st.number)
    );
    const stepsInMain = PHISHING_PLAYBOOK.steps.map((s) => s.number);

    // Both should contain same step numbers
    expect(new Set(stepsInSections)).toEqual(new Set(stepsInMain));
  });

  it('each section should have correct number of steps', () => {
    const detection = PHISHING_PLAYBOOK.sections.find((s) => s.name === 'detection');
    expect(detection?.steps).toHaveLength(7);

    const containment = PHISHING_PLAYBOOK.sections.find((s) => s.name === 'containment');
    expect(containment?.steps).toHaveLength(7);

    const investigation = PHISHING_PLAYBOOK.sections.find(
      (s) => s.name === 'investigation'
    );
    expect(investigation?.steps).toHaveLength(7);

    const communication = PHISHING_PLAYBOOK.sections.find(
      (s) => s.name === 'communication'
    );
    expect(communication?.steps).toHaveLength(4);
  });

  it('sections should have metadata', () => {
    PHISHING_PLAYBOOK.sections.forEach((section) => {
      expect(section.name).toBeDefined();
      expect(section.title).toBeDefined();
      expect(section.color).toBeDefined();
      expect(typeof section.title).toBe('string');
      expect(section.title.length).toBeGreaterThan(0);
    });
  });
});

describe('Step Type Selection Integration', () => {
  it('Phishing playbook should be selectable as incident type', () => {
    // Verify that 'phishing' is in the incident type options
    const playbookType = 'phishing';
    const playbook = getPlaybook(playbookType);
    expect(playbook).toBeDefined();
    expect(playbook?.type).toBe(playbookType);
  });

  it('playbook should load correctly when incident_type selected', () => {
    // Simulate Step 1 selecting 'phishing' type
    const selectedType = 'phishing';
    const playbook = getPlaybook(selectedType);

    // Step 4 should display this playbook
    expect(playbook).toBeDefined();
    expect(playbook?.steps).toHaveLength(25);
    expect(playbook?.sections).toHaveLength(4);
  });
});
