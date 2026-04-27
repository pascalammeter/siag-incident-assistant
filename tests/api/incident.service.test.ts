import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IncidentService } from '../../src/api/services/incident.service';
import { prisma } from '../../src/api/config/prisma';

// Mock Prisma
vi.mock('../../src/api/config/prisma', () => ({
  prisma: {
    incident: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('IncidentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createIncident', () => {
    it('should create incident with valid input', async () => {
      const mockIncident = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date('2026-04-07'),
        updatedAt: new Date('2026-04-07'),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
      };

      const result = await IncidentService.createIncident(input);

      expect(result.id).toBe(mockIncident.id);
      expect(result.incident_type).toBe('ransomware');
      expect(result.severity).toBe('critical');
    });

    it('should call prisma.incident.create with correct data', async () => {
      const mockIncident = {
        id: 'test-id',
        incident_type: 'phishing',
        severity: 'high',
        playbook: { test: 'data' },
        regulatorische_meldungen: {},
        metadata: { custom: 'value' },
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'phishing',
        severity: 'high',
        playbook: { test: 'data' },
        metadata: { custom: 'value' },
      };

      await IncidentService.createIncident(input);

      expect(prisma.incident.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            incident_type: 'phishing',
            severity: 'high',
            playbook: { test: 'data' },
            metadata: { custom: 'value' },
          }),
        })
      );
    });

    it('should handle empty playbook and metadata', async () => {
      const mockIncident = {
        id: 'test-id',
        incident_type: 'ddos',
        severity: 'medium',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'ddos',
        severity: 'medium',
      };

      const result = await IncidentService.createIncident(input);

      expect(result.playbook).toEqual({});
      expect(result.metadata).toEqual({});
    });

    it('should return created incident with all fields', async () => {
      const mockIncident = {
        id: 'uuid-123',
        incident_type: 'data_loss',
        severity: 'critical',
        playbook: { started: true },
        regulatorische_meldungen: { ISG: true },
        metadata: { reporter: 'admin' },
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'data_loss',
        severity: 'critical',
        playbook: { started: true },
        regulatorische_meldungen: { ISG: true },
        metadata: { reporter: 'admin' },
      };

      const result = await IncidentService.createIncident(input);

      expect(result).toEqual(mockIncident);
    });

    it('should persist all 14 wizard fields from input', async () => {
      const wizardTimestamp = '2026-04-14T10:30:00Z';
      const mockIncident = {
        id: 'uuid-123',
        incident_type: 'ransomware',
        severity: 'critical',
        erkennungszeitpunkt: new Date(wizardTimestamp),
        erkannt_durch: 'Security Team',
        erste_erkenntnisse: 'Suspicious encryption activity detected',
        betroffene_systeme: ['Server-01', 'Server-02', 'FileShare-01'],
        q1: 1,
        q2: 0,
        q3: 1,
        playbook: { started: true },
        regulatorische_meldungen: { ISG_24h: true },
        metadata: { reporter: 'admin' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'ransomware',
        severity: 'critical',
        erkennungszeitpunkt: wizardTimestamp,
        erkannt_durch: 'Security Team',
        erste_erkenntnisse: 'Suspicious encryption activity detected',
        betroffene_systeme: ['Server-01', 'Server-02', 'FileShare-01'],
        q1: 1,
        q2: 0,
        q3: 1,
        playbook: { started: true },
        regulatorische_meldungen: { ISG_24h: true },
        metadata: { reporter: 'admin' },
      };

      const result = await IncidentService.createIncident(input);

      expect(prisma.incident.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            incident_type: 'ransomware',
            severity: 'critical',
            erkennungszeitpunkt: wizardTimestamp || null,
            erkannt_durch: 'Security Team',
            erste_erkenntnisse: 'Suspicious encryption activity detected',
            betroffene_systeme: ['Server-01', 'Server-02', 'FileShare-01'],
            q1: 1,
            q2: 0,
            q3: 1,
            playbook: { started: true },
            regulatorische_meldungen: { ISG_24h: true },
            metadata: { reporter: 'admin' },
          }),
        })
      );

      expect(result.erkennungszeitpunkt).toEqual(new Date(wizardTimestamp));
      expect(result.erkannt_durch).toBe('Security Team');
      expect(result.erste_erkenntnisse).toBe('Suspicious encryption activity detected');
      expect(result.betroffene_systeme).toEqual(['Server-01', 'Server-02', 'FileShare-01']);
      expect(result.q1).toBe(1);
      expect(result.q2).toBe(0);
      expect(result.q3).toBe(1);
    });

    it('should pass description field to prisma.incident.create when provided', async () => {
      const mockIncident = {
        id: 'uuid-desc',
        incident_type: 'phishing',
        severity: 'high',
        description: 'Suspicious phishing campaign targeting employees',
        betroffene_systeme: [],
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'phishing',
        severity: 'high',
        description: 'Suspicious phishing campaign targeting employees',
      };

      await IncidentService.createIncident(input);

      expect(prisma.incident.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'Suspicious phishing campaign targeting employees',
          }),
        })
      );
    });

    it('should default description to null when not provided', async () => {
      const mockIncident = {
        id: 'uuid-no-desc',
        incident_type: 'ddos',
        severity: 'medium',
        description: null,
        betroffene_systeme: [],
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'ddos',
        severity: 'medium',
      };

      await IncidentService.createIncident(input);

      expect(prisma.incident.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: null,
          }),
        })
      );
    });

    it('should not hardcode betroffene_systeme as empty array', async () => {
      const mockIncident = {
        id: 'uuid-123',
        incident_type: 'phishing',
        severity: 'high',
        betroffene_systeme: ['Email-Server', 'AD'],
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(prisma.incident.create).mockResolvedValue(mockIncident);

      const input = {
        incident_type: 'phishing',
        severity: 'high',
        betroffene_systeme: ['Email-Server', 'AD'],
      };

      const result = await IncidentService.createIncident(input);

      expect(prisma.incident.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            betroffene_systeme: ['Email-Server', 'AD'],
          }),
        })
      );

      expect(result.betroffene_systeme).toEqual(['Email-Server', 'AD']);
    });
  });

  describe('getIncidentById', () => {
    it('should retrieve incident by ID', async () => {
      const mockIncident = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.findFirst).mockResolvedValue(mockIncident);

      const result = await IncidentService.getIncidentById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockIncident);
    });

    it('should return null if incident not found', async () => {
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      const result = await IncidentService.getIncidentById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should call findFirst with correct ID', async () => {
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      await IncidentService.getIncidentById('test-id-123');

      expect(prisma.incident.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id-123', deletedAt: null },
        })
      );
    });

    it('should return description field when present', async () => {
      const mockIncident = {
        id: 'test-id',
        incident_type: 'ransomware',
        severity: 'critical',
        description: 'Test description of the incident',
        betroffene_systeme: [],
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(mockIncident as any);

      const result = await IncidentService.getIncidentById('test-id');

      expect(result?.description).toBe('Test description of the incident');
    });

    it('should return null for soft-deleted incident (deletedAt set)', async () => {
      // findFirst returns null because the where clause now includes deletedAt: null
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      const result = await IncidentService.getIncidentById('soft-deleted-id');

      expect(result).toBeNull();
      expect(prisma.incident.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'soft-deleted-id', deletedAt: null },
        })
      );
    });

    it('should include deletedAt: null in findFirst where clause', async () => {
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      await IncidentService.getIncidentById('any-id');

      expect(prisma.incident.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('updateIncident', () => {
    it('should update incident with valid input', async () => {
      const existingIncident = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        incident_type: 'ransomware',
        severity: 'high',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(existingIncident);

      const result = await IncidentService.updateIncident('123e4567-e89b-12d3-a456-426614174000', {
        severity: 'high',
      });

      expect(result?.severity).toBe('high');
    });

    it('should return null if incident not found', async () => {
      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 0 });

      const result = await IncidentService.updateIncident('non-existent-id', { severity: 'high' });

      expect(result).toBeNull();
    });

    it('should only update provided fields', async () => {
      const updatedIncident = {
        id: 'test-id',
        incident_type: 'phishing',
        severity: 'low',
        playbook: { old: 'data' },
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(updatedIncident);

      await IncidentService.updateIncident('test-id', { severity: 'low' });

      expect(prisma.incident.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'test-id', deletedAt: null }),
          data: expect.objectContaining({ severity: 'low' }),
        })
      );
    });

    it('should update multiple fields', async () => {
      const updatedIncident = {
        id: 'test-id',
        incident_type: 'phishing',
        severity: 'medium',
        playbook: { updated: true },
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(updatedIncident);

      const result = await IncidentService.updateIncident('test-id', {
        incident_type: 'phishing',
        severity: 'medium',
        playbook: { updated: true },
      });

      expect(result?.incident_type).toBe('phishing');
      expect(result?.severity).toBe('medium');
      expect(result?.playbook).toEqual({ updated: true });
    });

    it('should update optional wizard fields including recognition details', async () => {
      const updatedIncident = {
        id: 'test-id',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: ['Server-A', 'Server-B'],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: new Date('2026-04-14T10:30:00Z'),
        erkannt_durch: 'Alert System',
        erste_erkenntnisse: 'Encryption process detected on multiple servers',
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(updatedIncident);

      const result = await IncidentService.updateIncident('test-id', {
        erkennungszeitpunkt: '2026-04-14T10:30:00Z',
        erkannt_durch: 'Alert System',
        erste_erkenntnisse: 'Encryption process detected on multiple servers',
        betroffene_systeme: ['Server-A', 'Server-B'],
      });

      expect(prisma.incident.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            erkennungszeitpunkt: '2026-04-14T10:30:00Z',
            erkannt_durch: 'Alert System',
            erste_erkenntnisse: 'Encryption process detected on multiple servers',
            betroffene_systeme: ['Server-A', 'Server-B'],
          }),
        })
      );

      expect(result?.erkennungszeitpunkt).toEqual(new Date('2026-04-14T10:30:00Z'));
      expect(result?.erkannt_durch).toBe('Alert System');
      expect(result?.erste_erkenntnisse).toBe('Encryption process detected on multiple servers');
      expect(result?.betroffene_systeme).toEqual(['Server-A', 'Server-B']);
    });

    it('should update classification questions (q1, q2, q3) including zero values', async () => {
      const updatedIncident = {
        id: 'test-id',
        incident_type: 'phishing',
        severity: 'high',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: 0,
        q2: 1,
        q3: 0,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(updatedIncident);

      const result = await IncidentService.updateIncident('test-id', {
        q1: 0,
        q2: 1,
        q3: 0,
      });

      expect(prisma.incident.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            q1: 0,
            q2: 1,
            q3: 0,
          }),
        })
      );

      expect(result?.q1).toBe(0);
      expect(result?.q2).toBe(1);
      expect(result?.q3).toBe(0);
    });

    it('should handle undefined classification questions (should not update if not provided)', async () => {
      const existingIncident = {
        id: 'test-id',
        incident_type: 'ddos',
        severity: 'high',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: 1,
        q2: 1,
        q3: 0,
        deletedAt: null,
      };

      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(existingIncident);

      await IncidentService.updateIncident('test-id', {
        severity: 'high',
      });

      expect(prisma.incident.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            q1: expect.anything(),
            q2: expect.anything(),
            q3: expect.anything(),
          }),
        })
      );
    });

    it('should return null for soft-deleted incident (updateMany count is 0)', async () => {
      // updateMany returns count: 0 when where: { id, deletedAt: null } matches nothing
      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 0 });

      const result = await IncidentService.updateIncident('soft-deleted-id', { severity: 'high' });

      expect(result).toBeNull();
      expect(prisma.incident.findFirst).not.toHaveBeenCalled();
    });

    it('should include deletedAt: null in updateMany where clause', async () => {
      vi.mocked(prisma.incident.updateMany).mockResolvedValue({ count: 0 });

      await IncidentService.updateIncident('any-id', { severity: 'high' });

      expect(prisma.incident.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('deleteIncident', () => {
    it('should soft-delete incident by setting deletedAt timestamp', async () => {
      const existingIncident = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      const deletedIncident = {
        ...existingIncident,
        deletedAt: new Date('2026-04-14T12:00:00Z'),
      };

      vi.mocked(prisma.incident.findFirst).mockResolvedValue(existingIncident);
      vi.mocked(prisma.incident.update).mockResolvedValue(deletedIncident);

      const result = await IncidentService.deleteIncident('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(deletedIncident);
      expect(result.deletedAt).not.toBeNull();
    });

    it('should call prisma.incident.update with deletedAt timestamp', async () => {
      const existingIncident = {
        id: 'test-id',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      };

      const deletedIncident = {
        ...existingIncident,
        deletedAt: new Date(),
      };

      vi.mocked(prisma.incident.findFirst).mockResolvedValue(existingIncident);
      vi.mocked(prisma.incident.update).mockResolvedValue(deletedIncident);

      await IncidentService.deleteIncident('test-id');

      expect(prisma.incident.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id' },
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return null if incident not found', async () => {
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      const result = await IncidentService.deleteIncident('non-existent-id');

      expect(result).toBeNull();
    });

    it('should call findFirst with deletedAt: null to prevent double-deletion', async () => {
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null);

      await IncidentService.deleteIncident('test-id');

      expect(prisma.incident.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'test-id', deletedAt: null },
        })
      );
    });

    it('should return the deleted incident object with all fields', async () => {
      const existingIncident = {
        id: 'test-id-123',
        incident_type: 'phishing',
        severity: 'high',
        playbook: { started: true },
        regulatorische_meldungen: { ISG: true },
        metadata: { reporter: 'admin' },
        betroffene_systeme: ['Email'],
        createdAt: new Date('2026-04-07'),
        updatedAt: new Date('2026-04-07'),
        erkennungszeitpunkt: new Date('2026-04-07'),
        erkannt_durch: 'User report',
        erste_erkenntnisse: 'Suspicious email received',
        q1: 1,
        q2: 0,
        q3: 1,
        deletedAt: null,
      };

      const deletedIncident = {
        ...existingIncident,
        deletedAt: new Date('2026-04-14T12:00:00Z'),
        updatedAt: new Date('2026-04-14T12:00:00Z'),
      };

      vi.mocked(prisma.incident.findFirst).mockResolvedValue(existingIncident);
      vi.mocked(prisma.incident.update).mockResolvedValue(deletedIncident);

      const result = await IncidentService.deleteIncident('test-id-123');

      expect(result).toEqual(deletedIncident);
      expect(result.id).toBe('test-id-123');
      expect(result.incident_type).toBe('phishing');
      expect(result.severity).toBe('high');
    });
  });

  describe('listIncidents', () => {
    it('should return list of incidents with pagination defaults', async () => {
      const mockIncidents = [
        {
          id: '1',
          incident_type: 'ransomware',
          severity: 'critical',
          playbook: {},
          regulatorische_meldungen: {},
          metadata: {},
          betroffene_systeme: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          erkennungszeitpunkt: null,
          erkannt_durch: null,
          erste_erkenntnisse: null,
          q1: null,
          q2: null,
          q3: null,
          deletedAt: null,
        },
      ];

      vi.mocked(prisma.incident.findMany).mockResolvedValue(mockIncidents);
      vi.mocked(prisma.incident.count).mockResolvedValue(1);

      const result = await IncidentService.listIncidents();

      expect(result.data).toEqual(mockIncidents);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply pagination parameters', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(50);

      await IncidentService.listIncidents(
        {},
        { page: 2, limit: 25 }
      );

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 25,
          take: 25,
        })
      );
    });

    it('should filter by incident type', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents({ type: 'ransomware' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            incident_type: 'ransomware',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents({ severity: 'critical' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'critical',
          }),
        })
      );
    });

    it('should filter by both type and severity', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents({
        type: 'phishing',
        severity: 'high',
      });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            incident_type: 'phishing',
            severity: 'high',
          }),
        })
      );
    });

    it('should exclude soft-deleted incidents (deletedAt = null)', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents();

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents();

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should return correct pagination metadata', async () => {
      const mockIncidents = Array(5).fill({
        id: '1',
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
        betroffene_systeme: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        erkennungszeitpunkt: null,
        erkannt_durch: null,
        erste_erkenntnisse: null,
        q1: null,
        q2: null,
        q3: null,
        deletedAt: null,
      });

      vi.mocked(prisma.incident.findMany).mockResolvedValue(mockIncidents);
      vi.mocked(prisma.incident.count).mockResolvedValue(45);

      const result = await IncidentService.listIncidents({}, { page: 3, limit: 15 });

      expect(result.total).toBe(45);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(result.data.length).toBe(5);
    });

    it('should call count with same filters as findMany', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(10);

      await IncidentService.listIncidents({
        type: 'ddos',
        severity: 'medium',
      });

      expect(prisma.incident.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            incident_type: 'ddos',
            severity: 'medium',
            deletedAt: null,
          }),
        })
      );
    });

    it('should ignore invalid type filter values', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents({ type: 'invalid-type' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            incident_type: expect.anything(),
          }),
        })
      );
    });

    it('should ignore invalid severity filter values', async () => {
      vi.mocked(prisma.incident.findMany).mockResolvedValue([]);
      vi.mocked(prisma.incident.count).mockResolvedValue(0);

      await IncidentService.listIncidents({ severity: 'extreme' });

      expect(prisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            severity: expect.anything(),
          }),
        })
      );
    });
  });
});
