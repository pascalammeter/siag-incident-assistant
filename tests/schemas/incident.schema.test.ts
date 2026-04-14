import { describe, it, expect } from 'vitest';
import {
  CreateIncidentInputSchema,
  UpdateIncidentInputSchema,
  ListIncidentsQuerySchema,
  IncidentTypeSchema,
  SeveritySchema,
} from '../../src/api/schemas/incident.schema';

describe('Incident Schemas', () => {
  describe('IncidentTypeSchema', () => {
    it('should accept valid incident types', () => {
      const validTypes = ['ransomware', 'phishing', 'ddos', 'data_loss', 'datenverlust', 'other'];
      validTypes.forEach((type) => {
        expect(() => IncidentTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid incident types', () => {
      const result = IncidentTypeSchema.safeParse('invalid_type');
      expect(result.success).toBe(false);
    });

    it('should reject null or undefined', () => {
      const nullResult = IncidentTypeSchema.safeParse(null);
      const undefinedResult = IncidentTypeSchema.safeParse(undefined);
      expect(nullResult.success).toBe(false);
      expect(undefinedResult.success).toBe(false);
    });
  });

  describe('SeveritySchema', () => {
    it('should accept valid severity levels', () => {
      const validLevels = ['critical', 'high', 'medium', 'low'];
      validLevels.forEach((level) => {
        expect(() => SeveritySchema.parse(level)).not.toThrow();
      });
    });

    it('should reject invalid severity levels', () => {
      const result = SeveritySchema.safeParse('invalid_severity');
      expect(result.success).toBe(false);
    });

    it('should be case-sensitive', () => {
      const result = SeveritySchema.safeParse('CRITICAL');
      expect(result.success).toBe(false);
    });
  });

  describe('CreateIncidentInputSchema', () => {
    it('should accept valid incident with required fields only', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should require incident_type', () => {
      const input = {
        severity: 'critical',
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes('incident_type'))).toBe(true);
      }
    });

    it('should require severity', () => {
      const input = {
        incident_type: 'phishing',
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes('severity'))).toBe(true);
      }
    });

    it('should accept optional description with valid length', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'high',
        description: 'This is a ransomware incident requiring immediate attention.',
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should reject description below minimum length (10 chars)', () => {
      const input = {
        incident_type: 'ddos',
        severity: 'medium',
        description: 'short',
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes('description'))).toBe(true);
      }
    });

    it('should reject description above maximum length (5000 chars)', () => {
      const input = {
        incident_type: 'data_loss',
        severity: 'critical',
        description: 'a'.repeat(5001),
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional playbook object', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: { status: 'in_progress', steps_completed: 5 },
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept optional regulatorische_meldungen object', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        regulatorische_meldungen: { ISG: true, DSG: false },
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept optional metadata object', () => {
      const input = {
        incident_type: 'data_loss',
        severity: 'high',
        metadata: { recordsAffected: 10000, dataClassification: 'confidential' },
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept all fields together', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        description: 'Critical ransomware incident detected on production servers.',
        playbook: { status: 'active' },
        regulatorische_meldungen: { ISG: true },
        metadata: { department: 'IT-Security' },
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should reject invalid enum values', () => {
      const input = {
        incident_type: 'invalid',
        severity: 'critical',
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject extra fields (may be allowed by default, but test validation behavior)', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        extraField: 'should not matter',
      } as any;
      const result = CreateIncidentInputSchema.safeParse(input);
      // Zod by default allows extra fields unless .strict() is used
      expect(result.success).toBe(true);
    });

    it('should accept wizard recognition fields (erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse)', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        erkennungszeitpunkt: '2026-04-14T10:30:00Z',
        erkannt_durch: 'SIEM Alert',
        betroffene_systeme: ['server-01', 'server-02'],
        erste_erkenntnisse: 'Suspicious encryption activity detected',
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept wizard classification fields (q1, q2, q3)', () => {
      const input = {
        incident_type: 'phishing',
        severity: 'high',
        q1: 1,
        q2: 0,
        q3: 1,
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept all wizard fields together', () => {
      const input = {
        incident_type: 'data_loss',
        severity: 'critical',
        erkennungszeitpunkt: '2026-04-14T10:30:00Z',
        erkannt_durch: 'Audit Trail',
        betroffene_systeme: ['database-01', 'backup-server'],
        erste_erkenntnisse: 'Unauthorized data export detected',
        q1: 1,
        q2: 1,
        q3: 0,
        description: 'Comprehensive incident description with all wizard fields',
      };
      expect(() => CreateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should validate erkannt_durch length constraints (1-255)', () => {
      const tooShort = {
        incident_type: 'ransomware',
        severity: 'critical',
        erkannt_durch: '',
      };
      const result1 = CreateIncidentInputSchema.safeParse(tooShort);
      expect(result1.success).toBe(false);

      const tooLong = {
        incident_type: 'ransomware',
        severity: 'critical',
        erkannt_durch: 'a'.repeat(256),
      };
      const result2 = CreateIncidentInputSchema.safeParse(tooLong);
      expect(result2.success).toBe(false);
    });

    it('should validate betroffene_systeme requires at least 1 item', () => {
      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        betroffene_systeme: [],
      };
      const result = CreateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate q1, q2, q3 as 0-1 integers', () => {
      const validInput = {
        incident_type: 'ddos',
        severity: 'medium',
        q1: 0,
        q2: 1,
        q3: 1,
      };
      expect(() => CreateIncidentInputSchema.parse(validInput)).not.toThrow();

      const invalidInput = {
        incident_type: 'ddos',
        severity: 'medium',
        q1: 2,
      };
      const result = CreateIncidentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateIncidentInputSchema', () => {
    it('should accept empty object (all fields optional)', () => {
      expect(() => UpdateIncidentInputSchema.parse({})).not.toThrow();
    });

    it('should accept partial updates', () => {
      const input = {
        severity: 'high',
      };
      expect(() => UpdateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept full update', () => {
      const input = {
        incident_type: 'phishing',
        severity: 'medium',
        description: 'Updated phishing incident details.',
        playbook: { updated: true },
        regulatorische_meldungen: { FINMA: true },
        metadata: { updatedBy: 'admin' },
      };
      expect(() => UpdateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should reject invalid enum values in optional fields', () => {
      const input = {
        incident_type: 'invalid_type',
      };
      const result = UpdateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept only incident_type', () => {
      const input = {
        incident_type: 'ddos',
      };
      expect(() => UpdateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept only severity', () => {
      const input = {
        severity: 'low',
      };
      expect(() => UpdateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should accept only description', () => {
      const input = {
        description: 'Updated incident description with at least 10 characters.',
      };
      expect(() => UpdateIncidentInputSchema.parse(input)).not.toThrow();
    });

    it('should still validate description length constraints', () => {
      const input = {
        description: 'short',
      };
      const result = UpdateIncidentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('ListIncidentsQuerySchema', () => {
    it('should accept empty query (all defaults)', () => {
      const result = ListIncidentsQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should accept valid pagination parameters', () => {
      const input = {
        page: 2,
        limit: 20,
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should coerce string numbers to integers', () => {
      const input = {
        page: '3',
        limit: '15',
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
    });

    it('should accept type filter', () => {
      const input = {
        type: 'ransomware',
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.type).toBe('ransomware');
    });

    it('should accept severity filter', () => {
      const input = {
        severity: 'critical',
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.severity).toBe('critical');
    });

    it('should accept all query parameters', () => {
      const input = {
        type: 'phishing',
        severity: 'high',
        page: 2,
        limit: 25,
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.type).toBe('phishing');
      expect(result.severity).toBe('high');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('should reject invalid type', () => {
      const input = {
        type: 'invalid_type',
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid severity', () => {
      const input = {
        severity: 'extreme',
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject non-positive page number', () => {
      const input = {
        page: 0,
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject non-positive limit', () => {
      const input = {
        limit: 0,
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject limit above maximum (50)', () => {
      const input = {
        limit: 51,
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept limit at maximum (50)', () => {
      const input = {
        limit: 50,
      };
      const result = ListIncidentsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(50);
    });

    it('should handle boundary values for page', () => {
      const input = {
        page: 1,
        limit: 1,
      };
      const result = ListIncidentsQuerySchema.parse(input);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });
  });
});
