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

// Create a test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/incidents', incidentsRouter);
  return app;
};

describe('POST /api/incidents', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create incident with valid data and return 201', async () => {
    const mockIncident = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      incident_type: 'ransomware',
      severity: 'critical',
      description: 'Test ransomware incident',
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

    vi.spyOn(IncidentService, 'createIncident').mockResolvedValue(mockIncident);

    const payload = {
      incident_type: 'ransomware',
      severity: 'critical',
      description: 'Test ransomware incident',
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.incident_type).toBe('ransomware');
    expect(response.body.severity).toBe('critical');
  });

  it('should include createdAt timestamp', async () => {
    const mockIncident = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      incident_type: 'phishing',
      severity: 'high',
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

    vi.spyOn(IncidentService, 'createIncident').mockResolvedValue(mockIncident);

    const payload = {
      incident_type: 'phishing',
      severity: 'high',
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('createdAt');
  });

  it('should return 400 with validation error for missing required field', async () => {
    const payload = {
      severity: 'high',
      // missing incident_type
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toBeInstanceOf(Array);
    expect(response.body.details[0]).toHaveProperty('field');
    expect(response.body.details[0]).toHaveProperty('message');
  });

  it('should return 400 with validation error for invalid enum value', async () => {
    const payload = {
      incident_type: 'invalid_type',
      severity: 'high',
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details[0].field).toContain('incident_type');
  });

  it('should return 400 for description below minimum length', async () => {
    const payload = {
      incident_type: 'ddos',
      severity: 'medium',
      description: 'short',
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.details[0].field).toContain('description');
  });

  it('should create incident with optional metadata', async () => {
    const mockIncident = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      incident_type: 'data_loss',
      severity: 'high',
      metadata: { recordsAffected: 10000 },
      playbook: {},
      regulatorische_meldungen: {},
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

    vi.spyOn(IncidentService, 'createIncident').mockResolvedValue(mockIncident);

    const payload = {
      incident_type: 'data_loss',
      severity: 'high',
      metadata: { recordsAffected: 10000 },
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.metadata).toEqual({ recordsAffected: 10000 });
  });

  it('should return Content-Type application/json', async () => {
    const mockIncident = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      incident_type: 'other',
      severity: 'low',
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

    vi.spyOn(IncidentService, 'createIncident').mockResolvedValue(mockIncident);

    const payload = {
      incident_type: 'other',
      severity: 'low',
    };

    const response = await request(app)
      .post('/api/incidents')
      .send(payload);

    expect(response.type).toMatch(/json/);
  });
});
