import { z } from 'zod';

export const createIncidentSchema = z.object({
  erkennungszeitpunkt: z.string().datetime(),
  erkannt_durch: z.string().min(1).max(255),
  betroffene_systeme: z.array(z.string()).min(1),
  erste_erkenntnisse: z.string().optional(),
  incident_type: z.enum(['ransomware', 'phishing', 'ddos', 'data_loss', 'other']).optional(),
  q1: z.number().int().min(0).max(1).optional(),
  q2: z.number().int().min(0).max(1).optional(),
  q3: z.number().int().min(0).max(1).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

export const updateIncidentSchema = createIncidentSchema.partial();

export type CreateIncidentRequest = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentRequest = z.infer<typeof updateIncidentSchema>;
