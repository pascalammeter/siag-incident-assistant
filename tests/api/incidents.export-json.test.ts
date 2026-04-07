import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import incidentsRouter from '../../src/api/routes/incidents';

// Mock Prisma
vi.mock('../../src/api/config/prisma', () => ({
  prisma: {
    incident: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
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

describe('POST /api/incidents/:id/export/json', () => {
  let app: any;
  let testIncidentId: string;
  const mockIncident = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    incident_type: 'ransomware',
    severity: 'critical',
    playbook: { steps: ['isolate', 'scan'] },
    regulatorische_meldungen: { dpia: true },
    metadata: { affectedSystems: 5 },
    betroffene_systeme: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    app = createTestApp();
    testIncidentId = mockIncident.id;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with JSON export', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.status).toBe(200);
  });

  it('should set Content-Type to application/json', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.type).toBe('application/json');
  });

  it('should set Content-Disposition header with filename', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    const disposition = response.headers['content-disposition'];
    expect(disposition).toBeDefined();
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('incident-');
    expect(disposition).toContain('.json');
  });

  it('should include incident ID in filename', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    const disposition = response.headers['content-disposition'];
    expect(disposition).toContain(testIncidentId);
  });

  it('should export full incident data', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testIncidentId);
    expect(response.body.incident_type).toBe('ransomware');
    expect(response.body.severity).toBe('critical');
    expect(response.body.playbook).toEqual({ steps: ['isolate', 'scan'] });
    expect(response.body.metadata).toEqual({ affectedSystems: 5 });
  });

  it('should return valid JSON that can be parsed', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.status).toBe(200);
    // supertest auto-parses JSON, so response.body is already parsed
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('incident_type');
  });

  it('should return 404 for non-existent incident', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(null);

    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app)
      .post(`/api/incidents/${fakeId}/export/json`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Incident not found');
  });

  it('should include timestamps in export', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('should set no-cache headers', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/json`);

    expect(response.headers['cache-control']).toContain('no-cache');
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.headers['pragma']).toBe('no-cache');
  });
});
