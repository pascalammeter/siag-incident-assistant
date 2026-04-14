import { z } from 'zod';

// Enum schemas
export const IncidentTypeSchema = z.enum([
  'ransomware',
  'phishing',
  'ddos',
  'data_loss',
  'datenverlust',
  'other',
]);

export const SeveritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);

// Create Incident Input Schema
export const CreateIncidentInputSchema = z.object({
  // Core fields
  incident_type: IncidentTypeSchema,
  severity: SeveritySchema,
  description: z.string().min(10).max(5000).optional(),

  // Wizard Recognition (Erkennung) fields
  erkennungszeitpunkt: z.string().datetime().optional(),
  erkannt_durch: z.string().min(1).max(255).optional(),
  betroffene_systeme: z.array(z.string()).min(1).optional(),
  erste_erkenntnisse: z.string().optional(),

  // Wizard Classification (Klassifizierung) fields
  q1: z.number().int().min(0).max(1).optional(),
  q2: z.number().int().min(0).max(1).optional(),
  q3: z.number().int().min(0).max(1).optional(),

  // Playbook & metadata
  playbook: z.record(z.string(), z.unknown()).optional(),
  regulatorische_meldungen: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update Incident Input Schema (all fields optional)
export const UpdateIncidentInputSchema = CreateIncidentInputSchema.partial();

// Type exports
export type CreateIncidentInput = z.infer<typeof CreateIncidentInputSchema>;
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentInputSchema>;

// Query params for list endpoint
export const ListIncidentsQuerySchema = z.object({
  type: IncidentTypeSchema.optional(),
  severity: SeveritySchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10), // max 50 per page to limit payload size
});

export type ListIncidentsQuery = z.infer<typeof ListIncidentsQuerySchema>;
