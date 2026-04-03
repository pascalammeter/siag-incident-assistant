import { z } from 'zod'
import type { StepKey } from './wizard-types'

// Severity calculation logic (per D-01: Q3 "unbekannt" escalates to KRITISCH)
export function calculateSeverity(
  q1: 'ja' | 'nein',
  q2: 'ja' | 'nein',
  q3: 'ja' | 'nein' | 'unbekannt'
): 'KRITISCH' | 'HOCH' | 'MITTEL' {
  if (q1 === 'ja' || q3 === 'ja' || q3 === 'unbekannt') return 'KRITISCH'
  if (q2 === 'ja') return 'HOCH'
  return 'MITTEL'
}

// Phase 3: Real field schemas for Screens 2 and 3
export const einstiegSchema = z.object({})

export const erfassenSchema = z.object({
  erkennungszeitpunkt: z.string().min(1, 'Bitte geben Sie ein gueltiges Datum und eine Uhrzeit ein.'),
  erkannt_durch: z.enum(
    ['it-mitarbeiter', 'nutzer', 'externes-system', 'angreifer-kontakt', 'sonstiges'],
    { error: 'Bitte waehlen Sie eine Option.' }
  ),
  betroffene_systeme: z.array(z.string()).default([]),
  erste_auffaelligkeiten: z.string().optional(),
  loesegeld_meldung: z.boolean().default(false),
})

export const klassifikationSchema = z.object({
  q1SystemeBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte waehlen Sie eine Option.' }),
  q2PdBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte waehlen Sie eine Option.' }),
  q3AngreiferAktiv: z.enum(['ja', 'nein', 'unbekannt'], { error: 'Bitte waehlen Sie eine Option.' }),
  incidentType: z.enum(
    ['ransomware', 'phishing', 'ddos', 'datenverlust', 'unbefugter-zugriff', 'sonstiges'],
    { error: 'Bitte waehlen Sie einen Incident-Typ.' }
  ),
  severity: z.enum(['KRITISCH', 'HOCH', 'MITTEL']),
})

export const reaktionSchema = z.object({})
export const kommunikationSchema = z.object({})
export const dokumentationSchema = z.object({})

// Type inference helpers for step components
export type EinstiegFormData = z.infer<typeof einstiegSchema>
export type ErfassenFormData = z.infer<typeof erfassenSchema>
export type KlassifikationFormData = z.infer<typeof klassifikationSchema>
export type ReaktionFormData = z.infer<typeof reaktionSchema>
export type KommunikationFormData = z.infer<typeof kommunikationSchema>
export type DokumentationFormData = z.infer<typeof dokumentationSchema>

// Schema lookup by step key
export const stepSchemas: Record<StepKey, z.ZodObject<z.ZodRawShape>> = {
  einstieg: einstiegSchema,
  erfassen: erfassenSchema as z.ZodObject<z.ZodRawShape>,
  klassifikation: klassifikationSchema as z.ZodObject<z.ZodRawShape>,
  reaktion: reaktionSchema,
  kommunikation: kommunikationSchema,
  dokumentation: dokumentationSchema,
}
