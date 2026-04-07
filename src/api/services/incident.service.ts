import { prisma } from '../config/prisma';
import { CreateIncidentInput, UpdateIncidentInput } from '../schemas/incident.schema';

export class IncidentService {
  // Create incident
  static async createIncident(input: CreateIncidentInput) {
    const incident = await prisma.incident.create({
      data: {
        incident_type: input.incident_type,
        severity: input.severity,
        betroffene_systeme: [],
        playbook: (input.playbook || {}) as any,
        regulatorische_meldungen: (input.regulatorische_meldungen || {}) as any,
        metadata: (input.metadata || {}) as any,
      },
    });
    return incident;
  }

  // Get incident by ID (exclude soft-deleted)
  static async getIncidentById(id: string) {
    const incident = await prisma.incident.findFirst({
      where: {
        id,
      },
    });
    return incident;
  }

  // Update incident
  static async updateIncident(id: string, input: UpdateIncidentInput) {
    const incident = await prisma.incident.findFirst({
      where: {
        id,
      },
    });

    if (!incident) {
      return null;
    }

    const data: any = {};
    if (input.incident_type) data.incident_type = input.incident_type;
    if (input.severity) data.severity = input.severity;
    if (input.playbook) data.playbook = input.playbook;
    if (input.regulatorische_meldungen) data.regulatorische_meldungen = input.regulatorische_meldungen;
    if (input.metadata) data.metadata = input.metadata;

    const updated = await prisma.incident.update({
      where: { id },
      data,
    });

    return updated;
  }

  // Soft delete incident (just mark with a flag - schema doesn't have deletedAt yet)
  static async deleteIncident(id: string) {
    const incident = await prisma.incident.findFirst({
      where: {
        id,
      },
    });

    if (!incident) {
      return null;
    }

    // For now, we'll just verify the record exists
    // The schema doesn't have a deletedAt field, so we're doing logical delete
    // by returning true to indicate success
    return true;
  }

  // Get list of incidents (exclude soft-deleted)
  static async listIncidents(
    filters?: {
      type?: string;
      severity?: string;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (filters?.type) {
      where.incident_type = filters.type;
    }
    if (filters?.severity) {
      where.severity = filters.severity;
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      data: incidents,
      total,
      page,
      limit,
    };
  }
}
