// Per-step data types (empty interfaces for Phase 2 — will be filled in Phases 3-5)
export interface EinstiegData {}

export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'

export interface ErfassenData {
  erkennungszeitpunkt: string
  erkannt_durch: 'it-mitarbeiter' | 'nutzer' | 'externes-system' | 'angreifer-kontakt' | 'sonstiges'
  betroffene_systeme: string[]
  erste_auffaelligkeiten?: string
  // Ransomware-specific
  loesegeld_meldung: boolean
  // Phishing-specific
  phishing_email_adresse?: string
  phishing_url?: string
  phishing_nutzer_anzahl?: string
  phishing_credentials_eingegeben?: 'ja' | 'nein'
  // DDoS-specific
  ddos_betroffene_dienste?: string
  ddos_beginn?: string
  ddos_bandbreite?: string
  // Datenverlust-specific
  datenverlust_art_daten?: string
  datenverlust_anzahl_datensaetze?: string
  datenverlust_extern_uebermittelt?: 'ja' | 'nein'
  // Unbefugter Zugriff-specific
  zugriff_angriffsvektor?: 'brute-force' | 'gestohlene-credentials' | 'insider'
  zugriff_betroffene_accounts?: string
  // Sonstiges-specific
  sonstiges_beschreibung?: string
}

export interface KlassifikationData {
  q1SystemeBetroffen: 'ja' | 'nein'
  q2PdBetroffen: 'ja' | 'nein'
  q3AngreiferAktiv: 'ja' | 'nein' | 'unbekannt'
  incidentType: IncidentType
  severity: 'KRITISCH' | 'HOCH' | 'MITTEL'
}
export interface ReaktionData {
  completedSteps: string[]
}
export interface KommunikationData {
  kritischeInfrastruktur: 'ja' | 'nein' | null
  personendatenBetroffen: 'ja' | 'nein' | null
  reguliertesUnternehmen: 'ja' | 'nein' | null
  kommChecklist: string[]
  templateGL?: string
  templateMitarbeitende?: string
  templateMedien?: string
}
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
