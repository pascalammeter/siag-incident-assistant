import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../src/api/config/prisma';

describe('Prisma Filtering Integration Tests', () => {
  afterEach(async () => {
    await prisma.incident.deleteMany({});
  });

  beforeEach(async () => {
    // Create test incidents
    await prisma.incident.create({
      data: {
        incident_type: 'ransomware',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
      },
    });

    await prisma.incident.create({
      data: {
        incident_type: 'ransomware',
        severity: 'high',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
      },
    });

    await prisma.incident.create({
      data: {
        incident_type: 'phishing',
        severity: 'critical',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
      },
    });

    await prisma.incident.create({
      data: {
        incident_type: 'ddos',
        severity: 'low',
        playbook: {},
        regulatorische_meldungen: {},
        metadata: {},
      },
    });
  });

  it('should filter by type only', async () => {
    const incidents = await prisma.incident.findMany({
      where: {
        deletedAt: null,
        incident_type: 'ransomware',
      },
    });

    expect(incidents).toHaveLength(2);
    expect(incidents.every(i => i.incident_type === 'ransomware')).toBe(true);
  });

  it('should filter by severity only', async () => {
    const incidents = await prisma.incident.findMany({
      where: {
        deletedAt: null,
        severity: 'critical',
      },
    });

    expect(incidents).toHaveLength(2);
    expect(incidents.every(i => i.severity === 'critical')).toBe(true);
  });

  it('should filter by both type and severity', async () => {
    const incidents = await prisma.incident.findMany({
      where: {
        deletedAt: null,
        incident_type: 'ransomware',
        severity: 'critical',
      },
    });

    expect(incidents).toHaveLength(1);
    expect(incidents[0].incident_type).toBe('ransomware');
    expect(incidents[0].severity).toBe('critical');
  });

  it('should exclude soft-deleted incidents', async () => {
    const firstIncident = await prisma.incident.findFirst({
      where: { incident_type: 'ransomware' },
    });

    await prisma.incident.update({
      where: { id: firstIncident!.id },
      data: { deletedAt: new Date() },
    });

    const incidents = await prisma.incident.findMany({
      where: {
        deletedAt: null,
        incident_type: 'ransomware',
      },
    });

    expect(incidents).toHaveLength(1);
  });

  it('should paginate with skip and take', async () => {
    const page1 = await prisma.incident.findMany({
      where: { deletedAt: null },
      skip: 0,
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    const page2 = await prisma.incident.findMany({
      where: { deletedAt: null },
      skip: 2,
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    expect(page1).toHaveLength(2);
    expect(page2).toHaveLength(2);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  it('should order by createdAt descending', async () => {
    const incidents = await prisma.incident.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    expect(incidents).toHaveLength(4);
    for (let i = 0; i < incidents.length - 1; i++) {
      expect(new Date(incidents[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(incidents[i + 1].createdAt).getTime()
      );
    }
  });

  it('should count with filters', async () => {
    const total = await prisma.incident.count({
      where: {
        deletedAt: null,
        incident_type: 'ransomware',
      },
    });

    expect(total).toBe(2);
  });
});
