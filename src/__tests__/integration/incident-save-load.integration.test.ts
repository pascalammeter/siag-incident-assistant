/**
 * Incident Integration Tests: Wizard → API → DB → Retrieve Flow
 *
 * Comprehensive TDD test suite validating end-to-end incident persistence:
 * - Complete field persistence across wizard → API → DB → retrieve cycle
 * - Soft-delete functionality with timestamp and filtering
 * - Playbook routing by incident type
 * - Field preservation during updates
 *
 * These tests ensure that all 14 wizard fields survive the complete data flow
 * without loss or corruption.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '@/api/config/prisma';
import { IncidentService } from '@/api/services/incident.service';
import { getPlaybook } from '@/lib/playbook-data';
import type { CreateIncidentInput } from '@/api/schemas/incident.schema';

/**
 * Test data factory: Creates a complete incident with all 14 fields
 */
const createFullIncidentPayload = (overrides?: Partial<CreateIncidentInput>): CreateIncidentInput => ({
  incident_type: 'ransomware',
  severity: 'critical',
  erkennungszeitpunkt: '2026-04-07T14:30:00Z',
  erkannt_durch: 'SOC monitoring alert',
  betroffene_systeme: ['Exchange', 'SharePoint', 'File Server'],
  erste_erkenntnisse: 'Encrypted files with .locked extension detected on multiple systems',
  q1: 1,
  q2: 0,
  q3: 1,
  regulatorische_meldungen: { isg_24h: '2026-04-08T14:30:00Z' },
  metadata: { tags: ['external', 'critical'] },
  playbook: {},
  ...overrides,
});

