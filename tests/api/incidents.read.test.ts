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

describe('GET /api/incidents/:id', () => {
  let app: any;
  let testIncidentId: string;

  beforeEach(() => {
    app = createTestApp();
    testIncidentId = '123e4567-e89b-12d3-a456-426614174000';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with incident for valid ID', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'critical',
      description: 'Test ransomware',
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'getIncidentById').mockResolvedValue(mockIncident);

    const response = await request(app)
      .get(`/api/incidents/${testIncidentId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testIncidentId);
    expect(response.body.incident_type).toBe('ransomware');
  });

  it('should return 404 for non-existent ID', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    vi.spyOn(IncidentService, 'getIncidentById').mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/incidents/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Incident not found');
  });

  it('should return all incident fields', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'critical',
      description: 'Test',
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'getIncidentById').mockResolvedValue(mockIncident);

    const response = await request(app)
      .get(`/api/incidents/${testIncidentId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('incident_type');
    expect(response.body).toHaveProperty('severity');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('should return Content-Type application/json', async () => {
    const mockIncident = {
      id: testIncidentId,
      incident_type: 'ransomware',
      severity: 'critical',
      playbook: {},
      regulatorische_meldungen: {},
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      erkennungszeitpunkt: null,
      erkannt_durch: null,
      betroffene_systeme: [],
      erste_erkenntnisse: null,
      q1: null,
      q2: null,
      q3: null,
    };

    vi.spyOn(IncidentService, 'getIncidentById').mockResolvedValue(mockIncident);

    const response = await request(app)
      .get(`/api/incidents/${testIncidentId}`);

    expect(response.type).toMatch(/json/);
  });
});
