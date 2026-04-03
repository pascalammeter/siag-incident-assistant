// Per-step data types (empty interfaces for Phase 2 — will be filled in Phases 3-5)
export interface EinstiegData {}

export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'

export interface ErfassenData {
  erkennungszeitpunkt: string
  erkannt_durch: 'it-mitarbeiter' | 'nutzer' | 'externes-system' | 'angreifer-kontakt' | 'sonstiges'
  betroffene_systeme: string[]
  erste_auffaelligkeiten?: string
  loesegeld_meldung: boolean
}

export interface KlassifikationData {
  q1SystemeBetroffen: 'ja' | 'nein'
  q2PdBetroffen: 'ja' | 'nein'
  q3AngreiferAktiv: 'ja' | 'nein' | 'unbekannt'
  incidentType: IncidentType
  severity: 'KRITISCH' | 'HOCH' | 'MITTEL'
}
export interface ReaktionData {}
export interface KommunikationData {}
export interface DokumentationData {}

export type StepKey = 'einstieg' | 'erfassen' | 'klassifikation' | 'reaktion' | 'kommunikation' | 'dokumentation'

export type WizardState = {
  currentStep: number           // 0 = No-Go Interstitial, 1-6 = wizard steps
  noGoConfirmed: boolean
  einstieg: EinstiegData | null
  erfassen: ErfassenData | null
  klassifikation: KlassifikationData | null
  reaktion: ReaktionData | null
  kommunikation: KommunikationData | null
  dokumentation: DokumentationData | null
}

export type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'CONFIRM_NO_GO' }
  | { type: 'UPDATE_STEP'; stepKey: StepKey; data: unknown }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; data: WizardState }

export const MAX_STEP = 6
export const MIN_STEP = 0

export const STEP_LABELS: string[] = [
  'Vorbereitung',      // Step 0: No-Go Interstitial
  'Einstieg',          // Step 1
  'Erfassen',          // Step 2
  'Klassifikation',    // Step 3
  'Reaktion',          // Step 4
  'Kommunikation',     // Step 5
  'Dokumentation',     // Step 6
]

export const initialState: WizardState = {
  currentStep: 0,
  noGoConfirmed: false,
  einstieg: null,
  erfassen: null,
  klassifikation: null,
  reaktion: null,
  kommunikation: null,
  dokumentation: null,
}