describe('Incident Integration Tests: Wizard → API → DB → Retrieve', () => {
  // Note: Database cleanup hooks skipped due to Neon connection pooling in test environment
  // Tests proceed without cleanup but maintain data isolation through unique payloads

  // Database cleanup would happen here in production:
  // beforeAll: await prisma.incident.deleteMany({});
  // afterAll: await prisma.incident.deleteMany({});
  // beforeEach: await prisma.incident.deleteMany({});

  // ==================== SCENARIO 1: Create with all fields ====================

  describe('Scenario 1: Create incident with all wizard fields', () => {
    it('should create incident with all 14 fields persisted to database', async () => {
      const payload = createFullIncidentPayload();

      const incident = await IncidentService.createIncident(payload);

      // Verify all 14 fields persisted
      expect(incident.id).toBeDefined();
      expect(incident.incident_type).toBe('ransomware');
      expect(incident.severity).toBe('critical');

      // Recognition fields (4 fields)
      expect((incident.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);
      expect(incident.erkannt_durch).toBe('SOC monitoring alert');
      expect(incident.betroffene_systeme).toEqual(['Exchange', 'SharePoint', 'File Server']);
      expect(incident.erste_erkenntnisse).toBe('Encrypted files with .locked extension detected on multiple systems');

      // Classification fields (3 fields)
      expect(incident.q1).toBe(1);
      expect(incident.q2).toBe(0);
      expect(incident.q3).toBe(1);

      // Regulatory and metadata (2 fields)
      expect(incident.regulatorische_meldungen).toEqual({ isg_24h: '2026-04-08T14:30:00Z' });
      expect(incident.metadata).toEqual({ tags: ['external', 'critical'] });

      // Soft-delete should be null
      expect(incident.deletedAt).toBeNull();

      // Timestamps should be set
      expect(incident.createdAt).toBeDefined();
      expect(incident.updatedAt).toBeDefined();
    });

    it('should persist zero values (q2=0) correctly', async () => {
      const payload = createFullIncidentPayload({ q2: 0, q3: 0 });

      const incident = await IncidentService.createIncident(payload);

      // Verify zeros are preserved, not lost to null
      expect(incident.q2).toBe(0);
      expect(incident.q3).toBe(0);
      expect(incident.q2).not.toBeNull();
      expect(incident.q3).not.toBeNull();
    });

    it('should persist empty array betroffene_systeme correctly', async () => {
      const payload = createFullIncidentPayload({ betroffene_systeme: [] });

      const incident = await IncidentService.createIncident(payload);

      // Empty array should be preserved
      expect(Array.isArray(incident.betroffene_systeme)).toBe(true);
      expect(incident.betroffene_systeme.length).toBe(0);
    });

    it('should persist non-empty betroffene_systeme array', async () => {
      const systems = ['Exchange', 'SharePoint', 'File Server'];
      const payload = createFullIncidentPayload({ betroffene_systeme: systems });

      const incident = await IncidentService.createIncident(payload);

      expect(incident.betroffene_systeme).toEqual(systems);
      expect(incident.betroffene_systeme.length).toBe(3);
    });
  });

  // ==================== SCENARIO 2: Retrieve returns complete data ====================

  describe('Scenario 2: Retrieve incident returns complete data', () => {
    it('should retrieve incident with all fields intact from database', async () => {
      const payload = createFullIncidentPayload();
      const created = await IncidentService.createIncident(payload);

      const retrieved = await IncidentService.getIncidentById(created.id);

      // Verify all fields returned
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);

      // Recognition fields
      expect((retrieved?.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);
      expect(retrieved?.erkannt_durch).toBe('SOC monitoring alert');
      expect(retrieved?.betroffene_systeme).toEqual(['Exchange', 'SharePoint', 'File Server']);
      expect(retrieved?.erste_erkenntnisse).toBe('Encrypted files with .locked extension detected on multiple systems');

      // Classification fields
      expect(retrieved?.q1).toBe(1);
      expect(retrieved?.q2).toBe(0);
      expect(retrieved?.q3).toBe(1);

      // Regulatory and metadata
      expect(retrieved?.regulatorische_meldungen).toEqual({ isg_24h: '2026-04-08T14:30:00Z' });
      expect(retrieved?.metadata).toEqual({ tags: ['external', 'critical'] });

      // Not deleted
      expect(retrieved?.deletedAt).toBeNull();
    });

    it('should maintain data integrity in round-trip: create → db → retrieve', async () => {
      const payload = createFullIncidentPayload({
        incident_type: 'phishing',
        severity: 'high',
        erkennungszeitpunkt: '2026-04-07T10:00:00Z',
      });

      const created = await IncidentService.createIncident(payload);
      const retrieved = await IncidentService.getIncidentById(created.id);

      // Verify exact match after round-trip
      expect(retrieved?.incident_type).toBe(payload.incident_type);
      expect(retrieved?.severity).toBe(payload.severity);
      expect((retrieved?.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T10:00:00/);
    });
  });

  // ==================== SCENARIO 3: Playbook routing by incident type ====================

  describe('Scenario 3: Playbook routing by incident type', () => {
    it('should route ransomware incidents correctly', async () => {
      const payload = createFullIncidentPayload({ incident_type: 'ransomware' });
      const incident = await IncidentService.createIncident(payload);

      const playbook = getPlaybook(incident.incident_type);

      expect(playbook).toBeDefined();
      expect(playbook.incidentType).toBe('ransomware');
      expect(playbook.phases).toBeDefined();
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should route phishing incidents correctly', async () => {
      const payload = createFullIncidentPayload({ incident_type: 'phishing' });
      const incident = await IncidentService.createIncident(payload);

      const playbook = getPlaybook(incident.incident_type);

      expect(playbook).toBeDefined();
      expect(playbook.incidentType).toBe('phishing');
      expect(playbook.phases).toBeDefined();
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should route ddos incidents correctly', async () => {
      const payload = createFullIncidentPayload({ incident_type: 'ddos' });
      const incident = await IncidentService.createIncident(payload);

      const playbook = getPlaybook(incident.incident_type);

      expect(playbook).toBeDefined();
      expect(playbook.incidentType).toBe('ddos');
      expect(playbook.phases).toBeDefined();
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should route data_loss incidents correctly', async () => {
      const payload = createFullIncidentPayload({ incident_type: 'data_loss' });
      const incident = await IncidentService.createIncident(payload);

      const playbook = getPlaybook(incident.incident_type);

      expect(playbook).toBeDefined();
      expect(playbook.incidentType).toBe('datenverlust'); // Playboks use German IDs
      expect(playbook.phases).toBeDefined();
      expect(playbook.phases.length).toBeGreaterThan(0);
    });

    it('should return playbooks with correct structure: phases and steps', async () => {
      const payload = createFullIncidentPayload({ incident_type: 'ransomware' });
      const incident = await IncidentService.createIncident(payload);
      const playbook = getPlaybook(incident.incident_type);

      // Verify playbook structure
      expect(playbook.phases).toBeDefined();
      for (const phase of playbook.phases) {
        expect(phase.id).toBeDefined();
        expect(phase.title).toBeDefined();
        expect(phase.steps).toBeDefined();
        expect(Array.isArray(phase.steps)).toBe(true);

        // Each step should have required fields
        for (const step of phase.steps) {
          expect(step.id).toBeDefined();
          expect(step.text).toBeDefined();
          expect(step.role).toBeDefined();
        }
      }
    });
  });

  // ==================== SCENARIO 4: Soft-delete with timestamp ====================

  describe('Scenario 4: Soft-delete marks incident with timestamp', () => {
    it('should soft-delete incident and set deletedAt timestamp', async () => {
      const payload = createFullIncidentPayload();
      const incident = await IncidentService.createIncident(payload);

      const beforeDelete = new Date();
      const deleted = await IncidentService.deleteIncident(incident.id);
      const afterDelete = new Date();

      expect(deleted).toBeDefined();
      expect(deleted?.deletedAt).not.toBeNull();

      // Verify timestamp is reasonable (within 1 second of now)
      const deletedAtTime = deleted?.deletedAt instanceof Date ? deleted.deletedAt.getTime() : new Date(deleted?.deletedAt as string).getTime();
      expect(deletedAtTime).toBeGreaterThanOrEqual(beforeDelete.getTime());
      expect(deletedAtTime).toBeLessThanOrEqual(afterDelete.getTime() + 1000);
    });

    it('should preserve all fields when soft-deleting', async () => {
      const payload = createFullIncidentPayload();
      const incident = await IncidentService.createIncident(payload);

      const deleted = await IncidentService.deleteIncident(incident.id);

      // All original fields should be unchanged
      expect(deleted?.incident_type).toBe('ransomware');
      expect(deleted?.severity).toBe('critical');
      expect((deleted?.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);
      expect(deleted?.q1).toBe(1);
      expect(deleted?.q2).toBe(0);
      expect(deleted?.q3).toBe(1);
    });

    it('should return null when deleting non-existent incident', async () => {
      const result = await IncidentService.deleteIncident('non-existent-id');
      expect(result).toBeNull();
    });
  });

  // ==================== SCENARIO 5: List filtering excludes soft-deleted ====================

  describe('Scenario 5: Soft-deleted incidents filtered from list', () => {
    it('should exclude soft-deleted incidents from list query', async () => {
      // Create 3 active incidents
      const incident1 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'ransomware' })
      );
      const incident2 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'phishing' })
      );
      const incident3 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'ddos' })
      );

      // Soft-delete one
      await IncidentService.deleteIncident(incident3.id);

      // List should exclude deleted incidents
      const result = await IncidentService.listIncidents(undefined, { page: 1, limit: 100 });

      const retrievedIds = result.data.map((i) => i.id);
      expect(retrievedIds).toContain(incident1.id);
      expect(retrievedIds).toContain(incident2.id);
      expect(retrievedIds).not.toContain(incident3.id);
    });

    it('should return correct pagination with soft-deleted excluded', async () => {
      // Create 5 incidents
      const created: typeof incident1[] = [];
      for (let i = 0; i < 5; i++) {
        const inc = await IncidentService.createIncident(createFullIncidentPayload());
        created.push(inc);
      }

      // Soft-delete 2 of our created incidents
      await IncidentService.deleteIncident(created[0].id);
      await IncidentService.deleteIncident(created[1].id);

      // List all incidents and verify our non-deleted ones are there
      const result = await IncidentService.listIncidents(undefined, { page: 1, limit: 100 });

      const retrievedIds = result.data.map((i) => i.id);
      // Verify the 3 non-deleted incidents are in the result
      expect(retrievedIds).toContain(created[2].id);
      expect(retrievedIds).toContain(created[3].id);
      expect(retrievedIds).toContain(created[4].id);
      // Verify the 2 deleted ones are not
      expect(retrievedIds).not.toContain(created[0].id);
      expect(retrievedIds).not.toContain(created[1].id);
    });

    it('should correctly apply type filter and exclude soft-deleted', async () => {
      // Create ransomware and phishing incidents
      const ransomware1 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'ransomware' })
      );
      const ransomware2 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'ransomware' })
      );
      const phishing1 = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'phishing' })
      );

      // Soft-delete one ransomware
      await IncidentService.deleteIncident(ransomware2.id);

      // List only ransomware
      const result = await IncidentService.listIncidents({ type: 'ransomware' }, { page: 1, limit: 100 });

      const retrievedIds = result.data.map((i) => i.id);
      expect(retrievedIds).toContain(ransomware1.id);
      expect(retrievedIds).not.toContain(ransomware2.id);
      // phishing1 should not be in results since we filtered by type
      expect(retrievedIds).not.toContain(phishing1.id);
    });
  });

  // ==================== SCENARIO 6: Update preserves unmodified fields ====================

  describe('Scenario 6: Update incident preserves unmodified fields', () => {
    it('should preserve unmodified fields during PATCH update', async () => {
      const payload = createFullIncidentPayload();
      const incident = await IncidentService.createIncident(payload);

      // Update only severity
      const updated = await IncidentService.updateIncident(incident.id, {
        severity: 'high',
      });

      expect(updated).toBeDefined();

      // Updated field
      expect(updated?.severity).toBe('high');

      // Preserved fields
      expect(updated?.incident_type).toBe('ransomware');
      expect((updated?.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);
      expect(updated?.erkannt_durch).toBe('SOC monitoring alert');
      expect(updated?.betroffene_systeme).toEqual(['Exchange', 'SharePoint', 'File Server']);
      expect(updated?.erste_erkenntnisse).toBe('Encrypted files with .locked extension detected on multiple systems');
      expect(updated?.q1).toBe(1);
      expect(updated?.q2).toBe(0);
      expect(updated?.q3).toBe(1);
      expect(updated?.regulatorische_meldungen).toEqual({ isg_24h: '2026-04-08T14:30:00Z' });
    });

    it('should update q2 field while preserving q1 and q3', async () => {
      const payload = createFullIncidentPayload({ q1: 1, q2: 0, q3: 1 });
      const incident = await IncidentService.createIncident(payload);

      // Update only q2
      const updated = await IncidentService.updateIncident(incident.id, {
        q2: 1,
      });

      expect(updated?.q1).toBe(1); // Preserved
      expect(updated?.q2).toBe(1); // Updated
      expect(updated?.q3).toBe(1); // Preserved
    });

    it('should update betroffene_systeme array', async () => {
      const payload = createFullIncidentPayload({
        betroffene_systeme: ['System-A', 'System-B'],
      });
      const incident = await IncidentService.createIncident(payload);

      // Update systems
      const updated = await IncidentService.updateIncident(incident.id, {
        betroffene_systeme: ['System-C', 'System-D', 'System-E'],
      });

      expect(updated?.betroffene_systeme).toEqual(['System-C', 'System-D', 'System-E']);

      // Other fields preserved
      expect(updated?.q1).toBe(1);
      expect(updated?.incident_type).toBe('ransomware');
    });

    it('should return null when updating non-existent incident', async () => {
      const result = await IncidentService.updateIncident('non-existent-id', {
        severity: 'high',
      });

      expect(result).toBeNull();
    });
  });

  // ==================== SCENARIO 7: Field-level validation ====================

  describe('Scenario 7: Each field independently persists correctly', () => {
    it('should persist recognition timestamp field', async () => {
      const timestamp = '2026-04-07T14:30:00Z';
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ erkennungszeitpunkt: timestamp })
      );

      expect((incident.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect((retrieved?.erkennungszeitpunkt as Date).toISOString()).toMatch(/2026-04-07T14:30:00/);
    });

    it('should persist recognition source field', async () => {
      const source = 'SOC monitoring alert';
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ erkannt_durch: source })
      );

      expect(incident.erkannt_durch).toBe(source);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.erkannt_durch).toBe(source);
    });

    it('should persist affected systems array', async () => {
      const systems = ['Exchange', 'SharePoint', 'File Server'];
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ betroffene_systeme: systems })
      );

      expect(incident.betroffene_systeme).toEqual(systems);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.betroffene_systeme).toEqual(systems);
    });

    it('should persist initial findings field', async () => {
      const findings = 'Encrypted files with .locked extension';
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ erste_erkenntnisse: findings })
      );

      expect(incident.erste_erkenntnisse).toBe(findings);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.erste_erkenntnisse).toBe(findings);
    });

    it('should persist all three classification questions', async () => {
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ q1: 1, q2: 0, q3: 1 })
      );

      expect(incident.q1).toBe(1);
      expect(incident.q2).toBe(0);
      expect(incident.q3).toBe(1);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.q1).toBe(1);
      expect(retrieved?.q2).toBe(0);
      expect(retrieved?.q3).toBe(1);
    });

    it('should persist incident type field', async () => {
      for (const type of ['ransomware', 'phishing', 'ddos', 'data_loss']) {
        const incident = await IncidentService.createIncident(
          createFullIncidentPayload({ incident_type: type as any })
        );

        expect(incident.incident_type).toBe(type);

        const retrieved = await IncidentService.getIncidentById(incident.id);
        expect(retrieved?.incident_type).toBe(type);
      }
    });

    it('should persist severity field', async () => {
      for (const severity of ['critical', 'high', 'medium', 'low']) {
        const incident = await IncidentService.createIncident(
          createFullIncidentPayload({ severity: severity as any })
        );

        expect(incident.severity).toBe(severity);

        const retrieved = await IncidentService.getIncidentById(incident.id);
        expect(retrieved?.severity).toBe(severity);
      }
    });

    it('should persist regulatory messages JSONB field', async () => {
      const regulatory = {
        isg_24h: '2026-04-08T14:30:00Z',
        dsg: true,
        finma_24h: '2026-04-08T14:30:00Z',
      };
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ regulatorische_meldungen: regulatory })
      );

      expect(incident.regulatorische_meldungen).toEqual(regulatory);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.regulatorische_meldungen).toEqual(regulatory);
    });

    it('should persist metadata JSONB field', async () => {
      const metadata = {
        tags: ['external', 'critical'],
        notes: 'Escalated to management',
        custom: { priority: 'urgent' },
      };
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ metadata })
      );

      expect(incident.metadata).toEqual(metadata);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.metadata).toEqual(metadata);
    });
  });

  // ==================== SCENARIO 8: Data loss incident with type-specific fields ====================

  describe('Scenario 8: Type-specific field handling', () => {
    it('should correctly persist data_loss incident type', async () => {
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ incident_type: 'data_loss' })
      );

      expect(incident.incident_type).toBe('data_loss');

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.incident_type).toBe('data_loss');

      // Verify playbook routing
      const playbook = getPlaybook(retrieved?.incident_type || '');
      expect(playbook.incidentType).toBe('datenverlust'); // Playboks use German IDs
    });

    it('should preserve betroffene_systeme for data_loss incidents', async () => {
      const systems = ['Database Server', 'File Server', 'Backup Server'];
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({
          incident_type: 'data_loss',
          betroffene_systeme: systems,
        })
      );

      expect(incident.betroffene_systeme).toEqual(systems);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.betroffene_systeme).toEqual(systems);
    });
  });

  // ==================== SCENARIO 9: Complex JSONB handling ====================

  describe('Scenario 9: Complex JSONB field persistence', () => {
    it('should handle nested playbook JSONB structure', async () => {
      const playbook = {
        checkedSteps: [
          { stepId: 'step1', checked: true, timestamp: '2026-04-07T15:00:00Z' },
          { stepId: 'step2', checked: false, timestamp: null },
        ],
        status: 'in_progress',
        completedAt: null,
      };

      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({ playbook })
      );

      expect(incident.playbook).toEqual(playbook);

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.playbook).toEqual(playbook);
    });

    it('should handle empty JSONB fields', async () => {
      const incident = await IncidentService.createIncident(
        createFullIncidentPayload({
          playbook: {},
          metadata: {},
          regulatorische_meldungen: {},
        })
      );

      expect(incident.playbook).toEqual({});
      expect(incident.metadata).toEqual({});
      expect(incident.regulatorische_meldungen).toEqual({});

      const retrieved = await IncidentService.getIncidentById(incident.id);
      expect(retrieved?.playbook).toEqual({});
      expect(retrieved?.metadata).toEqual({});
      expect(retrieved?.regulatorische_meldungen).toEqual({});
    });
  });
});
