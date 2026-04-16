import { prisma } from '../config/prisma';
import { CreateIncidentInput, UpdateIncidentInput } from '../schemas/incident.schema';

export class IncidentService {
  // Create incident
  static async createIncident(input: CreateIncidentInput) {
    const incident = await prisma.incident.create({
      data: {
        incident_type: input.incident_type,
        severity: input.severity,
        description: input.description ?? null,
        erkennungszeitpunkt: input.erkennungszeitpunkt ?? null,
        erkannt_durch: input.erkannt_durch ?? null,
        erste_erkenntnisse: input.erste_erkenntnisse ?? null,
        betroffene_systeme: input.betroffene_systeme ?? [],
        q1: input.q1 !== undefined ? input.q1 : null,
        q2: input.q2 !== undefined ? input.q2 : null,
        q3: input.q3 !== undefined ? input.q3 : null,
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
    if (input.description !== undefined) data.description = input.description;
    if (input.erkennungszeitpunkt) data.erkennungszeitpunkt = input.erkennungszeitpunkt;
    if (input.erkannt_durch) data.erkannt_durch = input.erkannt_durch;
    if (input.erste_erkenntnisse) data.erste_erkenntnisse = input.erste_erkenntnisse;
    if (input.betroffene_systeme) data.betroffene_systeme = input.betroffene_systeme;
    if (input.q1 !== undefined) data.q1 = input.q1;
    if (input.q2 !== undefined) data.q2 = input.q2;
    if (input.q3 !== undefined) data.q3 = input.q3;
    if (input.playbook) data.playbook = input.playbook;
    if (input.regulatorische_meldungen) data.regulatorische_meldungen = input.regulatorische_meldungen;
    if (input.metadata) data.metadata = input.metadata;

    const updated = await prisma.incident.update({
      where: { id },
      data,
    });

    return updated;
  }

  // Soft delete incident by setting deletedAt timestamp
  static async deleteIncident(id: string) {
    const incident = await prisma.incident.findFirst({
      where: {
        id,
      },
    });

    if (!incident) {
      return null;
    }

    // Soft-delete by setting deletedAt timestamp
    const deleted = await prisma.incident.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return deleted;
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
