import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import incidentsRouter from '../../src/api/routes/incidents';
import { IncidentService } from '../../src/api/services/incident.service';

// Mock Prisma
vi.mock('../../src/api/config/prisma', () => ({
  prisma: {
    incident: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/incidents', incidentsRouter);
  return app;
};

describe('PATCH /api/incidents/:id', () => {
  let app: any;
  let testIncidentId: string;

  beforeEach(() => {
    app = createTestApp();
    testIncidentId = '123e4567-e89b-12d3-a456-426614174000';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update single field and return 200', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'high',
      description: 'Original description',
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'updateIncident').mockResolvedValue(mockIncident);

    const payload = {
      severity: 'high',
    };

    const response = await request(app)
      .patch(`/api/incidents/${testIncidentId}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.severity).toBe('high');
    expect(response.body.incident_type).toBe('ransomware');
  });

  it('should update multiple fields', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'medium',
      description: 'Updated description',
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'updateIncident').mockResolvedValue(mockIncident);

    const payload = {
      severity: 'medium',
      description: 'Updated description',
    };

    const response = await request(app)
      .patch(`/api/incidents/${testIncidentId}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.severity).toBe('medium');
    expect(response.body.description).toBe('Updated description');
    expect(response.body.incident_type).toBe('ransomware');
  });

  it('should return 404 for non-existent ID', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    vi.spyOn(IncidentService, 'updateIncident').mockResolvedValue(null);

    const payload = { severity: 'low' };

    const response = await request(app)
      .patch(`/api/incidents/${fakeId}`)
      .send(payload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Incident not found');
  });

  it('should return 400 for invalid enum in update', async () => {
    const payload = {
      severity: 'invalid_severity',
    };

    const response = await request(app)
      .patch(`/api/incidents/${testIncidentId}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });

  it('should update metadata object', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'critical',
      metadata: { recordsAffected: 5000, ipAddresses: ['1.2.3.4'] },
      playbook: {},
      regulatorische_meldungen: {},
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'updateIncident').mockResolvedValue(mockIncident);

    const payload = {
      metadata: { recordsAffected: 5000, ipAddresses: ['1.2.3.4'] },
    };

    const response = await request(app)
      .patch(`/api/incidents/${testIncidentId}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.metadata).toEqual({
      recordsAffected: 5000,
      ipAddresses: ['1.2.3.4'],
    });
  });

  it('should update updatedAt timestamp', async () => {
    const beforeUpdate = Date.now();

    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'low',
      metadata: {},
      playbook: {},
      regulatorische_meldungen: {},
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'updateIncident').mockResolvedValue(mockIncident);

    const payload = { severity: 'low' };
    const response = await request(app)
      .patch(`/api/incidents/${testIncidentId}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(beforeUpdate);
  });
});
