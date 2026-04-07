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

describe('DELETE /api/incidents/:id', () => {
  let app: any;
  let testIncidentId: string;

  beforeEach(() => {
    app = createTestApp();
    testIncidentId = '123e4567-e89b-12d3-a456-426614174000';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should soft delete incident and return 204', async () => {
    vi.spyOn(IncidentService, 'deleteIncident').mockResolvedValue(true);

    const response = await request(app)
      .delete(`/api/incidents/${testIncidentId}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existent ID', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    vi.spyOn(IncidentService, 'deleteIncident').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/incidents/${fakeId}`);

    expect(response.status).toBe(404);
  });

  it('should return 204 with no response body', async () => {
    vi.spyOn(IncidentService, 'deleteIncident').mockResolvedValue(true);

    const response = await request(app)
      .delete(`/api/incidents/${testIncidentId}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it('should allow soft deleting the same incident only once', async () => {
    vi.spyOn(IncidentService, 'deleteIncident')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(null);

    // First delete
    const response1 = await request(app)
      .delete(`/api/incidents/${testIncidentId}`);
    expect(response1.status).toBe(204);

    // Second delete attempt
    const response2 = await request(app)
      .delete(`/api/incidents/${testIncidentId}`);
    expect(response2.status).toBe(404);
  });

  it('should delete incident with correct ID', async () => {
    const deleteServiceSpy = vi.spyOn(IncidentService, 'deleteIncident').mockResolvedValue(true);

    await request(app)
      .delete(`/api/incidents/${testIncidentId}`);

    expect(deleteServiceSpy).toHaveBeenCalledWith(testIncidentId);
  });

  it('should handle service errors gracefully', async () => {
    const deleteServiceSpy = vi.spyOn(IncidentService, 'deleteIncident').mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/incidents/${testIncidentId}`);

    expect(response.status).toBe(404);
    expect(deleteServiceSpy).toHaveBeenCalled();
  });
});
