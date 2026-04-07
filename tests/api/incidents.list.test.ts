import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/api/config/prisma';

describe('GET /api/incidents', () => {
  afterEach(async () => {
    await prisma.incident.deleteMany({});
  });

  beforeEach(async () => {
    // Create 15 test incidents
    for (let i = 0; i < 5; i++) {
      await prisma.incident.create({
        data: {
          incident_type: 'ransomware',
          severity: i % 2 === 0 ? 'critical' : 'high',
          playbook: {},
          regulatorische_meldungen: {},
          metadata: {},
        },
      });
    }

    for (let i = 0; i < 5; i++) {
      await prisma.incident.create({
        data: {
          incident_type: 'phishing',
          severity: i % 2 === 0 ? 'high' : 'medium',
          playbook: {},
          regulatorische_meldungen: {},
          metadata: {},
        },
      });
    }

    for (let i = 0; i < 5; i++) {
      await prisma.incident.create({
        data: {
          incident_type: 'ddos',
          severity: i % 2 === 0 ? 'medium' : 'low',
          playbook: {},
          regulatorische_meldungen: {},
          metadata: {},
        },
      });
    }
  });

  it('should return 200 with list of incidents', async () => {
    const response = await request(app)
      .get('/api/incidents');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
  });

  it('should return default pagination (page 1, limit 10)', async () => {
    const response = await request(app)
      .get('/api/incidents');

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.total).toBe(15);
  });

  it('should return second page with correct offset', async () => {
    const response = await request(app)
      .get('/api/incidents?page=2&limit=5');

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(5);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.total).toBe(15);
  });

  it('should filter by type=ransomware', async () => {
    const response = await request(app)
      .get('/api/incidents?type=ransomware');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(5);
    expect(response.body.data.every((i: any) => i.incident_type === 'ransomware')).toBe(true);
  });

  it('should filter by severity=critical', async () => {
    const response = await request(app)
      .get('/api/incidents?severity=critical');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3); // 3 critical incidents
    expect(response.body.data.every((i: any) => i.severity === 'critical')).toBe(true);
  });

  it('should filter by type AND severity', async () => {
    const response = await request(app)
      .get('/api/incidents?type=ransomware&severity=critical');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3); // 3 ransomware+critical
    expect(response.body.data.every((i: any) =>
      i.incident_type === 'ransomware' && i.severity === 'critical'
    )).toBe(true);
  });

  it('should exclude soft-deleted incidents', async () => {
    const allIncidents = await prisma.incident.findMany({
      where: { deletedAt: null },
    });

    // Soft delete 3 incidents
    for (let i = 0; i < 3; i++) {
      await prisma.incident.update({
        where: { id: allIncidents[i].id },
        data: { deletedAt: new Date() },
      });
    }

    const response = await request(app)
      .get('/api/incidents');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(12); // 15 - 3 deleted
  });

  it('should order by createdAt descending', async () => {
    const response = await request(app)
      .get('/api/incidents?limit=15');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(1);

    for (let i = 0; i < response.body.data.length - 1; i++) {
      const current = new Date(response.body.data[i].createdAt).getTime();
      const next = new Date(response.body.data[i + 1].createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it('should return Content-Type application/json', async () => {
    const response = await request(app)
      .get('/api/incidents');

    expect(response.type).toBe('application/json');
  });

  it('should return empty array when no results match filters', async () => {
    const response = await request(app)
      .get('/api/incidents?type=data_loss');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.data).toEqual([]);
  });
});
