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
  erkennungszeitpunkt: z
    .string()
    .min(1, 'Erkennungszeitpunkt ist erforderlich.')
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      'Bitte geben Sie ein gueltiges Datum und eine Uhrzeit ein.'
    ),
  erkannt_durch: z.enum(
    ['it-mitarbeiter', 'nutzer', 'externes-system', 'angreifer-kontakt', 'sonstiges'],
    { error: 'Bitte waehlen Sie aus, durch wen der Vorfall erkannt wurde.' }
  ),
  betroffene_systeme: z.array(z.string()).default([]),
  erste_auffaelligkeiten: z.string().optional(),
  // Ransomware-specific
  loesegeld_meldung: z.boolean().default(false),
  // Phishing-specific
  phishing_email_adresse: z.string().optional(),
  phishing_url: z.string().optional(),
  phishing_nutzer_anzahl: z.string().optional(),
  phishing_credentials_eingegeben: z.enum(['ja', 'nein']).optional(),
  // DDoS-specific
  ddos_betroffene_dienste: z.string().optional(),
  ddos_beginn: z.string().optional(),
  ddos_bandbreite: z.string().optional(),
  // Datenverlust-specific
  datenverlust_art_daten: z.string().optional(),
  datenverlust_anzahl_datensaetze: z.string().optional(),
  datenverlust_extern_uebermittelt: z.enum(['ja', 'nein']).optional(),
  // Unbefugter Zugriff-specific
  zugriff_angriffsvektor: z.enum(['brute-force', 'gestohlene-credentials', 'insider']).optional(),
  zugriff_betroffene_accounts: z.string().optional(),
  // Sonstiges-specific
  sonstiges_beschreibung: z.string().optional(),
})

export const klassifikationSchema = z.object({
  q1SystemeBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte beantwortet Sie diese Frage.' }),
  q2PdBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte beantwortet Sie diese Frage.' }),
  q3AngreiferAktiv: z.enum(['ja', 'nein', 'unbekannt'], { error: 'Bitte beantwortet Sie diese Frage.' }),
  incidentType: z.enum(
    ['ransomware', 'phishing', 'ddos', 'datenverlust', 'unbefugter-zugriff', 'sonstiges'],
    { error: 'Bitte waehlen Sie einen Incident-Typ.' }
  ),
  severity: z.enum(['KRITISCH', 'HOCH', 'MITTEL'], { error: 'Bitte waehlen Sie eine Schweregrad.' }),
})

export const reaktionSchema = z.object({
  completedSteps: z.array(z.string()).default([]),
})
export const kommunikationSchema = z.object({
  kritischeInfrastruktur: z.enum(['ja', 'nein']).nullable().default(null),
  personendatenBetroffen: z.enum(['ja', 'nein']).nullable().default(null),
  reguliertesUnternehmen: z.enum(['ja', 'nein']).nullable().default(null),
  kommChecklist: z.array(z.string()).default([]),
  templateGL: z.string().optional(),
  templateMitarbeitende: z.string().optional(),
  templateMedien: z.string().optional(),
})
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
