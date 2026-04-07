import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/api/config/prisma';

describe('GET /api/incidents - Edge Cases & Validation', () => {
  afterEach(async () => {
    await prisma.incident.deleteMany({});
  });

  it('should return 400 for invalid type enum', async () => {
    const response = await request(app)
      .get('/api/incidents?type=invalid_type');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid query parameters');
    expect(response.body.details).toBeInstanceOf(Array);
  });

  it('should return 400 for invalid severity enum', async () => {
    const response = await request(app)
      .get('/api/incidents?severity=invalid_severity');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid query parameters');
  });

  it('should return 400 for negative page number', async () => {
    const response = await request(app)
      .get('/api/incidents?page=0');

    expect(response.status).toBe(400);
    expect(response.body.details[0].field).toContain('page');
  });

  it('should return 400 for negative limit', async () => {
    const response = await request(app)
      .get('/api/incidents?limit=-5');

    expect(response.status).toBe(400);
    expect(response.body.details[0].field).toContain('limit');
  });

  it('should return 400 for limit exceeding max (100)', async () => {
    const response = await request(app)
      .get('/api/incidents?limit=150');

    expect(response.status).toBe(400);
    expect(response.body.details[0].field).toContain('limit');
  });

  it('should return 400 for non-numeric page', async () => {
    const response = await request(app)
      .get('/api/incidents?page=abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid query parameters');
  });

  it('should return 400 for non-numeric limit', async () => {
    const response = await request(app)
      .get('/api/incidents?limit=xyz');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid query parameters');
  });

  it('should handle multiple invalid params', async () => {
    const response = await request(app)
      .get('/api/incidents?type=invalid&severity=bad&page=0');

    expect(response.status).toBe(400);
    expect(response.body.details.length).toBeGreaterThanOrEqual(3);
  });

  it('should coerce string page/limit to numbers', async () => {
    const response = await request(app)
      .get('/api/incidents?page=2&limit=5');

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(5);
    expect(typeof response.body.page).toBe('number');
    expect(typeof response.body.limit).toBe('number');
  });

  it('should use defaults when query params omitted', async () => {
    const response = await request(app)
      .get('/api/incidents');

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
  });

  it('should handle boundary page beyond total', async () => {
    // Create only 3 incidents
    for (let i = 0; i < 3; i++) {
      await prisma.incident.create({
        data: {
          incident_type: 'ransomware',
          severity: 'high',
          playbook: {},
          regulatorische_meldungen: {},
          metadata: {},
        },
      });
    }

    const response = await request(app)
      .get('/api/incidents?page=10&limit=5');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.page).toBe(10);
    expect(response.body.data).toHaveLength(0); // No results on page 10
  });

  it('should return empty when filtering type/severity with no matches', async () => {
    await prisma.incident.create({
      data: {
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
      },
    });

    const response = await request(app)
      .get('/api/incidents?type=phishing&severity=critical');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.data).toEqual([]);
  });
});
