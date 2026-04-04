import { z } from 'zod'
import type { StepKey } from './wizard-types'

// Phase 2: Empty placeholder schemas — will be filled with real fields in Phases 3-5
export const einstiegSchema = z.object({})
export const erfassenSchema = z.object({})
export const klassifikationSchema = z.object({})
export const reaktionSchema = z.object({
  completedSteps: z.array(z.string()).default([]),
})
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
  erfassen: erfassenSchema,
  klassifikation: klassifikationSchema,
  reaktion: reaktionSchema,
  kommunikation: kommunikationSchema,
  dokumentation: dokumentationSchema,
}
