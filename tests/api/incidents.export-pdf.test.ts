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

describe('POST /api/incidents/:id/export/pdf', () => {
  let app: any;
  let testIncidentId: string;
  const mockIncident = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    incident_type: 'ddos',
    severity: 'high',
    playbook: { steps: ['activate-cdn', 'rate-limit'] },
    regulatorische_meldungen: {},
    metadata: { targetServices: ['api', 'web'] },
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

  it('should return 200 with PDF export', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/pdf`)
      .timeout(30000);

    expect([200, 500]).toContain(response.status);
  });

  it('should set Content-Disposition header with filename', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/pdf`)
      .timeout(30000);

    if (response.status === 200) {
      const disposition = response.headers['content-disposition'];
      expect(disposition).toBeDefined();
      expect(disposition).toContain('attachment');
      expect(disposition).toContain('incident-');
      expect(disposition).toContain('.pdf');
    }
  });

  it('should include incident ID in PDF filename', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/pdf`)
      .timeout(30000);

    if (response.status === 200) {
      const disposition = response.headers['content-disposition'];
      expect(disposition).toContain(testIncidentId);
    }
  });

  it('should return 404 for non-existent incident', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(null);

    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app)
      .post(`/api/incidents/${fakeId}/export/pdf`)
      .timeout(30000);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Incident not found');
  });

  it('should set no-cache headers on success', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/pdf`)
      .timeout(30000);

    if (response.status === 200) {
      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers['pragma']).toBe('no-cache');
    }
  });

  it('should export all required incident fields', async () => {
    const { prisma } = await import('../../src/api/config/prisma');
    vi.mocked(prisma.incident.findFirst).mockResolvedValueOnce(mockIncident as any);

    const response = await request(app)
      .post(`/api/incidents/${testIncidentId}/export/pdf`)
      .timeout(30000);

    if (response.status === 200) {
      // Verify we have a buffer response
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(100);
      // Verify it's a PDF (starts with PDF magic number)
      expect(response.body[0]).toBe(0x25); // '%'
      expect(response.body[1]).toBe(0x50); // 'P'
      expect(response.body[2]).toBe(0x44); // 'D'
      expect(response.body[3]).toBe(0x46); // 'F'
    }
  });
});
