import type { WizardState } from './wizard-types'

/**
 * Compute a deadline by adding hours to a recognition timestamp.
 * Used for ISG (24h), FINMA (24h informal, 72h formal) deadlines.
 */
export function computeDeadline(erkennungszeitpunkt: string, hoursToAdd: number): Date {
  const base = new Date(erkennungszeitpunkt)
  return new Date(base.getTime() + hoursToAdd * 60 * 60 * 1000)
}

/**
 * Format a deadline date in de-CH locale with "Uhr" suffix.
 * Example: "Samstag, 04. Apr. 2026, 16:32 Uhr"
 */
export function formatDeadline(date: Date): string {
  return date.toLocaleString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' Uhr'
}

/**
 * Format an ISO date string for use in templates.
 * Returns placeholder if not available.
 */
function formatTemplateDate(isoString: string | undefined): string {
  if (!isoString) return '[Datum/Uhrzeit]'
  return new Date(isoString).toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate notification template for Geschaeftsleitung / Verwaltungsrat.
 * Dynamic: erkennungszeitpunkt, severity, betroffene_systeme, incidentType.
 * Static placeholders: [Firmenname], [Name des Ansprechpartners], [Ihre E-Mail], [Telefonnummer].
 */
export function generateGLTemplate(state: WizardState): string {
  const zeitpunkt = formatTemplateDate(state.erfassen?.erkennungszeitpunkt)
  const severity = state.klassifikation?.severity ?? '[Schweregrad]'
  const incidentType = state.klassifikation?.incidentType ?? '[Incident-Typ]'
  const systeme = state.erfassen?.betroffene_systeme?.length
    ? state.erfassen.betroffene_systeme.join(', ')
    : '[betroffene Systeme]'

  return `Dringende Meldung: Sicherheitsvorfall bei [Firmenname]

Sehr geehrte Mitglieder der Geschaeftsleitung,

hiermit informieren wir Sie ueber einen Sicherheitsvorfall der Kategorie ${incidentType} (Schweregrad: ${severity}).

Der Vorfall wurde am ${zeitpunkt} erkannt. Folgende Systeme sind betroffen: ${systeme}.

Sofortmassnahmen wurden eingeleitet:
- Betroffene Systeme wurden vom Netzwerk isoliert
- Das Incident-Response-Team ist aktiviert
- Forensische Sicherung ist in Vorbereitung

Naechste Schritte:
- Detaillierte Analyse des Angriffsvektors
- Pruefung der Meldepflichten (ISG, DSG, ggf. FINMA)
- Regelmaessige Lage-Updates an die Geschaeftsleitung

Wir empfehlen die Einberufung des Krisenstabs.

Bei Rueckfragen stehe ich zur Verfuegung.

Mit freundlichen Gruessen
[Name des Ansprechpartners]
[Ihre E-Mail]
[Telefonnummer]`
}

/**
 * Generate internal communication template for employees.
 * Shorter, less technical. Key messages: incident detected, do not use affected systems.
 */
export function generateMitarbeitendeTemplate(state: WizardState): string {
  const incidentType = state.klassifikation?.incidentType ?? '[Incident-Typ]'
  const severity = state.klassifikation?.severity ?? '[Schweregrad]'

  return `Wichtige Information: IT-Sicherheitsvorfall bei [Firmenname]

Liebe Kolleginnen und Kollegen,

wir moechten Sie darueber informieren, dass bei [Firmenname] ein IT-Sicherheitsvorfall (${incidentType}, Schweregrad: ${severity}) festgestellt wurde.

Bitte beachten Sie folgende Anweisungen:
- Nutzen Sie die betroffenen Systeme bis auf Weiteres NICHT
- Aendern Sie Ihre Passwoerter fuer alle Unternehmensanwendungen
- Oeffnen Sie keine verdaechtigen E-Mails oder Anhaenge
- Melden Sie ungewoehnliche Aktivitaeten sofort an die IT-Abteilung

Unser IT-Sicherheitsteam arbeitet mit Hochdruck an der Behebung. Wir werden Sie regelmaessig ueber den Fortschritt informieren.

Bei Fragen wenden Sie sich bitte an [Name des Ansprechpartners].

Vielen Dank fuer Ihr Verstaendnis und Ihre Mithilfe.`
}

/**
 * Generate press/public statement template.
 * Very formal. Dynamic: erkennungszeitpunkt (date only), incidentType.
 */
export function generateMedienTemplate(state: WizardState): string {
  const zeitpunkt = formatTemplateDate(state.erfassen?.erkennungszeitpunkt)
  const incidentType = state.klassifikation?.incidentType ?? '[Incident-Typ]'

  return `Medienmitteilung: IT-Sicherheitsvorfall bei [Firmenname]

[Firmenname] hat am ${zeitpunkt} einen IT-Sicherheitsvorfall (${incidentType}) festgestellt.

Unmittelbar nach Erkennung des Vorfalls wurden umfassende Sicherheitsmassnahmen eingeleitet. Ein spezialisiertes Incident-Response-Team ist im Einsatz, um den Vorfall zu analysieren und einzudaemmen.

Die zustaendigen Behoerden wurden informiert. [Firmenname] arbeitet eng mit externen Sicherheitsexperten zusammen.

Der Schutz der Daten unserer Kunden, Partner und Mitarbeitenden hat hoechste Prioritaet. Betroffene Personen werden umgehend und transparent informiert.

Weitere Informationen folgen, sobald die laufenden Untersuchungen dies zulassen.

Medienkontakt:
[Name des Ansprechpartners]
[Ihre E-Mail]
[Firmenname]`
}
