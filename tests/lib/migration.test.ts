/**
 * Tests for migration.ts
 * Schema transformation and validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  mapIncidentType,
  mapSeverity,
  mapYesNoToInt,
  mapIncidentState,
  migrateIncidents,
  LegacyWizardState,
  LegacyKlassifikationData,
  LegacyErfassenData,
  LegacyReaktionData,
} from '../../src/lib/migration';

describe('migration.ts', () => {
  // ========== mapIncidentType Tests ==========
  describe('mapIncidentType', () => {
    it('should map ransomware -> ransomware', () => {
      expect(mapIncidentType('ransomware')).toBe('ransomware');
    });

    it('should map phishing -> phishing', () => {
      expect(mapIncidentType('phishing')).toBe('phishing');
    });

    it('should map ddos -> ddos', () => {
      expect(mapIncidentType('ddos')).toBe('ddos');
    });

    it('should map datenverlust -> data_loss', () => {
      expect(mapIncidentType('datenverlust')).toBe('data_loss');
    });

    it('should map unbefugter-zugriff -> other', () => {
      expect(mapIncidentType('unbefugter-zugriff')).toBe('other');
    });

    it('should map sonstiges -> other', () => {
      expect(mapIncidentType('sonstiges')).toBe('other');
    });

    it('should return null for undefined', () => {
      expect(mapIncidentType(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(mapIncidentType('')).toBeNull();
    });

    it('should return null for invalid type', () => {
      expect(mapIncidentType('invalid-type')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(mapIncidentType('RANSOMWARE')).toBe('ransomware');
      expect(mapIncidentType('PhIsHiNg')).toBe('phishing');
    });
  });

  // ========== mapSeverity Tests ==========
  describe('mapSeverity', () => {
    it('should map KRITISCH -> critical', () => {
      expect(mapSeverity('KRITISCH')).toBe('critical');
    });

    it('should map HOCH -> high', () => {
      expect(mapSeverity('HOCH')).toBe('high');
    });

    it('should map MITTEL -> medium', () => {
      expect(mapSeverity('MITTEL')).toBe('medium');
    });

    it('should map NIEDRIG -> low', () => {
      expect(mapSeverity('NIEDRIG')).toBe('low');
    });

    it('should also accept english names', () => {
      expect(mapSeverity('critical')).toBe('critical');
      expect(mapSeverity('high')).toBe('high');
      expect(mapSeverity('medium')).toBe('medium');
      expect(mapSeverity('low')).toBe('low');
    });

    it('should return null for undefined', () => {
      expect(mapSeverity(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(mapSeverity('')).toBeNull();
    });

    it('should return null for invalid severity', () => {
      expect(mapSeverity('UNKNOWN')).toBeNull();
    });
  });

  // ========== mapYesNoToInt Tests ==========
  describe('mapYesNoToInt', () => {
    it('should map ja -> 1', () => {
      expect(mapYesNoToInt('ja')).toBe(1);
    });

    it('should map nein -> 0', () => {
      expect(mapYesNoToInt('nein')).toBe(0);
    });

    it('should map unbekannt -> null', () => {
      expect(mapYesNoToInt('unbekannt')).toBeNull();
    });

    it('should also accept english', () => {
      expect(mapYesNoToInt('yes')).toBe(1);
      expect(mapYesNoToInt('no')).toBe(0);
      expect(mapYesNoToInt('unknown')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(mapYesNoToInt('JA')).toBe(1);
      expect(mapYesNoToInt('Nein')).toBe(0);
      expect(mapYesNoToInt('UNBEKANNT')).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(mapYesNoToInt(undefined)).toBeNull();
    });

    it('should return null for invalid value', () => {
      expect(mapYesNoToInt('maybe')).toBeNull();
    });
  });

  // ========== mapIncidentState Tests ==========
  describe('mapIncidentState', () => {
    it('should transform full v1.0 state to v1.1 incident', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'ransomware',
          severity: 'KRITISCH',
          q1SystemeBetroffen: 'ja',
          q2PdBetroffen: 'ja',
          q3AngreiferAktiv: 'nein',
        } as LegacyKlassifikationData,
        erfassen: {
          erkennungszeitpunkt: '2026-04-07T10:00:00Z',
          erkannt_durch: 'it-mitarbeiter',
          betroffene_systeme: ['server-1', 'server-2'],
          erste_auffaelligkeiten: 'Encryption of data files',
          loesegeld_meldung: true,
        } as LegacyErfassenData,
        reaktion: {
          completedSteps: ['step-1', 'step-2'],
        } as LegacyReaktionData,
      };

      const result = mapIncidentState(v1State);

      expect(result).not.toBeNull();
      expect(result?.incident_type).toBe('ransomware');
      expect(result?.severity).toBe('critical');
      expect(result?.erkennungszeitpunkt).toBe('2026-04-07T10:00:00Z');
      expect(result?.erkannt_durch).toBe('it-mitarbeiter');
      expect(result?.betroffene_systeme).toEqual(['server-1', 'server-2']);
      expect(result?.erste_erkenntnisse).toBe('Encryption of data files');
      expect(result?.q1).toBe(1);
      expect(result?.q2).toBe(1);
      expect(result?.q3).toBe(0);
      expect(result?.playbook?.checkedSteps).toHaveLength(2);
      expect(result?.metadata?.tags).toContain('v1.0-migrated');
    });

    it('should return null if incident_type is missing', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          severity: 'KRITISCH',
          q1SystemeBetroffen: 'ja',
        } as LegacyKlassifikationData,
      };

      const result = mapIncidentState(v1State);
      expect(result).toBeNull();
    });

    it('should return null if severity is missing', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'ransomware',
          q1SystemeBetroffen: 'ja',
        } as LegacyKlassifikationData,
      };

      const result = mapIncidentState(v1State);
      expect(result).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'ransomware',
          severity: 'HOCH',
        } as LegacyKlassifikationData,
      };

      const result = mapIncidentState(v1State);
      expect(result).not.toBeNull();
      expect(result?.incident_type).toBe('ransomware');
      expect(result?.severity).toBe('high');
      expect(result?.betroffene_systeme).toBeUndefined();
    });

    it('should preserve completed steps in playbook', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'phishing',
          severity: 'MITTEL',
        } as LegacyKlassifikationData,
        reaktion: {
          completedSteps: ['identify-phishing', 'notify-users', 'block-sender'],
        } as LegacyReaktionData,
      };

      const result = mapIncidentState(v1State);
      expect(result?.playbook?.checkedSteps).toHaveLength(3);
      expect(result?.playbook?.checkedSteps?.[0].stepId).toBe('identify-phishing');
      expect(result?.playbook?.checkedSteps?.[0].checked).toBe(true);
    });

    it('should map datenverlust incident type', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'datenverlust',
          severity: 'HOCH',
        } as LegacyKlassifikationData,
      };

      const result = mapIncidentState(v1State);
      expect(result?.incident_type).toBe('data_loss');
    });

    it('should map q3AngreiferAktiv unbekannt to null', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'ransomware',
          severity: 'KRITISCH',
          q3AngreiferAktiv: 'unbekannt',
        } as LegacyKlassifikationData,
      };

      const result = mapIncidentState(v1State);
      expect(result?.q3).toBeUndefined();
    });
  });

  // ========== migrateIncidents Tests ==========
  describe('migrateIncidents', () => {
    it('should return empty array if no valid incidents', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'invalid',
        } as LegacyKlassifikationData,
      };

      const result = migrateIncidents(v1State);
      expect(result).toEqual([]);
    });

    it('should return array with one incident from valid state', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'ransomware',
          severity: 'KRITISCH',
        } as LegacyKlassifikationData,
      };

      const result = migrateIncidents(v1State);
      expect(result).toHaveLength(1);
      expect(result[0].incident_type).toBe('ransomware');
    });

    it('should handle empty klassifikation object', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {} as LegacyKlassifikationData,
      };

      const result = migrateIncidents(v1State);
      expect(result).toEqual([]);
    });

    it('should handle undefined klassifikation', () => {
      const v1State: LegacyWizardState = {
        klassifikation: undefined,
      };

      const result = migrateIncidents(v1State);
      expect(result).toEqual([]);
    });

    it('should handle empty state object', () => {
      const v1State: LegacyWizardState = {};

      const result = migrateIncidents(v1State);
      expect(result).toEqual([]);
    });

    it('should return metadata with v1.0-migrated tag', () => {
      const v1State: LegacyWizardState = {
        klassifikation: {
          incidentType: 'phishing',
          severity: 'MITTEL',
        } as LegacyKlassifikationData,
      };

      const result = migrateIncidents(v1State);
      expect(result).toHaveLength(1);
      expect(result[0].metadata?.tags).toContain('v1.0-migrated');
      expect(result[0].metadata?.notes).toContain('migrated');
    });
  });
});
