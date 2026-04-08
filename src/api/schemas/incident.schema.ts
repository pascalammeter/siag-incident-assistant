import { z } from 'zod';

// Enum schemas
export const IncidentTypeSchema = z.enum([
  'ransomware',
  'phishing',
  'ddos',
  'data_loss',
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
  incident_type: IncidentTypeSchema,
  severity: SeveritySchema,
  description: z.string().min(10).max(5000).optional(),
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
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ListIncidentsQuery = z.infer<typeof ListIncidentsQuerySchema>;
